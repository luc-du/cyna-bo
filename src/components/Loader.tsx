import React from "react";

const Loader: React.FC = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
    <span className="ml-4 text-indigo-600 font-medium">Chargement...</span>
  </div>
);

export default Loader;
