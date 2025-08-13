"use client";

import { useState, useEffect } from "react";
import {
  Search,
  LayoutDashboard,
  ShieldCheck,
  Rss,
  Settings,
} from "lucide-react";

// Mock data for searchable commands
const allCommands = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Compliance", href: "/compliance", icon: ShieldCheck },
  { name: "Ingestion", href: "/ingestion", icon: Rss },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function CommandPalette({ isOpen, setIsOpen }) {
  const [query, setQuery] = useState("");

  // Close on 'Escape' key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  if (!isOpen) {
    return null;
  }

  const filteredCommands =
    query === ""
      ? allCommands
      : allCommands.filter((cmd) =>
          cmd.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm"
      onMouseDown={() => setIsOpen(false)}>
      {/* Modal Panel */}
      <div
        className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full border-0 bg-transparent py-4 pl-12 pr-4 text-slate-900 placeholder-slate-500 focus:ring-0 sm:text-sm"
            placeholder="Jump to..."
          />
        </div>

        {/* Results List */}
        <div className="border-t border-slate-200 p-2 max-h-80 overflow-y-auto">
          {filteredCommands.length > 0 ? (
            <ul className="space-y-1">
              {filteredCommands.map((cmd) => (
                <li key={cmd.name}>
                  <a
                    href={cmd.href}
                    className="flex items-center gap-3 rounded-md p-3 text-sm text-slate-700 hover:bg-slate-100">
                    <cmd.icon className="h-5 w-5 text-slate-500" />
                    {cmd.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-center text-sm text-slate-500">
              No results found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
