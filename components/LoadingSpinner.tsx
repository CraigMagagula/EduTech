
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-indigo-600"></div>
      <p className="ml-3 text-slate-600">Generating content, please wait...</p>
    </div>
  );
};

export default LoadingSpinner;
