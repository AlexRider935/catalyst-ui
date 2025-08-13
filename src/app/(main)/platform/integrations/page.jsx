"use client";

import { useState } from "react";
import { Puzzle, Search, CheckCircle } from "lucide-react";

// --- Mock Data ---
const integrationsData = [
  {
    id: "int-1",
    name: "Slack",
    category: "Collaboration",
    description: "Send real-time alerts to Slack channels.",
    configured: true,
  },
  {
    id: "int-2",
    name: "Jira",
    category: "Ticketing",
    description: "Create and manage issues for remediation.",
    configured: true,
  },
  {
    id: "int-3",
    name: "PagerDuty",
    category: "On-Call",
    description: "Trigger incidents for on-call teams.",
    configured: false,
  },
  {
    id: "int-4",
    name: "Okta",
    category: "Identity",
    description: "Ingest user logs and manage identities.",
    configured: true,
  },
  {
    id: "int-5",
    name: "AWS",
    category: "Cloud",
    description: "Connect to CloudTrail, GuardDuty, and more.",
    configured: true,
  },
  {
    id: "int-6",
    name: "GitHub",
    category: "DevOps",
    description: "Monitor audit logs and repository activity.",
    configured: false,
  },
];

// --- Integration Card Component ---
const IntegrationCard = ({ integration }) => (
  <div className="group relative rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
          {/* Placeholder for actual logo */}
          <Puzzle size={24} className="text-slate-500" />
        </div>
        {integration.configured ? (
          <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle size={14} />
            Configured
          </div>
        ) : (
          <button className="text-sm font-semibold text-blue-600 hover:underline">
            Configure
          </button>
        )}
      </div>
      <div className="mt-4">
        <h2 className="font-semibold text-lg text-slate-800">
          {integration.name}
        </h2>
        <p className="text-sm text-slate-500 mt-1 h-10">
          {integration.description}
        </p>
      </div>
    </div>
  </div>
);

// --- Main Integrations Page ---
export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Integrations</h1>
        <p className="mt-1 text-slate-500">
          Connect The Catalyst to your existing tools and services.
        </p>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search integrations..."
          className="w-full max-w-lg rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
        />
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrationsData.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>
    </div>
  );
}
