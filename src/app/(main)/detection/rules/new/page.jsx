"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GitBranch,
  Play,
  HelpCircle,
  Bot,
  Zap,
  Bell,
  ShieldAlert,
} from "lucide-react";

// --- Reusable Card Component ---
const StudioCard = ({ title, description, children }) => (
  <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
    <div className="p-4 border-b border-slate-200/80">
      <h2 className="font-semibold text-slate-800">{title}</h2>
      {description && (
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      )}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// --- Main Rule Editor Page ---
export default function NewRulePage() {
  const ruleLogicPlaceholder = `event.type == 'authentication' AND source.ip in PRIVATE_IP_SPACE AND user.is_admin == true`;
  const sampleEvent = {
    "event.type": "authentication",
    "source.ip": "10.0.1.5",
    "user.name": "jane.doe",
    "user.is_admin": true,
    outcome: "success",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/detection/rules"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Rule Editor</h1>
            <p className="mt-1 text-slate-500">
              Define the logic and actions for a new detection rule.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg border border-transparent bg-blue-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            Save Rule
          </button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left & Center Column: Rule Definition */}
        <div className="lg:col-span-2 space-y-6">
          <StudioCard title="Rule Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="ruleName"
                  className="block text-sm font-medium text-slate-700">
                  Rule Name
                </label>
                <input
                  type="text"
                  name="ruleName"
                  id="ruleName"
                  placeholder="e.g., Admin Login from Internal IP"
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="severity"
                  className="block text-sm font-medium text-slate-700">
                  Severity
                </label>
                <select
                  id="severity"
                  name="severity"
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>
          </StudioCard>

          <StudioCard
            title="IF: Detection Logic"
            description="Write your detection logic using the Catalyst Query Language (CQL).">
            <textarea
              className="w-full h-48 p-4 font-mono text-sm bg-slate-900 text-cyan-300 rounded-lg border-slate-700"
              defaultValue={ruleLogicPlaceholder}
            />
          </StudioCard>

          <StudioCard
            title="THEN: Response Actions"
            description="Define what happens when this rule is triggered.">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                <Bot size={20} className="text-slate-500" />
                <div>
                  <p className="font-medium text-slate-800">Execute Playbook</p>
                  <p className="text-xs text-slate-500">
                    Run an automated response workflow.
                  </p>
                </div>
                <select className="ml-auto w-48 rounded-md border-slate-300 shadow-sm sm:text-sm">
                  <option>Isolate Endpoint</option>
                  <option>Disable User</option>
                </select>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                <Bell size={20} className="text-slate-500" />
                <div>
                  <p className="font-medium text-slate-800">
                    Send Notification
                  </p>
                  <p className="text-xs text-slate-500">
                    Alert a user or channel.
                  </p>
                </div>
                <select className="ml-auto w-48 rounded-md border-slate-300 shadow-sm sm:text-sm">
                  <option>Notify SOC on Slack</option>
                  <option>Email CISO</option>
                </select>
              </div>
            </div>
          </StudioCard>
        </div>

        {/* Right Column: Live Test */}
        <div className="lg:col-span-1 lg:sticky lg:top-10">
          <StudioCard
            title="Live Test"
            description="Test your rule logic against a sample event.">
            <div className="flex-1 flex flex-col">
              <p className="text-xs font-medium text-slate-600 mb-2">
                Sample Event (JSON)
              </p>
              <div className="h-64 rounded-lg bg-slate-900 p-4 flex-1">
                <pre className="text-xs text-white h-full overflow-auto">
                  {JSON.stringify(sampleEvent, null, 2)}
                </pre>
              </div>
              <button className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900">
                <Play size={14} /> Test Rule
              </button>
              <div className="mt-4 text-center p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="font-semibold text-green-700 flex items-center justify-center gap-2">
                  <ShieldAlert size={16} /> Rule would have triggered.
                </p>
              </div>
            </div>
          </StudioCard>
        </div>
      </div>
    </div>
  );
}
