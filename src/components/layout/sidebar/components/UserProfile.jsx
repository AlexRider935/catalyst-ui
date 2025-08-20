"use client";

import { Menu, Transition, Switch } from "@headlessui/react";
import {
  MoreHorizontal,
  LogOut,
  User, // Using a more standard icon
  Settings, // Using a more standard icon
  Sun,
  Moon,
} from "lucide-react";
import { Fragment, useContext, useState } from "react";
import { SidebarContext } from "@/components/layout/sidebar/SidebarContext"; // Assuming this path is correct
import clsx from "clsx";

// --- MAIN COMPONENT ---
export default function UserProfile() {
  const sidebarContext = useContext(SidebarContext);
  const expanded = sidebarContext ? sidebarContext.expanded : true;
  // In a real app, this state would be managed by a global theme context.
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="border-t border-slate-200/80 p-3">
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
            className={clsx(
              "flex justify-between items-center overflow-hidden transition-all",
              expanded ? "w-48 ml-1" : "w-0"
            )}
          >
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
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute bottom-full left-0 mb-2 w-64 origin-bottom-left rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="p-1.5">
              {/* Profile Info Header */}
              <div className="px-2.5 py-2">
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
                    href="#"
                    className={clsx(
                      "flex items-center gap-3 px-2.5 py-2 text-sm rounded-md",
                      active ? "bg-slate-100 text-slate-800" : "text-slate-700"
                    )}
                  >
                    <User size={16} /> Your Profile
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={clsx(
                      "flex items-center gap-3 px-2.5 py-2 text-sm rounded-md",
                      active ? "bg-slate-100 text-slate-800" : "text-slate-700"
                    )}
                  >
                    <Settings size={16} /> Preferences
                  </a>
                )}
              </Menu.Item>

              <div className="my-1 h-px bg-slate-100" />

              {/* Theme Toggle */}
              <div className="p-1.5">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setIsDarkMode(false)}
                    className={clsx(
                      "flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md",
                      !isDarkMode
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <Sun size={14} /> Light
                  </button>
                  <button
                    onClick={() => setIsDarkMode(true)}
                    className={clsx(
                      "flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md",
                      isDarkMode
                        ? "bg-slate-800 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <Moon size={14} /> Dark
                  </button>
                </div>
              </div>

              <div className="my-1 h-px bg-slate-100" />

              {/* Logout */}
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={clsx(
                      "flex items-center gap-3 px-2.5 py-2 text-sm rounded-md",
                      active ? "bg-red-50 text-red-600" : "text-red-600"
                    )}
                  >
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