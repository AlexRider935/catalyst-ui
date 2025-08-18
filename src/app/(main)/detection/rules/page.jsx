"use client";

import { useState, Fragment } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  History,
  TestTube2,
  X,
  AlertTriangle,
  GitBranch,
} from "lucide-react";
import { Menu, Transition, Switch } from "@headlessui/react";
import Link from "next/link";

// --- Reusable Components ---
const SettingsCard = ({ children }) => (
  <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
    {children}
  </div>
);
const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
      active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
    }`}>
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        active ? "bg-green-500" : "bg-slate-400"
      }`}></span>
    {active ? "Enabled" : "Disabled"}
  </span>
);
const SeverityBadge = ({ severity }) => {
  const severityMap = {
    Critical: { badge: "bg-red-100 text-red-700" },
    High: { badge: "bg-amber-100 text-amber-700" },
    Medium: { badge: "bg-yellow-100 text-yellow-700" },
    Low: { badge: "bg-blue-100 text-blue-700" },
  };
  const { badge } = severityMap[severity] || {};
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${badge}`}>
      {severity}
    </span>
  );
};

// --- Main Rules Page ---
export default function RulesPage() {
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const rulesData = [
    {
      id: "rule-001",
      name: "Potential Brute Force (SSH)",
      source: "Syslog",
      severity: "High",
      status: true,
      version: 2,
      lastModified: "2025-08-12",
      modifiedBy: "Alex Rider",
      hits: "1,283",
    },
    {
      id: "rule-002",
      name: "Admin Login Outside Business Hours",
      source: "Okta",
      severity: "Medium",
      status: true,
      version: 1,
      lastModified: "2025-08-10",
      modifiedBy: "Alex Rider",
      hits: "12",
    },
    {
      id: "rule-003",
      name: "SQL Injection Attempt",
      source: "AWS WAF",
      severity: "High",
      status: true,
      version: 5,
      lastModified: "2025-07-28",
      modifiedBy: "system",
      hits: "432",
    },
    {
      id: "rule-004",
      name: "New User Added to Privileged Group",
      source: "Azure AD",
      severity: "Low",
      status: true,
      version: 1,
      lastModified: "2025-06-30",
      modifiedBy: "system",
      hits: "3",
    },
    {
      id: "rule-005",
      name: "Legacy TLS Version Detected",
      source: "Palo Alto Firewall",
      severity: "Medium",
      status: false,
      version: 3,
      lastModified: "2025-05-19",
      modifiedBy: "Jane Doe",
      hits: "891",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Detection Rules</h1>
          <p className="mt-1 text-slate-500">
            Manage the custom logic that powers the intelligence engine.
          </p>
        </div>
        <Link href="/detection/rules/new">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            <Plus size={18} /> New Rule
          </button>
        </Link>
      </div>

      <SettingsCard>
        <div className="p-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by name or source..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Filter size={16} /> Source
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Rule Name
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Source
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Severity
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Hits (24h)
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {rulesData.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{rule.name}</p>
                    <p className="text-xs text-slate-500">
                      Version {rule.version} &middot; by {rule.modifiedBy}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {rule.source}
                  </td>
                  <td className="px-6 py-4">
                    <SeverityBadge severity={rule.severity} />
                  </td>
                  <td className="px-6 py-4 font-mono text-sm font-medium text-slate-700">
                    {rule.hits}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge active={rule.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Menu as="div" className="relative">
                      <Menu.Button className="p-2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <MoreVertical size={16} />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-75"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95">
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <Menu.Item>
                              <a
                                href="#"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                <Edit size={14} /> Edit
                              </a>
                            </Menu.Item>
                            <Menu.Item>
                              <a
                                href="#"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                <TestTube2 size={14} /> Test Rule
                              </a>
                            </Menu.Item>
                            <Menu.Item>
                              <a
                                href="#"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                <Copy size={14} /> Duplicate
                              </a>
                            </Menu.Item>
                            <Menu.Item>
                              <a
                                href="#"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                <History size={14} /> View History
                              </a>
                            </Menu.Item>
                            <div className="my-1 h-px bg-slate-100" />
                            <Menu.Item>
                              <button className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Trash2 size={14} /> Delete
                              </button>
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsCard>
    </div>
  );
}
