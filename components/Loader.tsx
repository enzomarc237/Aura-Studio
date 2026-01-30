
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold tracking-wider animate-pulse">GENERATING...</p>
    </div>
  );
};
