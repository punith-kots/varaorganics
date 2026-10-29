"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/features/cart/store";
import { computeTotals, COD_FEE } from "@/features/cart/selectors";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/checkout";
import { openRazorpayCheckout } from "@/features/payments/client";
import { useConsentTracking } from "@/lib/analytics/useConsentTracking";
import { trackBeginCheckout, pushDataLayer, analyticsConsented } from "@/lib/analytics/events";
import { formatPrice } from "@/lib/utils";
import { Field, inputClass, ErrorSummary } from "@/components/forms/Field";
import { useHydrated } from "@/lib/useHydrated";
import { SMS_CONSENT_TEXT } from "@/features/orders/consent";
import type { CheckoutResult } from "@/features/payments/service";

const paymentMethods = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Credit / Debit Card" },
  { value: "netbanking", label: "Net Banking" },
  { value: "wallet", label: "Wallets" },
  { value: "cod", label: "Cash on Delivery" },
] as const;

/** Checkout form (RHF + Zod). Posts to the server which recomputes totals. */
export function CheckoutForm({
  freeThreshold,
  skuMap = {},
}: {
  freeThreshold: number;
  skuMap?: Record<string, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, clear } = useCart();
  const hydrated = useHydrated();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: "India", paymentMethod: "upi", smsOptIn: false },
  });

  useConsentTracking(
    () =>
      hydrated &&
      trackBeginCheckout(items.map((i) => ({ ...i, sku: skuMap[i.variantId] ?? i.sku }))),
    "checkout",
  );

  if (!hydrated) return <p className="text-navy/50 py-16">Loading checkout…</p>;
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-navy/60 mb-4">Your cart is empty.</p>
        <Link href="/shop" className="text-amber underline">
          Shop products
        </Link>
      </div>
    );
  }

  const codFee = watch("paymentMethod") === "cod" ? COD_FEE : 0;
  const totals = computeTotals(items, freeThreshold, { codFee });
  const errorList = Object.entries(errors).map(([field, e]) => ({
    field,
    message: (e as { message?: string }).message ?? "Invalid",
  }));

  async function onSubmit(values: CheckoutInput) {
    setSubmitError(null);
    setProcessing(true);
    pushDataLayer("klaviyo_identify", { email: values.email });

    const payload = {
      customer: values,
      analyticsConsent: analyticsConsented(),
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      utm: {
        source: searchParams.get("utm_source") ?? undefined,
        medium: searchParams.get("utm_medium") ?? undefined,
        campaign: searchParams.get("utm_campaign") ?? undefined,
      },
    };

    const endpoint = values.paymentMethod === "cod" ? "/api/orders/cod" : "/api/razorpay/order";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as CheckoutResult & {
        ok: boolean;
        code?: string;
        message?: string;
      };
      if (!data.ok) {
        // A stale cart (e.g. an item added before a catalogue change, or from an
        // older mock-data session) references a variant that no longer exists.
        // Self-heal: clear it and tell the customer to re-add, rather than
        // showing a cryptic "Unknown item" id.
        if (data.code === "invalid_item") {
          clear();
          setSubmitError(
            "Some items in your cart are no longer available and have been removed. Please add your products again from the shop.",
          );
        } else {
          setSubmitError(data.message ?? "Could not place your order.");
        }
        setProcessing(false);
        return;
      }

      if (data.kind === "cod") {
        clear();
        router.push(`/order-confirmed/${data.orderId}`);
        return;
      }

      await openRazorpayCheckout(
        data,
        { name: values.fullName, email: values.email, contact: values.phone },
        (orderId) => {
          clear();
          router.push(`/order-confirmed/${orderId}`);
        },
        (message) => {
          setSubmitError(message);
          setProcessing(false);
        },
      );
    } catch {
      setSubmitError("Network error. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-10 lg:grid-cols-[1fr_360px]"
    >
      <div>
        <ErrorSummary errors={errorList} />

        <fieldset className="mb-8">
          <legend className="text-navy mb-4 font-serif text-xl font-semibold">Contact</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
              <input
                id="fullName"
                className={inputClass(!!errors.fullName)}
                {...register("fullName")}
              />
            </Field>
            <Field label="Email" htmlFor="email" required error={errors.email?.message}>
              <input
                id="email"
                type="email"
                className={inputClass(!!errors.email)}
                {...register("email")}
              />
            </Field>
            <Field label="Phone" htmlFor="phone" required error={errors.phone?.message}>
              <input
                id="phone"
                inputMode="tel"
                className={inputClass(!!errors.phone)}
                {...register("phone")}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="mb-8">
          <legend className="text-navy mb-4 font-serif text-xl font-semibold">
            Delivery address
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Address line 1"
              htmlFor="addressLine1"
              required
              error={errors.addressLine1?.message}
              className="sm:col-span-2"
            >
              <input
                id="addressLine1"
                className={inputClass(!!errors.addressLine1)}
                {...register("addressLine1")}
              />
            </Field>
            <Field
              label="Address line 2"
              htmlFor="addressLine2"
              error={errors.addressLine2?.message}
              className="sm:col-span-2"
            >
              <input
                id="addressLine2"
                className={inputClass(!!errors.addressLine2)}
                {...register("addressLine2")}
              />
            </Field>
            <Field label="Landmark" htmlFor="landmark" error={errors.landmark?.message}>
              <input
                id="landmark"
                className={inputClass(!!errors.landmark)}
                {...register("landmark")}
              />
            </Field>
            <Field label="City" htmlFor="city" required error={errors.city?.message}>
              <input id="city" className={inputClass(!!errors.city)} {...register("city")} />
            </Field>
            <Field label="State" htmlFor="state" required error={errors.state?.message}>
              <input id="state" className={inputClass(!!errors.state)} {...register("state")} />
            </Field>
            <Field
              label="PIN code"
              htmlFor="postalCode"
              required
              error={errors.postalCode?.message}
            >
              <input
                id="postalCode"
                inputMode="numeric"
                className={inputClass(!!errors.postalCode)}
                {...register("postalCode")}
              />
            </Field>
            <Field label="Country" htmlFor="country" required error={errors.country?.message}>
              <input id="country" readOnly className={inputClass(false)} {...register("country")} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="mb-8">
          <legend className="text-navy mb-4 font-serif text-xl font-semibold">
            Payment method
          </legend>
          <div className="space-y-2">
            {paymentMethods.map((m) => (
              <label
                key={m.value}
                className="border-navy/15 has-[:checked]:border-navy has-[:checked]:bg-navy/[0.03] flex cursor-pointer items-center gap-3 rounded border px-4 py-3 text-sm"
              >
                <input
                  type="radio"
                  value={m.value}
                  {...register("paymentMethod")}
                  className="accent-navy"
                />
                {m.label}
              </label>
            ))}
          </div>
          {errors.paymentMethod && (
            <p className="text-danger mt-1 text-xs">{errors.paymentMethod.message}</p>
          )}
        </fieldset>

        <div className="mb-8">
          <label
            htmlFor="smsOptIn"
            className="text-navy flex cursor-pointer items-start gap-3 text-sm leading-relaxed"
          >
            <input
              id="smsOptIn"
              type="checkbox"
              className="accent-navy mt-1 h-4 w-4 shrink-0"
              aria-describedby="smsOptIn-help"
              {...register("smsOptIn")}
            />
            <span>{SMS_CONSENT_TEXT}</span>
          </label>
          <p id="smsOptIn-help" className="text-navy/60 mt-2 pl-7 text-xs">
            Optional. You can place your order without opting in.
          </p>
        </div>
        <Field label="Order notes (optional)" htmlFor="notes" error={errors.notes?.message}>
          <textarea
            id="notes"
            rows={3}
            className={inputClass(!!errors.notes)}
            {...register("notes")}
          />
        </Field>
      </div>

      <aside className="border-navy/10 bg-paper/40 h-fit rounded border p-6">
        <h2 className="text-navy mb-4 font-serif text-xl font-semibold">Order Summary</h2>
        <ul className="mb-4 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.variantId} className="text-navy/70 flex justify-between gap-2">
              <span>
                {i.productName} · {i.size} × {i.quantity}
              </span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="border-navy/10 space-y-2 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy/60">Subtotal</dt>
            <dd className="text-navy font-medium">{formatPrice(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy/60">Shipping</dt>
            <dd className="text-navy font-medium">
              {totals.shipping - codFee === 0 ? "Free" : formatPrice(totals.shipping - codFee)}
            </dd>
          </div>
          {codFee > 0 && (
            <div className="flex justify-between">
              <dt>COD charges:</dt>
              <dd>{formatPrice(codFee)}</dd>
            </div>
          )}
          <div className="border-navy/10 flex justify-between border-t pt-2 text-base">
            <dt className="text-navy font-medium">Total</dt>
            <dd className="text-navy font-serif text-xl font-semibold">
              {formatPrice(totals.total)}
            </dd>
          </div>
        </dl>
        {submitError && (
          <p role="alert" className="bg-danger/5 text-danger mt-4 rounded p-3 text-sm">
            {submitError}
          </p>
        )}
        <button
          type="submit"
          disabled={processing}
          className="bg-navy text-ivory hover:bg-amber mt-6 w-full rounded-[2px] px-8 py-4 text-xs font-semibold tracking-[0.16em] uppercase transition-colors disabled:opacity-60"
        >
          {processing ? "Processing…" : "Place Order"}
        </button>
        <p className="text-navy/45 mt-3 text-center text-[11px] font-light">
          Prices are re-verified securely before payment.
        </p>
      </aside>
    </form>
  );
}
