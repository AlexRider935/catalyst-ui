"use client";

import { useState } from "react";
import { Share2, Plus, Search, Filter } from "lucide-react";
import Link from "next/link";

// --- Mock Data ---
const decoderData = [
  {
    id: "dec-1",
    name: "aws-cloudtrail",
    type: "System",
    targetField: "aws.source",
    status: true,
  },
  {
    id: "dec-2",
    name: "nginx-access-log",
    type: "System",
    targetField: "nginx.access",
    status: true,
  },
  {
    id: "dec-3",
    name: "windows-security-event",
    type: "System",
    targetField: "winlog.eventdata",
    status: true,
  },
  {
    id: "dec-4",
    name: "custom-app-login",
    type: "Custom",
    targetField: "app.auth",
    status: true,
  },
  {
    id: "dec-5",
    name: "legacy-firewall-syslog",
    type: "Custom",
    targetField: "syslog.legacy",
    status: false,
  },
];

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

// --- Main Decoders Page ---
export default function DecodersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Decoders</h1>
          <p className="mt-1 text-slate-500">
            Manage the parsers that structure raw logs into a standardized
            schema.
          </p>
        </div>
        <Link href="/detection/decoders/new">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Plus size={18} />
            New Decoder
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
                Decoder Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Target Field
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {decoderData.map((decoder) => (
              <tr key={decoder.id} className="hover:bg-slate-50 cursor-pointer">
                <td className="px-6 py-4 font-semibold text-slate-800">
                  {decoder.name}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      decoder.type === "System"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-green-100 text-green-700"
                    }`}>
                    {decoder.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                  {decoder.targetField}
                </td>
                <td className="px-6 py-4">
                  <ToggleSwitch enabled={decoder.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
