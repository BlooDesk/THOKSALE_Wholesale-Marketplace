export default function AdminLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-10">
      <div className="h-9 w-1/3 skel mb-8" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 skel" />)}
      </div>
    </div>
  )
}
