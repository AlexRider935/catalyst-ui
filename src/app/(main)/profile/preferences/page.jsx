"use client";

import { useState } from "react";
import {
  Sun,
  Moon,
  Laptop,
  Monitor,
  Smartphone,
  AlertTriangle,
  X,
  Check,
  Trash2,
  FileText,
  Type,
  Eye,
  History,
} from "lucide-react";

// --- Reusable Components ---
const SettingsCard = ({ title, description, children, footer }) => (
  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
    <div className="p-6 border-b border-slate-200/80">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {description && (
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      )}
    </div>
    {children}
    {footer && (
      <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-between items-center">
        {footer}
      </div>
    )}
  </div>
);

const ThemeOption = ({ theme, currentTheme, setTheme, Icon, label }) => (
  <button
    onClick={() => setTheme(theme)}
    className={`group p-4 rounded-lg border-2 transition-all duration-200 w-full ${
      currentTheme === theme
        ? "border-blue-500 bg-blue-50 shadow-md"
        : "border-slate-200 hover:border-slate-300"
    }`}>
    <div className="flex flex-col items-center">
      <Icon
        size={24}
        className={`mb-2 transition-colors ${
          currentTheme === theme
            ? "text-blue-600"
            : "text-slate-500 group-hover:text-slate-700"
        }`}
      />
      <span
        className={`text-sm font-semibold transition-colors ${
          currentTheme === theme ? "text-blue-800" : "text-slate-700"
        }`}>
        {label}
      </span>
      {currentTheme === theme && (
        <Check size={16} className="text-blue-600 absolute top-3 right-3" />
      )}
    </div>
  </button>
);

const CustomSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`${
      checked ? "bg-slate-800" : "bg-slate-200"
    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer`}>
    <span
      className={`${
        checked ? "translate-x-6" : "translate-x-1"
      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
    />
  </button>
);

const RevokeSessionModal = ({ session, onClose }) => {
  if (!session) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl m-4">
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Log Out of Session?
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Are you sure you want to log out the session on{" "}
            <strong className="text-slate-700">{session.browser}</strong>?
          </p>
        </div>
        <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => {
              console.log(`Logging out session ${session.id}`);
              onClose();
            }}
            className="rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700 cursor-pointer">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

const RevokeAllSessionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl m-4">
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Log Out of All Other Sessions?
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            This will sign you out of all other active sessions. Your current
            session will not be affected.
          </p>
        </div>
        <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => {
              console.log(`Logging out all other sessions`);
              onClose();
            }}
            className="rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700 cursor-pointer">
            Confirm & Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Preferences Page ---
export default function PreferencesPage() {
  const [theme, setTheme] = useState("System");
  const [sessionToRevoke, setSessionToRevoke] = useState(null);
  const [isRevokeAllOpen, setIsRevokeAllOpen] = useState(false);

  const [notificationPreferences, setNotificationPreferences] = useState([
    {
      id: "security",
      label: "Critical Security Events",
      inApp: true,
      email: true,
      sms: true,
    },
    {
      id: "vulnerability",
      label: "High-Severity CVE Match",
      inApp: true,
      email: true,
      sms: false,
    },
    {
      id: "compliance",
      label: "Compliance Control Failures",
      inApp: true,
      email: true,
      sms: false,
    },
    {
      id: "mentions",
      label: "Mentions & Comments",
      inApp: true,
      email: false,
      sms: false,
    },
  ]);

  const handleNotificationChange = (id, channel) => {
    setNotificationPreferences((prefs) =>
      prefs.map((p) => (p.id === id ? { ...p, [channel]: !p[channel] } : p))
    );
  };

  const activeSessions = [
    {
      id: 1,
      type: "Desktop",
      browser: "Chrome on macOS",
      ip: "192.168.1.1",
      isCurrent: true,
      lastSeen: "Active now",
      location: "New York, USA",
    },
    {
      id: 2,
      type: "Mobile",
      browser: "Safari on iOS",
      ip: "8.8.8.8",
      isCurrent: false,
      lastSeen: "2 hours ago",
      location: "London, UK",
    },
  ];

  return (
    <>
      <div className="space-y-10 max-w-5xl mx-auto">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Preferences</h1>
          <p className="mt-1.5 text-slate-500">
            Customize your personal security posture, notifications, and
            accessibility settings.
          </p>
        </div>

        {/* Appearance Settings */}
        <SettingsCard
          title="Appearance & Accessibility"
          description="Choose how The Catalyst looks and feels, and configure accessibility options.">
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Theme
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ThemeOption
                  theme="Light"
                  currentTheme={theme}
                  setTheme={setTheme}
                  Icon={Sun}
                  label="Light"
                />
                <ThemeOption
                  theme="Dark"
                  currentTheme={theme}
                  setTheme={setTheme}
                  Icon={Moon}
                  label="Dark"
                />
                <ThemeOption
                  theme="System"
                  currentTheme={theme}
                  setTheme={setTheme}
                  Icon={Laptop}
                  label="System"
                />
              </div>
            </div>
            <div className="border-t border-slate-200 -mx-6 px-6 pt-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Accessibility
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-700">Font Size</p>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-sm rounded-md bg-slate-100 hover:bg-slate-200 cursor-pointer">
                      Default
                    </button>
                    <button className="px-3 py-1 text-sm rounded-md hover:bg-slate-200 cursor-pointer">
                      Large
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-700">
                    High Contrast Mode
                  </p>
                  <CustomSwitch checked={false} onChange={() => {}} />
                </div>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Notification Settings */}
        <SettingsCard
          title="Notification Preferences"
          description="Manage how you receive alerts for security and compliance events.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 bg-slate-50">
                <tr>
                  <th className="p-4 font-medium">Notification Type</th>
                  <th className="p-4 font-medium text-center">In-App</th>
                  <th className="p-4 font-medium text-center">Email</th>
                  <th className="p-4 font-medium text-center">SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {notificationPreferences.map((pref) => (
                  <tr key={pref.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-medium text-slate-800">
                      {pref.label}
                    </td>
                    <td className="p-4 text-center">
                      <CustomSwitch
                        checked={pref.inApp}
                        onChange={() =>
                          handleNotificationChange(pref.id, "inApp")
                        }
                      />
                    </td>
                    <td className="p-4 text-center">
                      <CustomSwitch
                        checked={pref.email}
                        onChange={() =>
                          handleNotificationChange(pref.id, "email")
                        }
                      />
                    </td>
                    <td className="p-4 text-center">
                      <CustomSwitch
                        checked={pref.sms}
                        onChange={() =>
                          handleNotificationChange(pref.id, "sms")
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>

        {/* Data & Privacy Settings */}
        <SettingsCard
          title="Data & Privacy"
          description="Manage your personal data and view access logs.">
          <ul className="divide-y divide-slate-200/80">
            <li className="flex items-center justify-between p-6">
              <div>
                <p className="font-semibold text-slate-800">
                  Export Personal Data
                </p>
                <p className="text-sm text-slate-500">
                  Download a copy of your personal data in a machine-readable
                  format.
                </p>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                Request Export
              </button>
            </li>
            <li className="flex items-center justify-between p-6">
              <div>
                <p className="font-semibold text-slate-800">Access Log</p>
                <p className="text-sm text-slate-500">
                  View a log of who has accessed your personal data.
                </p>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                <History size={14} /> View Log
              </button>
            </li>
          </ul>
        </SettingsCard>

        {/* Session Management */}
        <SettingsCard
          title="Active Sessions"
          description="Manage devices that are logged into your account."
          footer={
            <button
              onClick={() => setIsRevokeAllOpen(true)}
              className="rounded-md border border-red-300 bg-red-50 py-2 px-4 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100 cursor-pointer">
              <Trash2 className="inline -ml-1 mr-2 h-4 w-4" /> Log out of all
              other sessions
            </button>
          }>
          <ul className="divide-y divide-slate-200/80 -mt-6">
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
                      {session.isCurrent && (
                        <span className="ml-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          Current session
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500">
                      {session.location} ({session.ip}) &middot;{" "}
                      {session.lastSeen}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => setSessionToRevoke(session)}
                    className="text-sm font-medium text-red-600 hover:underline cursor-pointer">
                    Log out
                  </button>
                )}
              </li>
            ))}
          </ul>
        </SettingsCard>
      </div>
      <RevokeSessionModal
        session={sessionToRevoke}
        onClose={() => setSessionToRevoke(null)}
      />
      <RevokeAllSessionsModal
        isOpen={isRevokeAllOpen}
        onClose={() => setIsRevokeAllOpen(false)}
      />
    </>
  );
}
