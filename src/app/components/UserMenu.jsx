"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  User,
  Settings,
  LogOut,
  LifeBuoy,
  KeyRound,
  Sun,
  Moon,
} from "lucide-react";

// This would typically come from a state management store or context
const useTheme = () => {
  // Placeholder for theme logic
  const theme = "light";
  const toggleTheme = () => console.log("Toggling theme...");
  return { theme, toggleTheme };
};

export default function UserMenu() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="w-10 h-10 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ring-1 ring-slate-200/50 hover:ring-slate-300 transition-all">
        <img
          className="w-full h-full rounded-full object-cover"
          src="https://i.pravatar.cc/150?u=alexrider"
          alt="User avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/150x150/e2e8f0/64748b?text=A";
          }}
        />
        {/* Status Indicator */}
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95">
        <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="p-1.5">
            {/* Header */}
            <div className="px-2.5 py-2.5">
              <p className="text-sm font-semibold text-slate-800">Alex Rider</p>
              <p className="text-sm text-slate-500">director@thecatalyst.io</p>
            </div>

            <div className="my-1 h-px bg-slate-100" />

            {/* Main Links */}
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/profile"
                  className={`flex items-center gap-3 px-2.5 py-2 text-sm rounded-md ${
                    active ? "bg-slate-100 text-slate-800" : "text-slate-700"
                  }`}>
                  <User size={16} /> Your Profile
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/settings"
                  className={`flex items-center gap-3 px-2.5 py-2 text-sm rounded-md ${
                    active ? "bg-slate-100 text-slate-800" : "text-slate-700"
                  }`}>
                  <Settings size={16} /> Platform Settings
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/settings/api-keys"
                  className={`flex items-center gap-3 px-2.5 py-2 text-sm rounded-md ${
                    active ? "bg-slate-100 text-slate-800" : "text-slate-700"
                  }`}>
                  <KeyRound size={16} /> API Keys
                </a>
              )}
            </Menu.Item>

            <div className="my-1 h-px bg-slate-100" />

            {/* Theme Toggle */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 text-sm rounded-md ${
                    active ? "bg-slate-100 text-slate-800" : "text-slate-700"
                  }`}>
                  {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                </button>
              )}
            </Menu.Item>

            <div className="my-1 h-px bg-slate-100" />

            {/* Footer Links */}
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/help"
                  className={`flex items-center gap-3 px-2.5 py-2 text-sm rounded-md ${
                    active ? "bg-slate-100 text-slate-800" : "text-slate-700"
                  }`}>
                  <LifeBuoy size={16} /> Help & Support
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/login"
                  className={`flex items-center gap-3 px-2.5 py-2 text-sm rounded-md ${
                    active ? "bg-red-50 text-red-600" : "text-red-600"
                  }`}>
                  <LogOut size={16} /> Log Out
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
