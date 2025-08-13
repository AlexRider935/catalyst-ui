"use client";

import { useState } from "react";
import { User, Shield, KeyRound, Bell } from "lucide-react";

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

// --- Main Profile Page ---
export default function ProfilePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Your Profile</h1>
        <p className="mt-1.5 text-slate-500">
          Manage your personal information and security settings.
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm text-center">
            <div className="w-24 h-24 rounded-full bg-slate-200 mx-auto" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Alex Rider
            </h2>
            <p className="text-sm text-slate-500">director@thecatalyst.io</p>
            <span className="mt-4 inline-flex items-center rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Owner
            </span>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
            <div className="p-6 border-b border-slate-200/80">
              <h2 className="text-lg font-semibold text-slate-800">
                Personal Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  defaultValue="Alex Rider"
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue="director@thecatalyst.io"
                  disabled
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm bg-slate-50 text-slate-500"
                />
              </div>
            </div>
            <div className="bg-slate-50/70 px-6 py-4 text-right rounded-b-xl">
              <button
                type="button"
                className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                Save Changes
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
            <div className="p-6 border-b border-slate-200/80">
              <h2 className="text-lg font-semibold text-slate-800">Security</h2>
            </div>
            <div className="p-6 space-y-4 divide-y divide-slate-200/80">
              <div className="pt-4 first:pt-0">
                <h3 className="font-medium text-slate-800">Change Password</h3>
                <div className="mt-4 space-y-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
                  />
                </div>
              </div>
              <div className="pt-4">
                <h3 className="font-medium text-slate-800">
                  Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-slate-500">
                    Protect your account with an extra layer of security.
                  </p>
                  <ToggleSwitch enabled={true} />
                </div>
              </div>
            </div>
            <div className="bg-slate-50/70 px-6 py-4 text-right rounded-b-xl">
              <button
                type="button"
                className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                Update Security
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
