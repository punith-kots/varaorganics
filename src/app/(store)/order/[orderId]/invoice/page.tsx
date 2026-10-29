import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrder } from "@/features/orders/store";
import { OrderInvoice } from "@/components/checkout/OrderInvoice";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Order invoice",
  robots: { index: false, follow: false },
};
export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  if (!order || (order.paymentStatus !== "paid" && order.paymentStatus !== "cod_pending"))
    notFound();
  return <OrderInvoice order={order} />;
}
