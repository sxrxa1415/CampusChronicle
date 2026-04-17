"use client";

export function GlobalLoader({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4"
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer spinning ring - blurred for a glowing effect */}
      <div 
        className={`absolute rounded-full border-t-pink-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin opacity-50 blur-sm ${sizeClasses[size]}`}
        style={{ animationDuration: '1s' }}
      ></div>
      
      {/* Inner spinning ring - sharper primary color */}
      <div 
        className={`rounded-full border-t-pink-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin ${sizeClasses[size]}`}
        style={{ animationDuration: '1s' }}
      ></div>
      
      {/* Inner glowing core */}
      <div className="absolute w-2 h-2 bg-gradient-to-tr from-pink-500 to-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>
    </div>
  );
}
