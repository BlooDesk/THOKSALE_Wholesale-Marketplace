export default function SellerLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-10">
      <div className="h-4 w-32 skel mb-3" />
      <div className="h-9 w-1/2 skel mb-8" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 skel" />)}
      </div>
      <div className="h-96 skel" />
    </div>
  )
}
