"use client";

import { useState, useMemo } from "react";
import {
  User,
  Building,
  Users,
  CreditCard,
  KeyRound,
  Shield,
  Search,
} from "lucide-react";

// --- ARCHITECT'S NOTE ---
// Assumes individual component files exist at these paths.
// Example: src/components/settings/ProfileSettings.jsx
import ProfileSettings from "./components/ProfileSettings";
import SecuritySettings from "./components/SecuritySettings";
import OrganizationSettings from "./components/OrganizationSettings";
import TeamSettings from "./components/TeamSettings";
import BillingSettings from "./components/BillingSettings";
import APIKeysSettings from "./components/APIKeysSettings";

// --- NAVIGATION CONFIGURATION (ENRICHED) ---
const settingsNav = [
  {
    name: "Profile",
    subtitle: "Name, avatar, title",
    icon: User,
    component: ProfileSettings,
  },
  {
    name: "Security",
    subtitle: "Password, 2FA, sessions",
    icon: Shield,
    component: SecuritySettings,
  },
  {
    name: "Organization",
    subtitle: "Name, branding, danger zone",
    icon: Building,
    component: OrganizationSettings,
  },
  {
    name: "Team",
    subtitle: "Members and permissions",
    icon: Users,
    component: TeamSettings,
  },
  {
    name: "Billing",
    subtitle: "Subscription and invoices",
    icon: CreditCard,
    component: BillingSettings,
  },
  {
    name: "API Keys",
    subtitle: "Manage programmatic access",
    icon: KeyRound,
    component: APIKeysSettings,
  },
];

// --- MAIN SETTINGS PAGE COMPONENT ---
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNav = useMemo(() => {
    if (!searchQuery) return settingsNav;
    return settingsNav.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const ActiveComponent =
    settingsNav.find((item) => item.name === activeTab)?.component ||
    ProfileSettings;

  const activeNavItem = settingsNav.find((item) => item.name === activeTab);

  return (
    <div className="space-y-8">
      {/* Dynamic Header */}
      <div>
        <div className="flex items-center gap-3">
          {activeNavItem && (
            <activeNavItem.icon className="w-8 h-8 text-slate-500" />
          )}
          <h1 className="text-3xl font-bold text-slate-900">
            {activeTab} Settings
          </h1>
        </div>
        <p className="mt-1 text-slate-500">
          Manage your account, organization, and platform settings.
        </p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Navigation */}
        <aside className="md:w-1/4">
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <nav className="flex flex-row overflow-x-auto md:flex-col gap-1">
            {filteredNav.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex w-full items-start text-left gap-3 rounded-lg p-3 text-sm font-medium transition-colors flex-shrink-0 ${
                  activeTab === item.name
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                }`}>
                <item.icon size={18} className="mt-0.5" />
                <div>
                  <span className="font-semibold">{item.name}</span>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Content Panel with Animation */}
        <div className="md:w-3/4">
          <div key={activeTab} className="animate-fade-in">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
}


