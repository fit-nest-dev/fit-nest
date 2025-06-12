
"use client";

import React from "react";

const GymButton = ({ 
  children, 
  type = "button", 
  onClick = () => {}, 
  disabled = false,
  fullWidth = true,
  className = ""
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70 ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
    >
      <span className="absolute -top-10 left-[40%] h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 transition-all duration-1000 group-hover:top-[40%]"></span>
      <span className="relative flex items-center justify-center">{children}</span>
    </button>
  );
};

export default GymButton;