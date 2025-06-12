
"use client";

import React from "react";

const GymFormInput = ({ 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  name = undefined,
  error = null
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="group relative">
        <input
          type={type}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
          value={value}
          onChange={onChange}
          name={name}
        />
        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default GymFormInput;