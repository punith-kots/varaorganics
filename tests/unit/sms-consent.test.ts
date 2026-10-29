// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { Order } from "@/types";
import { SMS_CONSENT_TEXT, smsConsentRecord } from "@/features/orders/consent";

const db = vi.hoisted(() => ({ row: {} as Record<string, unknown> }));
vi.mock("@/lib/validation/env", () => ({ USE_MOCK_DATA: false }));
vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabase: () => ({
    from: (table: string) => ({
      insert: async (row: Record<string, unknown>) => {
        if (table === "orders") db.row = row;
        return { error: null };
      },
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: db.row, error: null }) }) }),
    }),
  }),
}));
import { saveOrder, getOrder } from "@/features/orders/store";

describe("SMS order consent persistence", () => {
  it.each([true, false, undefined])(
    "round-trips choice %s through database fields",
    async (choice) => {
      const consent = smsConsentRecord(choice, "2026-10-04T04:00:00.000Z");
      const order = {
        id: "consent-test",
        items: [],
        utm: {},
        ...consent,
      } as unknown as Order;
      await saveOrder(order, "consent-key");
      expect(db.row.sms_opt_in).toBe(choice === true);
      expect(db.row.sms_opt_in_at).toBe(choice === true ? "2026-10-04T04:00:00.000Z" : null);
      expect(db.row.sms_consent_text).toBe(choice === true ? SMS_CONSENT_TEXT : null);
      expect(await getOrder(order.id)).toMatchObject(consent);
    },
  );

  it("treats historical orders without consent fields as opted out", async () => {
    db.row = { id: "old-order" };
    expect(await getOrder("old-order")).toMatchObject({
      smsOptIn: false,
      smsOptInAt: null,
      smsConsentText: null,
    });
  });
});

it("round-trips the COD fee and treats old orders as no-fee", async () => {
  await saveOrder({ id: "cod-fee", items: [], utm: {}, codFee: 99 } as unknown as Order, "fee");
  expect(db.row.cod_fee).toBe(99);
  expect(await getOrder("cod-fee")).toMatchObject({ codFee: 99 });
  db.row = { id: "old" };
  expect(await getOrder("old")).toMatchObject({ codFee: 0 });
});
