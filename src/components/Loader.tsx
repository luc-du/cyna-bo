import React from "react";

interface LoaderProps {
  size?: "small" | "medium" | "large";
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = "medium", 
  message = "Chargement...", 
  fullScreen = false,
  className = "" 
}) => {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-10 w-10",
    large: "h-14 w-14"
  };

  const loaderContent = (
    <div className={`flex ${fullScreen ? "flex-col" : ""} justify-center items-center ${className}`}>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-indigo-600 ${sizeClasses[size]}`}></div>
      {message && <span className={`${fullScreen ? "mt-4" : "ml-4"} text-indigo-600 font-medium`}>{message}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50/90 backdrop-blur-sm flex justify-center items-center z-50">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

/**
 * Composant de fallback pour le chargement Suspense
 */
export const SuspenseFallback: React.FC = () => (
  <div className="p-6 flex justify-center items-center h-full min-h-[200px]">
    <Loader size="medium" />
  </div>
);

export default Loader;
