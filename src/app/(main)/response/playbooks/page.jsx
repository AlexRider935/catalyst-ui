"use client";

import { useState } from "react";
import {
  Zap,
  Plus,
  Search,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  Server,
  User,
} from "lucide-react";
import Link from "next/link";

// --- Mock Data ---
const playbookData = [
  {
    id: "pb-1",
    name: "Isolate Endpoint on High-Severity Alert",
    trigger: "Security Event",
    steps: 4,
    status: true,
  },
  {
    id: "pb-2",
    name: "Disable User on Brute Force Detection",
    trigger: "Detection Rule",
    steps: 3,
    status: true,
  },
  {
    id: "pb-3",
    name: "Scan Endpoint for Vulnerabilities on New Asset",
    trigger: "Asset Discovery",
    steps: 2,
    status: true,
  },
  {
    id: "pb-4",
    name: "Notify Admin on Compliance Control Failure",
    trigger: "Compliance Event",
    steps: 2,
    status: false,
  },
];

const triggerMap = {
  "Security Event": { icon: ShieldAlert },
  "Detection Rule": { icon: GitBranch },
  "Asset Discovery": { icon: Server },
  "Compliance Event": { icon: ShieldCheck }, // Assuming you might add this icon
};

// --- Toggle Switch Component ---
const ToggleSwitch = ({ enabled }) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsEnabled(!isEnabled);
      }}
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

// --- Main Playbooks Page ---
export default function PlaybooksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Response Playbooks
          </h1>
          <p className="mt-1 text-slate-500">
            Automate your security workflows with pre-defined response actions.
          </p>
        </div>
        <Link href="/response/playbooks/new">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Plus size={18} />
            New Playbook
          </button>
        </Link>
      </div>

      {/* Playbook Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {playbookData.map((playbook) => {
          const TriggerIcon = triggerMap[playbook.trigger]?.icon || Zap;
          return (
            <div
              key={playbook.id}
              className="group relative rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-500 hover:shadow-md cursor-pointer">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-slate-100 p-3 text-slate-600">
                    <TriggerIcon size={24} />
                  </div>
                  <ToggleSwitch enabled={playbook.status} />
                </div>
                <div className="mt-4">
                  <h2 className="font-semibold text-lg text-slate-800">
                    {playbook.name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Triggered by: {playbook.trigger}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-3 rounded-b-xl">
                <p className="text-xs font-medium text-slate-600">
                  {playbook.steps} Steps
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
