"use client";

import React from "react";

const GymBackground = ({ children }) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1920&auto=format')] bg-cover bg-center bg-no-repeat">
      {/* Overlay with dynamic fitness pattern */}
      <div className="absolute inset-0 bg-black/80">
        {/* Animated heartbeat line */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg className="h-full w-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
            <path
              d="M0,300 Q150,300 200,100 T400,300 T600,300 T800,100 T1000,300 T1200,300"
              fill="none"
              stroke="#4ade80"
              strokeWidth="4"
              className="motion-safe:animate-pulse-slow"
            />
          </svg>
        </div>

        {/* Fitness equipment pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, #4ade80 2px, transparent 2px)",
              backgroundSize: "60px 60px",
            }}
          ></div>

          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(45deg, #4ade80 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              opacity: 0.3,
            }}
          ></div>
        </div>
      </div>

      {/* Main content */}
      {children}
    </div>
  );
};

export default GymBackground;