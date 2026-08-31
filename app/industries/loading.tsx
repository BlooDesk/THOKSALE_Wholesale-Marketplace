export default function IndustriesLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="h-4 w-32 skel mb-3" />
      <div className="h-10 w-1/2 skel mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded-2xl skel" />
        ))}
      </div>
    </div>
  )
}
