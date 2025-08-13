"use client";

import { useState } from "react";
import {
  Bell,
  Plus,
  Search,
  Filter,
  ShieldAlert,
  MessageSquare,
  Mail,
} from "lucide-react";
import Link from "next/link";

// --- Mock Data ---
const notificationRulesData = [
  {
    id: "nr-1",
    name: "Notify SOC on Critical Security Events",
    condition: "Event Severity is Critical",
    action: "Notify #soc-alerts on Slack",
    status: true,
  },
  {
    id: "nr-2",
    name: "Email CISO on High Severity Vulnerability",
    condition: "Vulnerability Severity is High",
    action: "Email ciso@thecatalyst.io",
    status: true,
  },
  {
    id: "nr-3",
    name: "Notify Compliance on PCI Failures",
    condition: "Compliance Control Status is Violation",
    action: "Notify #compliance on Slack",
    status: true,
  },
  {
    id: "nr-4",
    name: "Weekly Summary Report",
    condition: "On a schedule (Every Friday)",
    action: "Email security-team@thecatalyst.io",
    status: false,
  },
];

const actionMap = {
  Slack: { icon: MessageSquare },
  Email: { icon: Mail },
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

// --- Main Notification Rules Page ---
export default function NotificationRulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Notification Rules
          </h1>
          <p className="mt-1 text-slate-500">
            Manage how and when you are alerted about platform activities.
          </p>
        </div>
        <Link href="/data/notifications/new">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Plus size={18} />
            New Rule
          </button>
        </Link>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {notificationRulesData.map((rule) => {
          const ActionIcon = rule.action.includes("Slack")
            ? MessageSquare
            : Mail;
          return (
            <div
              key={rule.id}
              className="group relative rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <h2 className="font-semibold text-lg text-slate-800 flex-1 pr-4">
                    {rule.name}
                  </h2>
                  <ToggleSwitch enabled={rule.status} />
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      If
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <ShieldAlert size={16} className="text-slate-500" />
                      <p className="text-sm text-slate-600">{rule.condition}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Then
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <ActionIcon size={16} className="text-slate-500" />
                      <p className="text-sm text-slate-600">{rule.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
