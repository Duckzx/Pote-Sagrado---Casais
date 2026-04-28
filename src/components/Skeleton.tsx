import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-cookbook-border/20 rounded ${className}`}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-cookbook-surface backdrop-blur-md border border-cookbook-border/30 rounded-3xl p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <Skeleton className="w-32 h-6" />
    </div>
    <Skeleton className="w-full h-32 rounded-2xl" />
    <div className="flex gap-2">
      <Skeleton className="flex-1 h-10 rounded-xl" />
      <Skeleton className="flex-1 h-10 rounded-xl" />
    </div>
  </div>
);
