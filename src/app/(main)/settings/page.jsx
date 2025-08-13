"use client";

import { useState } from "react";
import {
  User,
  Building,
  Users,
  CreditCard,
  KeyRound,
  Plus,
  Trash2,
  Copy,
  Check,
} from "lucide-react";

const settingsNav = [
  { name: "Profile", icon: User },
  { name: "Organization", icon: Building },
  { name: "Team", icon: Users },
  { name: "Billing", icon: CreditCard },
  { name: "API Keys", icon: KeyRound },
];

// --- Sub-Components for each Settings View ---

const ProfileSettings = () => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="p-6 border-b border-slate-200">
      <h2 className="text-xl font-semibold text-slate-800">Profile</h2>
      <p className="text-sm text-slate-500 mt-1">
        This is how others will see you on the site.
      </p>
    </div>
    <div className="p-6 space-y-6">
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
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
    </div>
    <div className="bg-slate-50 px-6 py-4 text-right rounded-b-xl">
      <button
        type="button"
        className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
        Save Changes
      </button>
    </div>
  </div>
);

const OrganizationSettings = () => (
  <div className="space-y-8">
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800">Organization</h2>
        <p className="text-sm text-slate-500 mt-1">
          Update your organization's details.
        </p>
      </div>
      <div className="p-6">
        <label
          htmlFor="orgName"
          className="block text-sm font-medium text-slate-700">
          Organization Name
        </label>
        <input
          type="text"
          name="orgName"
          id="orgName"
          defaultValue="The Catalyst Corp."
          className="mt-1 block w-full max-w-lg rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div className="bg-slate-50 px-6 py-4 text-right rounded-b-xl">
        <button
          type="button"
          className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
          Save Changes
        </button>
      </div>
    </div>

    <div className="rounded-xl border border-red-500/50 bg-white shadow-sm">
      <div className="p-6 border-b border-red-500/20">
        <h2 className="text-xl font-semibold text-red-700">Danger Zone</h2>
        <p className="text-sm text-slate-500 mt-1">
          These actions are irreversible. Please proceed with caution.
        </p>
      </div>
      <div className="p-6 flex justify-between items-center">
        <div>
          <p className="font-semibold text-slate-800">
            Delete this organization
          </p>
          <p className="text-sm text-slate-500">
            All data, sources, and user access will be permanently removed.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-red-600 bg-transparent py-2 px-4 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50">
          Delete Organization
        </button>
      </div>
    </div>
  </div>
);

const TeamSettings = () => {
  const teamMembers = [
    { name: "Alex Rider", email: "director@thecatalyst.io", role: "Owner" },
    { name: "Jane Doe", email: "jane.doe@thecatalyst.io", role: "Admin" },
    { name: "John Smith", email: "john.smith@thecatalyst.io", role: "Member" },
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Team Members</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage who has access to this organization.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
          <Plus size={16} /> Invite Member
        </button>
      </div>
      <ul className="divide-y divide-slate-200">
        {teamMembers.map((member) => (
          <li
            key={member.email}
            className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{member.name}</p>
                <p className="text-sm text-slate-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-600">{member.role}</p>
              <button className="p-2 text-slate-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const BillingSettings = () => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="p-6 border-b border-slate-200">
      <h2 className="text-xl font-semibold text-slate-800">Billing</h2>
      <p className="text-sm text-slate-500 mt-1">
        Manage your subscription and view payment history.
      </p>
    </div>
    <div className="p-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lg font-semibold text-blue-900">Pro Plan</p>
            <p className="text-sm text-blue-700">
              Your organization is on the Pro tier.
            </p>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            $499<span className="text-lg font-medium text-blue-700">/mo</span>
          </p>
        </div>
        <button
          type="button"
          className="mt-6 rounded-md border border-blue-600 bg-transparent py-2 px-4 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100">
          Manage Subscription
        </button>
      </div>
    </div>
  </div>
);

const APIKeysSettings = () => {
  const [apiKey, setApiKey] = useState(null);
  const [hasCopied, setHasCopied] = useState(false);

  const generateKey = () => {
    const newKey = `cat_live_${[...Array(32)]
      .map(() => Math.random().toString(36)[2])
      .join("")}`;
    setApiKey(newKey);
    setHasCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">API Keys</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage API keys for programmatic access.
          </p>
        </div>
        <button
          onClick={generateKey}
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
          <Plus size={16} /> Generate Key
        </button>
      </div>

      {apiKey && (
        <div className="p-6 bg-blue-50 border-b border-blue-200">
          <p className="text-sm font-medium text-slate-800">
            New API Key Generated
          </p>
          <p className="text-xs text-slate-500 mt-1">
            This is the only time your secret key will be displayed. Please copy
            and store it securely.
          </p>
          <div className="mt-4 flex items-center gap-2 p-3 rounded-md bg-white border border-slate-300">
            <p className="font-mono text-sm text-slate-600 flex-1">{apiKey}</p>
            <button
              onClick={copyToClipboard}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800">
              {hasCopied ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* List of existing keys (placeholder) */}
      <ul className="divide-y divide-slate-200">
        <li className="flex items-center justify-between p-6">
          <div>
            <p className="font-semibold text-slate-800">Primary Server Key</p>
            <p className="font-mono text-sm text-slate-500">cat_live_...a4f2</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500">Last used: 3 hours ago</p>
            <button className="p-2 text-slate-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        </li>
      </ul>
    </div>
  );
};

// --- Main Settings Page Component ---
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");

  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return <ProfileSettings />;
      case "Organization":
        return <OrganizationSettings />;
      case "Team":
        return <TeamSettings />;
      case "Billing":
        return <BillingSettings />;
      case "API Keys":
        return <APIKeysSettings />;
      default:
        return (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="text-xl font-semibold">{activeTab}</h2>
            <p className="text-sm text-slate-500 mt-1">
              This section has not been built yet.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
      <div className="flex flex-col md:flex-row gap-12">
        <nav className="flex flex-row overflow-x-auto md:flex-col gap-2 md:w-1/5">
          {settingsNav.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors flex-shrink-0 ${
                activeTab === item.name
                  ? "bg-slate-200 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}>
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>
        <div className="md:w-4/5">{renderContent()}</div>
      </div>
    </div>
  );
}
