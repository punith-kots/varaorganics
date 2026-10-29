import { formatPrice } from "@/lib/utils";
import { site } from "@/config/site";
import type { Order } from "@/types";
import { PrintInvoice } from "./PrintInvoice";

export function OrderInvoice({ order }: { order: Order }) {
  const codFee = order.codFee ?? 0;
  const delivery = order.shippingAmount - codFee;
  return (
    <section id="order-invoice" className="text-navy mx-auto max-w-3xl bg-white p-8">
      <style>{`@media print { body * { visibility: hidden; } #order-invoice, #order-invoice * { visibility: visible; } #order-invoice { position: absolute; top: 0; left: 0; width: 100%; } }`}</style>
      <h1 className="font-serif text-3xl">Order invoice</h1>
      <p className="mt-3 font-semibold">
        {site.legalName} · {site.name}
      </p>
      <p>FSSAI: {site.fssaiLicence}</p>
      <p className="mt-4">Order: {order.orderNumber}</p>
      <p>Date: {order.createdAt.slice(0, 10)}</p>
      <p>
        Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid"} ·{" "}
        {order.paymentStatus === "paid" ? "Paid" : "Payment pending"}
      </p>
      <h2 className="mt-6 font-semibold">Bill / deliver to</h2>
      <p>{order.address.fullName}</p>
      <p>
        {order.address.addressLine1} {order.address.addressLine2}
      </p>
      <p>
        {order.address.city}, {order.address.state} {order.address.postalCode}
      </p>
      <table className="my-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-3">Product</th>
            <th>Qty</th>
            <th>Unit price</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr className="border-b" key={`${item.sku}-${index}`}>
              <td className="py-3">
                {item.productName} · {item.size}
              </td>
              <td>{item.quantity}</td>
              <td>{formatPrice(item.unitPrice)}</td>
              <td className="text-right">{formatPrice(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="ml-auto max-w-sm space-y-2">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatPrice(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{delivery === 0 ? "Free" : formatPrice(delivery)}</dd>
        </div>
        {codFee > 0 && (
          <div className="flex justify-between">
            <dt>COD charges:</dt>
            <dd>{formatPrice(codFee)}</dd>
          </div>
        )}
        {order.taxAmount > 0 && (
          <div className="flex justify-between">
            <dt>Tax</dt>
            <dd>{formatPrice(order.taxAmount)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t pt-3 font-semibold">
          <dt>Total</dt>
          <dd>{formatPrice(order.totalAmount)}</dd>
        </div>
      </dl>
      <PrintInvoice />
    </section>
  );
}
