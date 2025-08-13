"use client";

import { useState } from "react";
import { Activity, Search, Filter, User } from "lucide-react";

// --- Mock Data ---
const auditLogData = [
  {
    id: "log-1",
    actor: "director@thecatalyst.io",
    action: "USER_LOGIN",
    target: "director@thecatalyst.io",
    ip: "192.168.1.1",
    timestamp: "2025-08-13 15:30:00",
  },
  {
    id: "log-2",
    actor: "jane.doe@thecatalyst.io",
    action: "RULE_UPDATED",
    target: "rule-003",
    ip: "192.168.1.10",
    timestamp: "2025-08-13 15:25:10",
  },
  {
    id: "log-3",
    actor: "SYSTEM",
    action: "PLAYBOOK_EXECUTED",
    target: "pb-1 (Isolate Endpoint)",
    ip: "N/A",
    timestamp: "2025-08-13 15:02:11",
  },
  {
    id: "log-4",
    actor: "director@thecatalyst.io",
    action: "REPORT_GENERATED",
    target: "Q3 Vulnerability Summary",
    ip: "192.168.1.1",
    timestamp: "2025-08-13 14:55:00",
  },
];

// --- Main Audit Log Page ---
export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Audit Log</h1>
        <p className="mt-1 text-slate-500">
          An immutable log of all user and system actions performed within the
          platform.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by actor or action..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Filter size={16} /> Actor
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Actor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Action
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Target
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                IP Address
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {auditLogData.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-semibold text-slate-800">
                  {log.actor}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                  {log.action}
                </td>
                <td className="px-6 py-4 text-slate-600">{log.target}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                  {log.ip}
                </td>
                <td className="px-6 py-4 text-slate-600">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
