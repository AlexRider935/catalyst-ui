"use client";

import { useState } from "react";
import { Users, Search, Filter, X, Shield, KeyRound, Mail } from "lucide-react";

// --- Mock Data ---
const identityData = [
  {
    id: "user-1",
    name: "Alex Rider",
    email: "director@thecatalyst.io",
    role: "Owner",
    status: "Active",
    risk: "Low",
    lastSeen: "2025-08-13 14:30:15",
  },
  {
    id: "user-2",
    name: "Jane Doe",
    email: "jane.doe@thecatalyst.io",
    role: "Admin",
    status: "Active",
    risk: "Medium",
    lastSeen: "2025-08-13 11:15:02",
  },
  {
    id: "user-3",
    name: "John Doe",
    email: "john.doe@thecatalyst.io",
    role: "Member",
    status: "Suspended",
    risk: "High",
    lastSeen: "2025-08-10 09:05:44",
  },
  {
    id: "user-4",
    name: "John Smith",
    email: "john.smith@thecatalyst.io",
    role: "Member",
    status: "Active",
    risk: "Low",
    lastSeen: "2025-08-13 13:55:18",
  },
  {
    id: "user-5",
    name: "service-account-db",
    email: "svc_db@thecatalyst.io",
    role: "Service Account",
    status: "Active",
    risk: "Critical",
    lastSeen: "2025-08-13 15:00:00",
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

// --- Identity Detail Panel ---
const IdentityDetailPanel = ({ identity, onClose }) => {
  if (!identity) return null;
  const { textColor } = riskMap[identity.risk];
  const isActive = identity.status === "Active";

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
                  {identity.risk} Risk Level
                </p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {identity.name}
                </h2>
                <div
                  className={`mt-1 flex items-center gap-2 text-sm font-medium ${
                    isActive ? "text-green-600" : "text-red-600"
                  }`}>
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive ? "bg-green-500" : "bg-red-500"
                    }`}></div>
                  {identity.status}
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
              <h3 className="font-semibold text-slate-800 mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm rounded-lg bg-white border border-slate-200 p-4">
                <div className="font-medium text-slate-500">Email</div>
                <div className="font-mono text-slate-800">{identity.email}</div>
                <div className="font-medium text-slate-500">Role</div>
                <div className="text-slate-800">{identity.role}</div>
                <div className="font-medium text-slate-500">Last Seen</div>
                <div className="text-slate-800">{identity.lastSeen}</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                Recent Activity
              </h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-slate-500" />
                    <span className="font-medium text-slate-700">
                      Recent Security Events
                    </span>
                  </div>
                  <span className="font-semibold text-slate-600 bg-slate-100 rounded-full px-2.5 py-0.5">
                    3
                  </span>
                </a>
                <a
                  href="#"
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <KeyRound size={18} className="text-slate-500" />
                    <span className="font-medium text-slate-700">
                      Authentication Attempts
                    </span>
                  </div>
                  <span className="font-semibold text-slate-600 bg-slate-100 rounded-full px-2.5 py-0.5">
                    12
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <button className="w-full text-center p-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md">
              Suspend User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Identities Page ---
export default function IdentitiesPage() {
  const [selectedIdentity, setSelectedIdentity] = useState(null);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Asset Inventory: Identities
          </h1>
          <p className="mt-1 text-slate-500">
            A complete inventory of user and service accounts.
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
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> Role
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
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Risk Level
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {identityData.map((identity) => {
                const isActive = identity.status === "Active";
                const { badge } = riskMap[identity.risk];
                return (
                  <tr
                    key={identity.id}
                    onClick={() => setSelectedIdentity(identity)}
                    className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {identity.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {identity.email}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {identity.role}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 text-sm font-medium ${
                          isActive ? "text-green-600" : "text-red-600"
                        }`}>
                        <div
                          className={`h-2 w-2 rounded-full ${
                            isActive ? "bg-green-500" : "bg-red-500"
                          }`}></div>
                        {identity.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${badge}`}>
                        {identity.risk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <IdentityDetailPanel
        identity={selectedIdentity}
        onClose={() => setSelectedIdentity(null)}
      />
    </>
  );
}
