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
  ChevronRight,
} from "lucide-react";

// --- ARCHITECT'S NOTE ---
// CORRECTED: Import paths now use robust path aliases.
// This assumes your components are located in 'src/components/settings/'.
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
    <div className="space-y-8 h-full flex flex-col">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-500">
          Manage your account, organization, and platform settings.
        </p>
      </div>

      {/* Main Layout - Unified Panel */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-8 bg-white border border-slate-200 rounded-2xl p-4 overflow-hidden">
        {/* Left Navigation */}
        <aside className="md:col-span-1 md:border-r md:border-slate-200 md:pr-8 flex flex-col">
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-col gap-1">
            {filteredNav.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex w-full items-center text-left gap-3 rounded-lg p-3 text-sm font-medium transition-all duration-200 ease-in-out ${
                  activeTab === item.name
                    ? "bg-slate-900 text-white shadow-md scale-105"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}>
                <item.icon size={18} />
                <div className="flex-1">
                  <span className="font-semibold">{item.name}</span>
                  <p
                    className={`text-xs transition-colors ${
                      activeTab === item.name
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}>
                    {item.subtitle}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className={`transition-transform ${
                    activeTab === item.name ? "translate-x-1" : "opacity-50"
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-lg p-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {settingsNav.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronRight
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90"
            />
          </div>
        </aside>

        {/* Right Content Panel with Animation */}
        <div className="md:col-span-3 overflow-y-auto">
          <div className="px-1 py-2">
            <div key={activeTab} className="animate-fade-in">
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
