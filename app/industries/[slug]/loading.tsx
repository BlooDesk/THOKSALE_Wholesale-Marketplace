export default function IndustryDetailLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="h-4 w-1/3 skel mb-4" />
      <div className="h-12 w-2/3 skel mb-6" />
      <div className="h-4 w-full skel mb-2" /><div className="h-4 w-5/6 skel mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card p-2 space-y-3">
            <div className="aspect-square skel" />
            <div className="h-4 w-full skel" /><div className="h-4 w-2/3 skel" />
          </div>
        ))}
      </div>
    </div>
  )
}
