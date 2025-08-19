"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

/**
 * A fully controlled status toggle component with an enhanced UI.
 * Its state is managed by its parent.
 * @param {boolean} isActive - Determines if the toggle is in the "on" state.
 * @param {function} onChange - Callback function triggered when the toggle is clicked.
 */
export default function StatusToggle({ isActive, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!isActive)}
      // Increased width to accommodate text
      className={clsx(
        "relative inline-flex h-6 w-14 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
        isActive ? "bg-blue-600" : "bg-slate-300" // CORRECTED: Changed inactive color to grayish
      )}
      aria-pressed={isActive}>
      {/* Text is now part of the track, positioned absolutely */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center px-1.5">
        <span
          className={clsx(
            "flex-1 text-left text-[8px] font-bold uppercase tracking-wider text-white transition-opacity duration-200",
            isActive ? "opacity-100" : "opacity-0"
          )}>
          On
        </span>
        <span
          className={clsx(
            "flex-1 text-right text-[8px] font-bold uppercase tracking-wider text-white transition-opacity duration-200",
            !isActive ? "opacity-100" : "opacity-0"
          )}>
          Off
        </span>
      </span>

      {/* The moving handle, now without internal text */}
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={clsx(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0",
          // Adjusted translation distance for the wider track
          isActive ? "translate-x-8" : "translate-x-0"
        )}
      />
    </button>
  );
}
