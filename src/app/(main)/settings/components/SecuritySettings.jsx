"use client";

import { useState } from "react";
import {
  KeyRound,
  Shield,
  Smartphone,
  Monitor,
  AlertTriangle,
  Trash2,
  Plus,
} from "lucide-react";

// ARCHITECT'S NOTE:
// You will need to create and import the following new components.
// Their code is provided in the subsequent sections.
import AddAuthMethodModal from "./AddAuthModal";
import RevokeSessionModal from "./RevokeSessionModal";
import RevokeAllSessionsModal from "./RevokeAllSessions";

// --- Reusable Components ---
const SettingsCard = ({ title, description, children, footer, isDanger }) => (
  <div
    className={`rounded-xl border ${
      isDanger ? "border-red-500/30" : "border-slate-200"
    } bg-white shadow-sm`}>
    <div
      className={`p-6 border-b ${
        isDanger ? "border-red-500/20" : "border-slate-200"
      }`}>
      <h2
        className={`text-xl font-semibold ${
          isDanger ? "text-red-800" : "text-slate-800"
        }`}>
        {title}
      </h2>
      {description && (
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      )}
    </div>
    <div className="p-6">{children}</div>
    {footer && (
      <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end items-center gap-3">
        {footer}
      </div>
    )}
  </div>
);

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = () => {
    const length = password.length;
    if (length === 0) return { level: 0, text: "", color: "" };
    if (length < 8) return { level: 1, text: "Weak", color: "bg-red-500" };
    if (length < 12) return { level: 2, text: "Medium", color: "bg-amber-500" };
    return { level: 3, text: "Strong", color: "bg-green-500" };
  };

  const { level, text, color } = getStrength();
  if (level === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs font-semibold text-slate-600">
          Password Strength
        </p>
        <p className={`text-xs font-semibold ${color.replace("bg-", "text-")}`}>
          {text}
        </p>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${(level / 3) * 100}%` }}></div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function SecuritySettings() {
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // State for controlling modals
  const [sessionToRevoke, setSessionToRevoke] = useState(null);
  const [isAddAuthOpen, setIsAddAuthOpen] = useState(false);
  const [isRevokeAllOpen, setIsRevokeAllOpen] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdatePassword = () => {
    if (isPasswordFormValid) {
      console.log("Updating password...", passwordData);
      // API call would go here
    }
  };

  const isPasswordFormValid =
    passwordData.current &&
    passwordData.new &&
    passwordData.new.length >= 12 &&
    passwordData.new === passwordData.confirm;

  const activeSessions = [
    {
      id: 1,
      device: "Chrome on macOS",
      location: "New York, USA (123.45.67.89)",
      status: "Active now",
      icon: Monitor,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "London, UK (98.76.54.32) - 2 days ago",
      icon: Smartphone,
    },
  ];

  return (
    <>
      <div className="space-y-8">
        <SettingsCard
          title="Password"
          description="Update your password. A strong password contains a mix of letters, numbers, and symbols."
          footer={
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={!isPasswordFormValid}
              className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              Update Password
            </button>
          }>
          {/* CORRECTED: Layout for password fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="current"
                className="block text-sm font-medium text-slate-700">
                Current Password
              </label>
              <input
                type="password"
                name="current"
                id="current"
                value={passwordData.current}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div></div> {/* Empty div for grid alignment */}
            <div>
              <label
                htmlFor="new"
                className="block text-sm font-medium text-slate-700">
                New Password
              </label>
              <input
                type="password"
                name="new"
                id="new"
                value={passwordData.new}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <PasswordStrengthMeter password={passwordData.new} />
            </div>
            <div>
              <label
                htmlFor="confirm"
                className="block text-sm font-medium text-slate-700">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirm"
                id="confirm"
                value={passwordData.confirm}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Multi-Factor Authentication (MFA)"
          description="Protect your account from unauthorized access by requiring a second factor of authentication.">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-4">
                <Smartphone className="h-6 w-6 text-slate-500" />
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Authenticator App
                  </h3>
                  <p className="text-sm text-slate-500">
                    Primary method, configured on 2025-07-10
                  </p>
                </div>
              </div>
              <button
                onClick={() => console.log("Revoking Authenticator App")}
                className="text-sm font-semibold text-red-600 hover:text-red-800 cursor-pointer">
                Revoke
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-4">
                <KeyRound className="h-6 w-6 text-slate-500" />
                <div>
                  <h3 className="font-semibold text-slate-800">Security Key</h3>
                  <p className="text-sm text-slate-500">
                    YubiKey 5 NFC, added on 2025-08-01
                  </p>
                </div>
              </div>
              <button
                onClick={() => console.log("Revoking Security Key")}
                className="text-sm font-semibold text-red-600 hover:text-red-800 cursor-pointer">
                Revoke
              </button>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => setIsAddAuthOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer">
              <Plus size={16} /> Add Authentication Method
            </button>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Active Sessions"
          description="This is a list of devices that have logged into your account. Revoke any sessions you do not recognize.">
          <ul className="divide-y divide-slate-200 -mt-6">
            {activeSessions.map((session) => (
              <li key={session.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <session.icon className="h-8 w-8 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-800">
                        {session.device}{" "}
                        {session.status === "Active now" && (
                          <span className="text-green-600 font-semibold">
                            - {session.status}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500">
                        {session.location}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSessionToRevoke(session)}
                    className="text-sm font-semibold text-slate-600 hover:text-red-600 cursor-pointer">
                    Revoke
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-right">
            <button
              onClick={() => setIsRevokeAllOpen(true)}
              className="rounded-md border border-red-300 bg-red-50 py-2 px-4 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100 cursor-pointer">
              <Trash2 className="inline -ml-1 mr-2 h-4 w-4" /> Log out of all
              other sessions
            </button>
          </div>
        </SettingsCard>
      </div>

      {/* Modal Components */}
      <AddAuthMethodModal isOpen={isAddAuthOpen} onClose={() => setIsAddAuthOpen(false)} />
      <RevokeSessionModal session={sessionToRevoke} onClose={() => setSessionToRevoke(null)} />
      <RevokeAllSessionsModal isOpen={isRevokeAllOpen} onClose={() => setIsRevokeAllOpen(false)} />
    </>
  );
}
