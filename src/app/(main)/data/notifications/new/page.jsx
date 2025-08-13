"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert, MessageSquare, Mail } from "lucide-react";

export default function NewNotificationRulePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/data/notifications"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Create New Notification Rule
            </h1>
            <p className="mt-1 text-slate-500">
              Define the conditions and actions for a new notification.
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

      {/* Main Editor Form */}
      <div className="space-y-8">
        {/* Rule Details */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800">Rule Details</h2>
          <div className="mt-4 space-y-4">
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
                placeholder="e.g., Notify SOC on Critical Events"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Trigger Section (IF) */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800">Trigger (IF)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Define the condition that will trigger this notification.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="triggerType"
                className="block text-sm font-medium text-slate-700">
                Trigger Type
              </label>
              <select
                id="triggerType"
                name="triggerType"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm">
                <option>Security Event</option>
                <option>Vulnerability Detected</option>
                <option>Compliance Drift</option>
                <option>On a Schedule</option>
              </select>
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
                <option>Any</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Section (THEN) */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Action (THEN)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Define what happens when the trigger condition is met.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="actionType"
                className="block text-sm font-medium text-slate-700">
                Action Type
              </label>
              <select
                id="actionType"
                name="actionType"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm">
                <option>Send Slack Message</option>
                <option>Send Email</option>
                <option>Create Jira Ticket</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="recipient"
                className="block text-sm font-medium text-slate-700">
                Recipient
              </label>
              <input
                type="text"
                name="recipient"
                id="recipient"
                placeholder="#soc-alerts or team@example.com"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
