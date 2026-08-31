export default function CartLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-10">
      <div className="h-9 w-1/3 skel mb-8" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 skel" />)}
        </div>
        <div className="h-72 skel" />
      </div>
    </div>
  )
}
