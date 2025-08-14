"use client";

import { useState } from "react";
import { Switch } from "@headlessui/react";

const SettingsCard = ({ title, subtitle, children, footer }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="p-6 border-b border-slate-200">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    <div className="p-6 space-y-6">{children}</div>
    {footer && (
      <div className="bg-slate-50/80 px-6 py-4 text-right rounded-b-xl border-t border-slate-200">
        {footer}
      </div>
    )}
  </div>
);

export default function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  return (
    <div className="space-y-8">
      <SettingsCard
        title="Password"
        subtitle="Manage your password. It's recommended to use a strong, unique password."
        footer={
          <button
            type="button"
            className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            Update Password
          </button>
        }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="current_password">Current Password</label>
            <input
              type="password"
              name="current_password"
              id="current_password"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="new_password">New Password</label>
            <input
              type="password"
              name="new_password"
              id="new_password"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </SettingsCard>
      <SettingsCard
        title="Two-Factor Authentication"
        subtitle="Add an additional layer of security to your account.">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <h3 className="font-semibold text-slate-800">Authenticator App</h3>
            <p className="text-sm text-slate-500">
              Use an app like Google Authenticator or Authy.
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onChange={setTwoFactorEnabled}
            className={`${
              twoFactorEnabled ? "bg-blue-600" : "bg-slate-200"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}>
            <span
              className={`${
                twoFactorEnabled ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </SettingsCard>
      <SettingsCard
        title="Active Sessions"
        subtitle="This is a list of devices that have logged into your account.">
        <ul className="divide-y divide-slate-200 -mt-6">
          <li className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-slate-800">
                Chrome on macOS -{" "}
                <span className="text-green-600 font-semibold">Active now</span>
              </p>
              <p className="text-sm text-slate-500">
                New York, USA (123.45.67.89)
              </p>
            </div>
            <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              Revoke
            </button>
          </li>
          <li className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-slate-800">Safari on iPhone</p>
              <p className="text-sm text-slate-500">
                London, UK (98.76.54.32) - 2 days ago
              </p>
            </div>
            <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              Revoke
            </button>
          </li>
        </ul>
      </SettingsCard>
    </div>
  );
}
