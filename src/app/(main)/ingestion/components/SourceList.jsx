"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { CheckCircle2, XCircle, Clock, Power } from "lucide-react";

// --- Status Configuration ---
const STATUS_INFO = {
  Online: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
  Offline: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  "Never Connected": {
    icon: Clock,
    color: "text-gray-400",
    bg: "bg-gray-50",
  },
  default: { icon: Power, color: "text-slate-400", bg: "bg-slate-50" },
};

// --- Individual Agent Item ---
const SourceItem = ({ source, isSelected, onSelect }) => {
  const { icon: Icon, color } =
    STATUS_INFO[source.status] || STATUS_INFO.default;

  return (
    <li>
      <button
        onClick={() => onSelect(source)}
        className={clsx(
          "group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors text-left",
          isSelected
            ? "bg-blue-50 text-slate-900 ring-1 ring-inset ring-blue-200"
            : "hover:bg-slate-50 text-slate-600"
        )}>
        {/* Active indicator bar */}
        {isSelected && (
          <motion.div
            layoutId="source-list-active-indicator"
            className="absolute left-0 top-2 bottom-2 w-1.5 bg-blue-600 rounded-r-full"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}

        {/* Status icon */}
        <div
          className={clsx(
            "flex-shrink-0 rounded-full p-1.5",
            STATUS_INFO[source.status]?.bg
          )}>
          <Icon className={clsx("w-4 h-4", color)} />
        </div>

        {/* Agent info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 truncate">{source.name}</p>
          <p className="text-xs text-slate-500 capitalize">
            {source.status.replace(/_/g, " ")}
          </p>
        </div>
      </button>
    </li>
  );
};

// --- Main Sidebar Component ---
export default function SourceList({ sources, selectedSource, onSelect }) {
  // Categorize sources (future-proof for multiple groups)
  const categorizedSources = useMemo(
    () => ({ "Catalyst Agents": sources }),
    [sources]
  );

  return (
    <aside className="w-80 border-r border-slate-200 flex flex-col bg-white shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700 tracking-tight">
          Enrolled Agents
        </h2>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-3">
          {Object.entries(categorizedSources).map(([category, items]) => (
            <div key={category} className="mb-5">
              <h3 className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {category} <span className="font-normal">({items.length})</span>
              </h3>
              <ul className="space-y-1 mt-2">
                {items.map((source) => (
                  <SourceItem
                    key={source.id}
                    source={source}
                    isSelected={selectedSource?.id === source.id}
                    onSelect={onSelect}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
