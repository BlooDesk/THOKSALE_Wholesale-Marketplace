export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="h-4 w-32 skel mb-3" />
      <div className="h-10 w-64 skel mb-6" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filter sidebar */}
        <aside className="hidden lg:block space-y-4">
          <div className="h-8 w-24 skel" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 skel" />
              <div className="h-10 w-full skel" />
            </div>
          ))}
        </aside>
        {/* Grid */}
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card p-2 sm:p-3 space-y-3">
                <div className="aspect-square skel" />
                <div className="h-3 w-16 skel" />
                <div className="h-5 w-full skel" />
                <div className="h-5 w-2/3 skel" />
                <div className="flex justify-between pt-2">
                  <div className="h-6 w-24 skel" />
                  <div className="h-6 w-14 skel" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
