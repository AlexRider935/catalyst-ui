"use client";

import { useState } from "react";
import {
  Sun,
  Moon,
  Laptop,
  Bell,
  Mail,
  MessageSquare,
  Monitor,
  Smartphone,
} from "lucide-react";

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

// --- Main Preferences Page ---
export default function PreferencesPage() {
  const [theme, setTheme] = useState("System");
  const activeSessions = [
    {
      id: 1,
      type: "Desktop",
      browser: "Chrome on macOS",
      ip: "192.168.1.1",
      isCurrent: true,
      lastSeen: "Active now",
    },
    {
      id: 2,
      type: "Mobile",
      browser: "Safari on iOS",
      ip: "8.8.8.8",
      isCurrent: false,
      lastSeen: "2 hours ago",
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Preferences</h1>
        <p className="mt-1.5 text-slate-500">
          Customize your Catalyst experience.
        </p>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
        <div className="p-6 border-b border-slate-200/80">
          <h2 className="text-lg font-semibold text-slate-800">Appearance</h2>
          <p className="text-sm text-slate-500 mt-1">
            Choose how The Catalyst looks and feels.
          </p>
        </div>
        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-700">Theme</h3>
          <div className="mt-2 grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("Light")}
              className={`p-4 rounded-lg border-2 ${
                theme === "Light" ? "border-blue-500" : "border-slate-200"
              }`}>
              <Sun size={20} className="mx-auto mb-2" />{" "}
              <span className="text-sm">Light</span>
            </button>
            <button
              onClick={() => setTheme("Dark")}
              className={`p-4 rounded-lg border-2 ${
                theme === "Dark" ? "border-slate-200" : "border-slate-200"
              }`}>
              <Moon size={20} className="mx-auto mb-2" />{" "}
              <span className="text-sm">Dark</span>
            </button>
            <button
              onClick={() => setTheme("System")}
              className={`p-4 rounded-lg border-2 ${
                theme === "System" ? "border-blue-500" : "border-slate-200"
              }`}>
              <Laptop size={20} className="mx-auto mb-2" />{" "}
              <span className="text-sm">System</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
        <div className="p-6 border-b border-slate-200/80">
          <h2 className="text-lg font-semibold text-slate-800">
            Notifications
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage how you receive alerts and updates.
          </p>
        </div>
        <ul className="divide-y divide-slate-200/80 p-6">
          <li className="flex items-center justify-between py-3">
            <p className="font-medium text-slate-700">
              Critical Security Events
            </p>
            <ToggleSwitch enabled={true} />
          </li>
          <li className="flex items-center justify-between py-3">
            <p className="font-medium text-slate-700">
              New Vulnerability Disclosures
            </p>
            <ToggleSwitch enabled={true} />
          </li>
          <li className="flex items-center justify-between py-3">
            <p className="font-medium text-slate-700">
              Compliance Control Failures
            </p>
            <ToggleSwitch enabled={false} />
          </li>
        </ul>
      </div>

      {/* Session Management */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
        <div className="p-6 border-b border-slate-200/80">
          <h2 className="text-lg font-semibold text-slate-800">
            Active Sessions
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage devices that are logged into your account.
          </p>
        </div>
        <ul className="divide-y divide-slate-200/80">
          {activeSessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                {session.type === "Desktop" ? (
                  <Monitor size={24} className="text-slate-500" />
                ) : (
                  <Smartphone size={24} className="text-slate-500" />
                )}
                <div>
                  <p className="font-semibold text-slate-800">
                    {session.browser}
                  </p>
                  <p className="text-sm text-slate-500">
                    {session.ip} &middot;{" "}
                    <span className={session.isCurrent ? "text-green-600" : ""}>
                      {session.lastSeen}
                    </span>
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <button className="text-sm font-medium text-red-600 hover:underline">
                  Log out
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
