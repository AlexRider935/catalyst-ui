"use client";

import { useState } from "react";
import { Search, Clock } from "lucide-react";

export default function GlobalSearchPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search
          size={22}
          className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search for assets, vulnerabilities, events, compliance controls..."
          className="w-full rounded-xl border-2 border-slate-300 bg-white py-5 pl-16 pr-6 text-lg focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500"
        />
      </div>

      {/* Suggestions */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Suggestions
        </h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <button className="p-3 bg-white border border-slate-200/80 rounded-lg text-left hover:border-blue-500 hover:shadow-sm transition-all">
            <p className="font-semibold text-slate-800">
              Assets with Critical Vulnerabilities
            </p>
          </button>
          <button className="p-3 bg-white border border-slate-200/80 rounded-lg text-left hover:border-blue-500 hover:shadow-sm transition-all">
            <p className="font-semibold text-slate-800">
              Failed Logins in last 24h
            </p>
          </button>
          <button className="p-3 bg-white border border-slate-200/80 rounded-lg text-left hover:border-blue-500 hover:shadow-sm transition-all">
            <p className="font-semibold text-slate-800">
              Failing PCI-DSS Controls
            </p>
          </button>
        </div>
      </div>

      {/* Recent Searches */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Recent
        </h2>
        <ul className="mt-4 space-y-2">
          <li className="flex items-center gap-3 p-2 text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer">
            <Clock size={16} /> <span>prod-db-01</span>
          </li>
          <li className="flex items-center gap-3 p-2 text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer">
            <Clock size={16} /> <span>CVE-2025-12345</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
