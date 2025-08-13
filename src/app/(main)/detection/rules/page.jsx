"use client";

import { useState } from "react";
import { GitBranch, Plus, Search, Filter } from "lucide-react";
import Link from "next/link";

// --- Mock Data ---
const rulesData = [
  {
    id: "rule-001",
    name: "Potential Brute Force (SSH)",
    source: "Syslog",
    severity: "High",
    status: true,
    hits: 128,
  },
  {
    id: "rule-002",
    name: "Admin Login Outside Business Hours",
    source: "Okta",
    severity: "Medium",
    status: true,
    hits: 12,
  },
  {
    id: "rule-003",
    name: "SQL Injection Attempt",
    source: "AWS WAF",
    severity: "High",
    status: true,
    hits: 432,
  },
  {
    id: "rule-004",
    name: "New User Added to Privileged Group",
    source: "Azure AD",
    severity: "Low",
    status: true,
    hits: 3,
  },
  {
    id: "rule-005",
    name: "Legacy TLS Version Detected",
    source: "Palo Alto Firewall",
    severity: "Medium",
    status: false,
    hits: 891,
  },
];

const severityMap = {
  High: { badge: "bg-amber-100 text-amber-700 border-amber-200" },
  Medium: { badge: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  Low: { badge: "bg-blue-100 text-blue-700 border-blue-200" },
};

// --- Toggle Switch Component ---
const ToggleSwitch = ({ enabled }) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  return (
    <button
      onClick={() => setIsEnabled(!isEnabled)}
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

// --- Main Rules Page ---
export default function RulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Detection Rules</h1>
          <p className="mt-1 text-slate-500">
            Manage the custom logic that powers the intelligence engine.
          </p>
        </div>
        <Link href="/detection/rules/new">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Plus size={18} />
            New Rule
          </button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name or source..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Filter size={16} /> Source
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Rule Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Source
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Severity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Hits (24h)
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rulesData.map((rule) => {
              const { badge } = severityMap[rule.severity];
              return (
                <tr key={rule.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {rule.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {rule.source}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${badge}`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {rule.hits.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <ToggleSwitch enabled={rule.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
