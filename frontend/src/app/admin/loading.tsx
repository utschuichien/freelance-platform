import React from 'react';

export default function AdminLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse p-4 md:p-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#3a3a3a]">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-[#333333] rounded-lg"></div>
          <div className="h-4 w-80 bg-[#2d2d2d] rounded-md"></div>
        </div>
        <div className="h-10 w-36 bg-[#333333] rounded-xl"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#1e1e1e]/60 border border-[#333333]/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-[#333333] rounded"></div>
              <div className="h-9 w-9 bg-[#2d2d2d] rounded-xl"></div>
            </div>
            <div className="h-8 w-36 bg-[#3a3a3a] rounded-lg"></div>
            <div className="h-3 w-24 bg-[#2d2d2d] rounded"></div>
          </div>
        ))}
      </div>

      {/* Admin Table Skeleton */}
      <div className="rounded-2xl bg-[#1e1e1e]/60 border border-[#333333]/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-[#333333] rounded"></div>
          <div className="h-9 w-40 bg-[#2d2d2d] rounded-xl"></div>
        </div>
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-16 w-full bg-[#262626] rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
