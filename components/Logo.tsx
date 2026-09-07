'use client'

import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  responsive?: boolean;
}

export function Logo({ className = "", size = "md", responsive = true }: LogoProps) {
  const dimensions = {
    sm: { width: 120, height: 60 },
    md: { width: 180, height: 90 },
    lg: { width: 240, height: 120 },
  };

  // Responsive classes that adjust size based on screen size
  const responsiveClasses = responsive
    ? "w-24 h-12 sm:w-32 sm:h-16 md:w-44 md:h-24 lg:w-56 lg:h-28"
    : "";

  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      {responsive ? (
        <div className={`relative ${responsiveClasses}`}>
          <Image
            src="/logo.png"
            alt="Security Logo"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 176px, 224px"
          />
        </div>
      ) : (
        <Image
          src="/logo.png"
          alt="Security Logo"
          width={dimensions[size].width}
          height={dimensions[size].height}
          className="object-contain w-auto h-auto max-w-full"
          priority
        />
      )}
    </div>
  );
}
