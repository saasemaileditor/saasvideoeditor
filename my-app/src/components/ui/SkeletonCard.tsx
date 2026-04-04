import React from 'react';

export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-[140px] w-full border border-gray-200 dark:border-transparent">
      <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-8"></div>
      <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded mx-auto mt-4"></div>
    </div>
  );
}
