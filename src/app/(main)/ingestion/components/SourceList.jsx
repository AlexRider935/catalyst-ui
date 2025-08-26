// components/SourceList.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  ChevronRight,
} from "lucide-react";

const STATUS_INFO = {
  Healthy: { icon: CheckCircle, color: "text-green-500" },
  Degraded: { icon: AlertTriangle, color: "text-yellow-500" },
  Offline: { icon: XCircle, color: "text-red-500" },
};

const SkeletonLoader = () => (
  <div className="p-2 space-y-1">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-slate-200 rounded-md animate-pulse"></div>
    ))}
  </div>
);

export default function SourceList({
  sources,
  selectedSource,
  onSelect,
  isLoading,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categorizedSources, setCategorizedSources] = useState({});
  const [openCategories, setOpenCategories] = useState({});

  useEffect(() => {
    const filtered = sources.filter(
      (source) =>
        source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = filtered.reduce((acc, source) => {
      const { type } = source;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(source);
      return acc;
    }, {});
    setCategorizedSources(grouped);

    const initialOpenState = Object.keys(grouped).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setOpenCategories(initialOpenState);
  }, [sources, searchTerm]);

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <aside className="w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
      <div className="p-4 border-b border-slate-200/80 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Connected Sources
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <nav className="p-2">
            {Object.entries(categorizedSources).map(([category, items]) => (
              <div key={category} className="mb-2">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-200/50">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {category}
                  </h3>
                  <ChevronRight
                    size={16}
                    className={clsx(
                      "text-slate-500 transition-transform",
                      openCategories[category] && "rotate-90"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {openCategories[category] && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1 mt-1 overflow-hidden">
                      {items.map((source) => {
                        const { icon: Icon, color } =
                          STATUS_INFO[source.status] || {};
                        const isSelected = selectedSource?.id === source.id;
                        return (
                          <li key={source.id}>
                            <button
                              onClick={() => onSelect(source)}
                              className={clsx(
                                "w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-left relative",
                                isSelected
                                  ? "bg-white text-slate-900 shadow-sm"
                                  : "text-slate-600 hover:bg-slate-100/70"
                              )}>
                              {isSelected && (
                                <motion.div
                                  layoutId="source-list-active-indicator"
                                  className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full"
                                />
                              )}
                              <div
                                className={clsx(
                                  "flex-shrink-0 self-start",
                                  color
                                )}>
                                <Icon size={18} />
                              </div>
                              <div className="flex-1 truncate">
                                <p className="font-semibold text-slate-800 truncate">
                                  {source.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {source.events_per_second.toLocaleString()}{" "}
                                  EPS
                                </p>
                              </div>
                              {!source.is_enabled && (
                                <span className="text-xs bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                                  Paused
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        )}
      </div>
    </aside>
  );
}
