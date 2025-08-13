"use client";

import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Bug,
  Server,
  ArrowRight,
  Rss,
  Filter,
} from "lucide-react";

// --- Mock Data ---
const postureData = {
  activeThreats: 1,
  newVulnerabilities: 3,
  complianceDrift: "2%",
  atRiskAssets: 5,
};

const feedData = [
  {
    type: "Event",
    severity: "High",
    Icon: ShieldAlert,
    color: "text-red-500",
    title: "Anomalous Outbound Connection from `prod-db-01`",
    timestamp: "2m ago",
  },
  {
    type: "Vulnerability",
    severity: "Critical",
    Icon: Bug,
    color: "text-red-500",
    title: "New RCE Vulnerability Detected in Apache Struts",
    timestamp: "1h ago",
  },
  {
    type: "Compliance",
    severity: "Medium",
    Icon: ShieldCheck,
    color: "text-amber-500",
    title: "PCI-DSS Control `10.2.1` is Failing",
    timestamp: "3h ago",
  },
  {
    type: "Asset",
    severity: "Low",
    Icon: Server,
    color: "text-blue-500",
    title: "New Endpoint Onboarded: `dev-macbook-21`",
    timestamp: "5h ago",
  },
];

// --- Posture Card Component ---
const PostureCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
    </div>
    <p className="text-3xl font-bold text-slate-900 mt-4">{value}</p>
  </div>
);

// --- Main Dashboard Page ---
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Contextual Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Good afternoon, Director.
        </h1>
        <p className="mt-1.5 text-slate-500">
          Here is the current security posture of The Catalyst Corp.
        </p>
      </div>

      {/* At-a-Glance Posture Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <PostureCard
          title="Active Threats"
          value={postureData.activeThreats}
          icon={ShieldAlert}
          color="bg-red-500"
        />
        <PostureCard
          title="New Vulnerabilities"
          value={postureData.newVulnerabilities}
          icon={Bug}
          color="bg-amber-500"
        />
        <PostureCard
          title="Compliance Drift"
          value={postureData.complianceDrift}
          icon={ShieldCheck}
          color="bg-blue-500"
        />
        <PostureCard
          title="Assets at Risk"
          value={postureData.atRiskAssets}
          icon={Server}
          color="bg-slate-600"
        />
      </div>

      {/* Intelligence Feed */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Intelligence Feed
            </h2>
            <p className="text-sm text-slate-500">
              A unified stream of all security and compliance activities.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> Filter Feed
          </button>
        </div>
        <ul className="divide-y divide-slate-200/80">
          {feedData.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-5 group cursor-pointer hover:bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.color} bg-opacity-10`}>
                  <item.Icon size={18} className={item.color} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-500">
                    {item.type} &middot; {item.timestamp}
                  </p>
                </div>
              </div>
              <ArrowRight
                size={20}
                className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </li>
          ))}
        </ul>
        <div className="p-4 bg-slate-50/70 rounded-b-xl text-center">
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:underline">
            View All Intelligence
          </a>
        </div>
      </div>
    </div>
  );
}
