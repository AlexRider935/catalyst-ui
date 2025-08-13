"use client";

import { useState } from "react";
import { Server, Search, Filter, X, Bug, Shield } from "lucide-react";

// --- Mock Data ---
const endpointData = [
  {
    id: "host-1",
    hostname: "prod-db-01",
    ip: "10.0.1.5",
    os: "Ubuntu 22.04",
    agentStatus: "Online",
    risk: "High",
    openVulnerabilities: 2,
    recentEvents: 5,
  },
  {
    id: "host-2",
    hostname: "prod-web-01",
    ip: "10.0.1.10",
    os: "Ubuntu 22.04",
    agentStatus: "Online",
    risk: "Medium",
    openVulnerabilities: 1,
    recentEvents: 12,
  },
  {
    id: "host-3",
    hostname: "win-dc-02",
    ip: "10.0.2.7",
    os: "Windows Server 2022",
    agentStatus: "Online",
    risk: "High",
    openVulnerabilities: 3,
    recentEvents: 8,
  },
  {
    id: "host-4",
    hostname: "legacy-ftp-server",
    ip: "192.168.1.50",
    os: "CentOS 7",
    agentStatus: "Offline",
    risk: "Critical",
    openVulnerabilities: 15,
    recentEvents: 0,
  },
  {
    id: "host-5",
    hostname: "dev-macbook-17",
    ip: "192.168.5.22",
    os: "macOS Sonoma",
    agentStatus: "Online",
    risk: "Low",
    openVulnerabilities: 0,
    recentEvents: 2,
  },
  {
    id: "host-6",
    hostname: "staging-web-server",
    ip: "10.0.1.12",
    os: "Ubuntu 22.04",
    agentStatus: "Online",
    risk: "Medium",
    openVulnerabilities: 1,
    recentEvents: 3,
  },
];

const riskMap = {
  Critical: {
    badge: "bg-red-100 text-red-700 border-red-200",
    textColor: "text-red-600",
  },
  High: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    textColor: "text-amber-600",
  },
  Medium: {
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    textColor: "text-yellow-600",
  },
  Low: {
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    textColor: "text-blue-600",
  },
};

// --- Endpoint Detail Panel ---
const EndpointDetailPanel = ({ asset, onClose }) => {
  if (!asset) return null;
  const { textColor } = riskMap[asset.risk];
  const isOnline = asset.agentStatus === "Online";

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose}></div>
      <div className="absolute inset-y-0 right-0 flex max-w-2xl w-full">
        <div className="w-full bg-white shadow-xl flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={`font-semibold text-sm flex items-center gap-2 ${textColor}`}>
                  {asset.risk} Risk Level
                </p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {asset.hostname}
                </h2>
                <div
                  className={`mt-1 flex items-center gap-2 text-sm font-medium ${
                    isOnline ? "text-green-600" : "text-red-600"
                  }`}>
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      isOnline ? "bg-green-500" : "bg-red-500"
                    }`}></div>
                  Agent {asset.agentStatus}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-800">
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-6 space-y-6 bg-slate-50/70 overflow-y-auto">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                System Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm rounded-lg bg-white border border-slate-200 p-4">
                <div className="font-medium text-slate-500">IP Address</div>
                <div className="font-mono text-slate-800">{asset.ip}</div>
                <div className="font-medium text-slate-500">
                  Operating System
                </div>
                <div className="text-slate-800">{asset.os}</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                Security Posture
              </h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Bug size={18} className="text-amber-600" />
                    <span className="font-medium text-slate-700">
                      Open Vulnerabilities
                    </span>
                  </div>
                  <span className="font-semibold text-amber-600 bg-amber-100 rounded-full px-2.5 py-0.5">
                    {asset.openVulnerabilities}
                  </span>
                </a>
                <a
                  href="#"
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-red-600" />
                    <span className="font-medium text-slate-700">
                      Recent Security Events
                    </span>
                  </div>
                  <span className="font-semibold text-red-600 bg-red-100 rounded-full px-2.5 py-0.5">
                    {asset.recentEvents}
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <button className="w-full text-center p-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md">
              Isolate Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Endpoints Page ---
export default function EndpointsPage() {
  const [selectedAsset, setSelectedAsset] = useState(null);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Asset Inventory: Endpoints
          </h1>
          <p className="mt-1 text-slate-500">
            A complete inventory of servers, workstations, and other monitored
            devices.
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
              placeholder="Search by hostname or IP..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> OS
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> Status
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Hostname
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  IP Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Operating System
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Agent Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Risk Level
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {endpointData.map((asset) => {
                const isOnline = asset.agentStatus === "Online";
                const { badge } = riskMap[asset.risk];
                return (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {asset.hostname}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {asset.ip}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{asset.os}</td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 text-sm font-medium ${
                          isOnline ? "text-green-600" : "text-red-600"
                        }`}>
                        <div
                          className={`h-2 w-2 rounded-full ${
                            isOnline ? "bg-green-500" : "bg-red-500"
                          }`}></div>
                        {asset.agentStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${badge}`}>
                        {asset.risk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <EndpointDetailPanel
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />
    </>
  );
}
