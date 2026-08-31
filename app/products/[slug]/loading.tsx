export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="h-4 w-1/3 skel mb-6" />
      <div className="grid gap-6 md:gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="aspect-square md:aspect-[4/3] skel" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square skel" />)}
          </div>
          <div className="space-y-3 pt-2">
            <div className="h-4 w-24 skel" />
            <div className="h-8 w-3/4 skel" />
            <div className="h-4 w-full skel" />
            <div className="h-4 w-5/6 skel" />
            <div className="h-4 w-4/6 skel" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-40 skel" />
          <div className="h-64 skel" />
        </div>
      </div>
    </div>
  )
}
