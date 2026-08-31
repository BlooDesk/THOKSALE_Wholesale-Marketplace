export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] w-full grid place-items-center px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="h-6 w-1/2 skel" />
        <div className="h-4 w-full skel" />
        <div className="h-4 w-5/6 skel" />
        <div className="h-4 w-4/6 skel" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="h-24 skel" />
          <div className="h-24 skel" />
        </div>
      </div>
    </div>
  )
}
