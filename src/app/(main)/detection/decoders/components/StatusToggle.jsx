"use client";
import { useState } from "react";

export default function StatusToggle({ isActive, onChange }) {
  const [enabled, setEnabled] = useState(isActive);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    if (onChange) onChange(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
        enabled ? "bg-blue-600" : "bg-slate-300"
      }`}>
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
