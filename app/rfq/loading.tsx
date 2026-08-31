export default function RfqLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-10">
      <div className="h-9 w-1/3 skel mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 skel" />)}
      </div>
    </div>
  )
}
