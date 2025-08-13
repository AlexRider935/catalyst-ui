"use client";

import { useState } from "react";
import { Database, Play, Clock, BarChart2, List } from "lucide-react";

// --- Mock Data ---
const queryResults = [
  {
    timestamp: "2025-08-13 16:05:10",
    source_ip: "192.168.1.100",
    dest_ip: "8.8.8.8",
    action: "ALLOW",
  },
  {
    timestamp: "2025-08-13 16:05:12",
    source_ip: "10.0.1.5",
    dest_ip: "1.1.1.1",
    action: "DENY",
  },
  {
    timestamp: "2025-08-13 16:05:15",
    source_ip: "192.168.1.102",
    dest_ip: "8.8.4.4",
    action: "ALLOW",
  },
  {
    timestamp: "2025-08-13 16:05:18",
    source_ip: "10.0.2.7",
    dest_ip: "4.2.2.2",
    action: "ALLOW",
  },
];

// --- Main Data Lake Page ---
export default function DataLakePage() {
  const [activeTab, setActiveTab] = useState("Table");
  const queryPlaceholder = `source.type = 'firewall' AND action = 'DENY' | STATS count() BY dest_ip`;

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-slate-800">Data Lake</h1>
        <p className="mt-1 text-slate-500">
          Perform deep analysis by directly querying the raw event data lake.
        </p>
      </div>

      {/* Query Editor */}
      <div className="mt-6 flex-shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4">
          <textarea
            className="w-full h-24 p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-lg border-slate-700 focus:ring-blue-500 focus:border-blue-500"
            defaultValue={queryPlaceholder}
          />
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 rounded-b-xl flex items-center justify-between">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Clock size={16} /> Last 24 hours
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            <Play size={16} /> Run Query
          </button>
        </div>
      </div>

      {/* Results Panel */}
      <div className="mt-6 flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 border-b border-slate-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("Table")}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "Table"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500"
              }`}>
              <List size={16} className="inline-block mr-2" /> Table
            </button>
            <button
              onClick={() => setActiveTab("Visualization")}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "Visualization"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500"
              }`}>
              <BarChart2 size={16} className="inline-block mr-2" />{" "}
              Visualization
            </button>
          </nav>
        </div>
        <div className="flex-1 overflow-y-auto mt-4">
          {activeTab === "Table" && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {Object.keys(queryResults[0]).map((key) => (
                      <th
                        key={key}
                        scope="col"
                        className="px-6 py-3 text-left font-semibold text-slate-600">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {queryResults.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      {Object.values(row).map((value, i) => (
                        <td
                          key={i}
                          className="px-6 py-4 font-mono text-xs text-slate-600">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "Visualization" && (
            <div className="flex items-center justify-center h-full bg-white rounded-xl border border-slate-200/80 text-slate-500">
              Visualization engine would render here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
