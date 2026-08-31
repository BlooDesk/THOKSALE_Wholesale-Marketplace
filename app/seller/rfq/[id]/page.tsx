// Seller RFQ detail reuses /rfq/[id]
import { redirect } from 'next/navigation'
export default async function SellerRfqDetail(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  redirect(`/rfq/${id}`)
}
