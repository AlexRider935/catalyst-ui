"use client";

import { useState } from "react";
import {
  User,
  Shield,
  KeyRound,
  Bell,
  Camera,
  Edit3,
  Mail,
  CheckCircle,
  Clock,
  Monitor,
  Smartphone,
  LogOut,
  Plus,
  MoreVertical,
  Trash2,
  History,
} from "lucide-react";

// --- Reusable Components ---
const ProfileCard = ({ user }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm text-center sticky top-6">
    <div className="relative w-24 h-24 mx-auto group">
      <img
        src={user.avatar}
        alt="User Avatar"
        className="w-24 h-24 rounded-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        <Camera className="w-6 h-6 text-white" />
      </div>
    </div>
    <h2 className="mt-4 text-xl font-bold text-slate-900">{user.name}</h2>
    <p className="text-sm text-slate-500 flex items-center justify-center gap-1.5">
      {user.email} <CheckCircle size={14} className="text-green-500" />
    </p>
    <span className="mt-4 inline-flex items-center rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
      {user.role}
    </span>
    <div className="text-left mt-6 pt-4 border-t border-slate-200/80 space-y-3">
      <div>
        <p className="text-xs text-slate-400 uppercase font-semibold">
          Last Login
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Aug 14, 2025, 5:30 PM from 192.168.1.1
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase font-semibold">
          MFA Status
        </p>
        <p className="text-sm text-green-600 font-semibold mt-1 flex items-center gap-2">
          <Shield size={14} /> Enabled
        </p>
      </div>
    </div>
  </div>
);

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
      active
        ? "bg-slate-800 text-white shadow-md"
        : "text-slate-600 hover:bg-slate-100"
    }`}>
    {label}
  </button>
);

const SettingsCard = ({ title, description, children, footer }) => (
  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
    <div className="p-6 border-b border-slate-200/80">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {description && (
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      )}
    </div>
    <div className="p-6 space-y-6">{children}</div>
    {footer && (
      <div className="bg-slate-50/70 px-6 py-4 text-right rounded-b-xl border-t border-slate-200/80">
        {footer}
      </div>
    )}
  </div>
);

// --- Tab Content Components ---
const OverviewTab = () => {
  const [name, setName] = useState("Alex Rider");
  return (
    <SettingsCard
      title="Personal Information"
      footer={
        <button
          type="button"
          className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
          Save Changes
        </button>
      }>
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            name="email"
            id="email"
            defaultValue="director@thecatalyst.io"
            disabled
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm bg-slate-50 text-slate-500 pr-10"
          />
          <Mail
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>
    </SettingsCard>
  );
};

const SecurityTab = () => {
  return (
    <div className="space-y-8">
      <SettingsCard
        title="Password"
        description="It's recommended to use a strong, unique password."
        footer={
          <button
            type="button"
            className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            Update Password
          </button>
        }>
        <div className="space-y-4">
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
      </SettingsCard>
      <SettingsCard
        title="Multi-Factor Authentication (MFA)"
        description="Protect your account with an extra layer of security.">
        <ul className="divide-y divide-slate-200/80 -mt-6">
          <li className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-slate-500" />
              <p className="font-medium text-slate-700">Authenticator App</p>
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              Enabled
            </span>
          </li>
          <li className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <KeyRound size={18} className="text-slate-500" />
              <p className="font-medium text-slate-700">Security Key</p>
            </div>
            <button className="text-sm font-semibold text-blue-600 hover:underline">
              Add
            </button>
          </li>
        </ul>
      </SettingsCard>
    </div>
  );
};

const ApiKeysTab = () => {
  return (
    <SettingsCard
      title="Personal API Keys"
      description="Manage your personal API keys for scripting and automation."
      footer={
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
          <Plus size={16} /> Create Key
        </button>
      }>
      <ul className="divide-y divide-slate-200/80 -mt-6">
        <li className="flex items-center justify-between py-4">
          <div>
            <p className="font-semibold text-slate-800">My Automation Script</p>
            <p className="font-mono text-sm text-slate-500">cat_live_...a4f2</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-500">Last used: 3 hours ago</p>
            <button className="p-2 text-slate-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        </li>
      </ul>
    </SettingsCard>
  );
};

const ActivityTab = () => {
  const activityLog = [
    {
      id: 1,
      action: "Logged in",
      ip: "192.168.1.1",
      location: "New York, USA",
      time: "2 minutes ago",
      icon: Monitor,
    },
    {
      id: 2,
      action: "Password Changed",
      ip: "192.168.1.1",
      location: "New York, USA",
      time: "1 day ago",
      icon: KeyRound,
    },
    {
      id: 3,
      action: "Logged in",
      ip: "8.8.8.8",
      location: "London, UK",
      time: "3 days ago",
      icon: Smartphone,
    },
  ];
  return (
    <SettingsCard
      title="Recent Activity"
      description="A log of your recent security-related actions.">
      <ul className="divide-y divide-slate-200/80 -mt-6">
        {activityLog.map((log) => (
          <li key={log.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <log.icon size={24} className="text-slate-500" />
              <div>
                <p className="font-semibold text-slate-800">{log.action}</p>
                <p className="text-sm text-slate-500">
                  {log.location} ({log.ip})
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500">{log.time}</p>
          </li>
        ))}
      </ul>
    </SettingsCard>
  );
};

// --- Main Profile Page ---
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const user = {
    name: "Alex Rider",
    email: "director@thecatalyst.io",
    role: "Owner",
    avatar: "https://i.pravatar.cc/150?u=alexrider",
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return <OverviewTab />;
      case "Security":
        return <SecurityTab />;
      case "API Keys":
        return <ApiKeysTab />;
      case "Activity":
        return <ActivityTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Your Profile</h1>
        <p className="mt-1.5 text-slate-500">
          Manage your personal information, security settings, and activity.
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <ProfileCard user={user} />
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-3 space-y-8">
          <div className="p-1 bg-slate-100 rounded-lg flex items-center gap-1 overflow-x-auto">
            <TabButton
              label="Overview"
              active={activeTab === "Overview"}
              onClick={() => setActiveTab("Overview")}
            />
            <TabButton
              label="Security"
              active={activeTab === "Security"}
              onClick={() => setActiveTab("Security")}
            />
            <TabButton
              label="API Keys"
              active={activeTab === "API Keys"}
              onClick={() => setActiveTab("API Keys")}
            />
            <TabButton
              label="Activity"
              active={activeTab === "Activity"}
              onClick={() => setActiveTab("Activity")}
            />
          </div>
          <div key={activeTab} className="animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
