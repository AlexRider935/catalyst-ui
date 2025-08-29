"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { CheckCircle, XCircle, Clock, Power } from "lucide-react";

// --- Constants & Configuration ---
const STATUS_INFO = {
  Online: { icon: CheckCircle, color: "text-green-500" },
  Offline: { icon: XCircle, color: "text-red-500" },
  "Never Connected": { icon: Clock, color: "text-gray-400" },
  default: { icon: Power, color: "text-slate-400" },
};

// --- Sub-component for each agent in the list ---
const SourceItem = ({ source, isSelected, onSelect }) => {
  const { icon: Icon, color } =
    STATUS_INFO[source.status] || STATUS_INFO.default;
  return (
    <li>
      <button
        onClick={() => onSelect(source)}
        className={clsx(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left relative",
          isSelected
            ? "bg-slate-200 text-slate-900"
            : "text-slate-600 hover:bg-slate-100"
        )}>
        {isSelected && (
          <motion.div
            layoutId="source-list-active-indicator"
            className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <div className={clsx("flex-shrink-0", color)}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{source.name}</p>
          <p className="text-xs text-slate-500 capitalize">
            {source.status.replace(/_/g, " ")}
          </p>
        </div>
      </button>
    </li>
  );
};

// --- Main List Component ---
export default function SourceList({ sources, selectedSource, onSelect }) {
  // All items are agents, so we can give them a static category
  const categorizedSources = useMemo(
    () => ({ "Catalyst Agents": sources }),
    [sources]
  );

  return (
    <aside className="w-80 border-r border-slate-200 flex flex-col bg-white shrink-0">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-800">
          Enrolled Agents
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          {Object.entries(categorizedSources).map(([category, items]) => (
            <div key={category}>
              <h3 className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {category} ({items.length})
              </h3>
              <ul className="space-y-1 mt-1">
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
