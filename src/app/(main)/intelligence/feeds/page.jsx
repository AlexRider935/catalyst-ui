"use client";

import { useState } from "react";
import { Zap, Plus, Search, Filter } from "lucide-react";

// --- Mock Data ---
const feedsData = [
  {
    id: "feed-1",
    name: "CrowdStrike Falcon Intelligence",
    type: "Commercial",
    indicators: 1_250_000,
    lastUpdated: "1m ago",
    status: true,
  },
  {
    id: "feed-2",
    name: "Abuse.ch Malware Bazaar",
    type: "OSINT",
    indicators: 250_000,
    lastUpdated: "15m ago",
    status: true,
  },
  {
    id: "feed-3",
    name: "AlienVault OTX",
    type: "OSINT",
    indicators: 800_000,
    lastUpdated: "30m ago",
    status: true,
  },
  {
    id: "feed-4",
    name: "Custom Blocklist",
    type: "Internal",
    indicators: 1_520,
    lastUpdated: "2h ago",
    status: false,
  },
];

// --- Toggle Switch Component ---
const ToggleSwitch = ({ enabled }) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsEnabled(!isEnabled);
      }}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
        isEnabled ? "bg-blue-600" : "bg-slate-300"
      }`}>
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isEnabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

// --- Main Threat Intel Feeds Page ---
export default function ThreatIntelFeedsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Threat Intelligence Feeds
          </h1>
          <p className="mt-1 text-slate-500">
            Manage external intelligence sources to enrich event data.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Plus size={18} />
          Add Feed
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Filter size={16} /> Type
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Feed Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Indicators
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Last Updated
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {feedsData.map((feed) => (
              <tr key={feed.id} className="hover:bg-slate-50 cursor-pointer">
                <td className="px-6 py-4 font-semibold text-slate-800">
                  {feed.name}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      feed.type === "Commercial"
                        ? "bg-purple-100 text-purple-700"
                        : feed.type === "Internal"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                    {feed.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {feed.indicators.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-600">{feed.lastUpdated}</td>
                <td className="px-6 py-4">
                  <ToggleSwitch enabled={feed.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
