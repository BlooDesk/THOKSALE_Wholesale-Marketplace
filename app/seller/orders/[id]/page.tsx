// Seller order-detail page just reuses the /orders/[id] page (same route file).
// We redirect /seller/orders/[id] -> /orders/[id] to avoid duplication.
import { redirect } from 'next/navigation'

export default async function SellerOrderDetail(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  redirect(`/orders/${id}`)
}
