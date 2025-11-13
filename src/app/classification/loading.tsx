export default function ClassificationLoading() {
  return (
    <div className="container py-8 max-w-7xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
