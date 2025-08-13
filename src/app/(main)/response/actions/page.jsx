"use client";

import { useState } from "react";
import { Zap, Search, Filter, CheckCircle, XCircle } from "lucide-react";

// --- Mock Data ---
const activeResponseData = [
  {
    id: "ar-1",
    action: "Isolate Endpoint",
    target: "prod-web-01",
    playbook: "Isolate Endpoint on High-Severity Alert",
    status: "Success",
    timestamp: "2025-08-13 15:02:10",
  },
  {
    id: "ar-2",
    action: "Disable User",
    target: "john.doe",
    playbook: "Disable User on Brute Force Detection",
    status: "Success",
    timestamp: "2025-08-13 14:45:33",
  },
  {
    id: "ar-3",
    action: "Run Command",
    target: "win-dc-02",
    playbook: "Collect Forensics on Anomalous Process",
    status: "Success",
    timestamp: "2025-08-13 11:10:05",
  },
  {
    id: "ar-4",
    action: "Send Slack Message",
    target: "#soc-alerts",
    playbook: "Notify Admin on Compliance Control Failure",
    status: "Success",
    timestamp: "2025-08-13 09:30:00",
  },
  {
    id: "ar-5",
    action: "Isolate Endpoint",
    target: "legacy-ftp-server",
    playbook: "Isolate Endpoint on High-Severity Alert",
    status: "Failed",
    timestamp: "2025-08-12 18:05:15",
  },
];

// --- Main Active Response Page ---
export default function ActiveResponsePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Active Response Log
        </h1>
        <p className="mt-1 text-slate-500">
          An immutable audit trail of all automated actions taken by the
          Response Engine.
        </p>
      </div>

      {/* Filter & Action Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by action or target..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Filter size={16} /> Playbook
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Filter size={16} /> Status
        </button>
      </div>

      {/* Actions Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
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
                Triggering Playbook
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {activeResponseData.map((action) => {
              const isSuccess = action.status === "Success";
              return (
                <tr key={action.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {action.action}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {action.target}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {action.playbook}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center gap-2 text-sm font-medium ${
                        isSuccess ? "text-green-600" : "text-red-600"
                      }`}>
                      {isSuccess ? (
                        <CheckCircle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      {action.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {action.timestamp}
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
