import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullHeight?: boolean;
}

const Loader = ({ size = "md", text = "Loading...", fullHeight = true }: LoaderProps) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${fullHeight ? "min-h-[50vh]" : ""}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-primary border-t-transparent`}
        role="status"
        aria-label="loading"
      />
      {text && (
        <p className="mt-3 text-base-regular text-[#0D1829B2] dark:text-dark-text/60">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader; 