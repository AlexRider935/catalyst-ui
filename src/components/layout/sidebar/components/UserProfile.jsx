"use client";

import { Menu, Transition, Switch } from "@headlessui/react";
import {
  MoreHorizontal,
  LogOut,
  BookUser,
  SlidersHorizontal,
  Sun,
  Moon,
} from "lucide-react";
import { Fragment, useContext, useState } from "react";
// CORRECTED: Path updated to use a robust alias, assuming standard project structure.
import { SidebarContext } from "@/components/layout/sidebar/Sidebar";

// --- MAIN COMPONENT ---
export default function UserProfile() {
  const { expanded } = useContext(SidebarContext);
  // In a real app, this state would be managed by a global context or store.
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="border-t border-slate-200 p-3">
      <Menu as="div" className="relative">
        <Menu.Button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <img
            src="https://i.pravatar.cc/150?u=alexrider"
            alt="User Avatar"
            className="w-10 h-10 shrink-0 rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/150x150/e2e8f0/64748b?text=A";
            }}
          />
          <div
            className={`flex justify-between items-center overflow-hidden transition-all ${
              expanded ? "w-48" : "w-0"
            }`}>
            <div className="leading-4 text-left">
              <h4 className="font-semibold text-slate-800">Alex Rider</h4>
              <span className="text-xs text-slate-500">Administrator</span>
            </div>
            <MoreHorizontal size={20} className="text-slate-400" />
          </div>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95">
          <Menu.Items className="absolute bottom-full left-0 mb-2 w-64 origin-bottom-left rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="p-1.5">
              {/* Profile Info Header */}
              <div className="px-2.5 py-2.5">
                <p className="text-sm font-semibold text-slate-800">
                  Alex Rider
                </p>
                <p className="text-sm text-slate-500">
                  director@thecatalyst.io
                </p>
              </div>

              <div className="my-1 h-px bg-slate-100" />

              {/* Main Actions */}
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="/profile"
                    className={`flex items-center gap-3 px-2.5 py-2 text-sm rounded-md ${
                      active ? "bg-slate-100 text-slate-800" : "text-slate-700"
                    }`}>
                    <BookUser size={16} /> Your Profile
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="/profile/preferences"
                    className={`flex items-center gap-3 px-2.5 py-2 text-sm rounded-md ${
                      active ? "bg-slate-100 text-slate-800" : "text-slate-700"
                    }`}>
                    <SlidersHorizontal size={16} /> Preferences
                  </a>
                )}
              </Menu.Item>

              <div className="my-1 h-px bg-slate-100" />

              {/* Theme Toggle */}
              <div className="flex items-center justify-between px-2.5 py-2 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                  <span>Dark Mode</span>
                </div>
                <Switch
                  checked={isDarkMode}
                  onChange={setIsDarkMode}
                  className={`${
                    isDarkMode ? "bg-blue-600" : "bg-slate-200"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
                  <span
                    className={`${
                      isDarkMode ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>

              <div className="my-1 h-px bg-slate-100" />

              {/* Logout */}
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
    </div>
  );
}
