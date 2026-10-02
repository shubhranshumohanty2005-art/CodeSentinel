export default function SkeletonLoader() {
  return (
    <div className="animate-pulse p-6 bg-navy-800/40 rounded-xl border border-white/5 w-full">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-white/10 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
          <div className="h-3 bg-white/5 rounded w-1/3"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-white/10 rounded w-full"></div>
        <div className="h-3 bg-white/10 rounded w-5/6"></div>
        <div className="h-3 bg-white/10 rounded w-4/6"></div>
        <div className="h-3 bg-white/10 rounded w-full mt-4"></div>
        <div className="h-3 bg-white/10 rounded w-3/4"></div>
      </div>
      <div className="mt-8 space-y-3">
        <div className="h-24 bg-white/5 rounded w-full"></div>
      </div>
    </div>
  );
}
