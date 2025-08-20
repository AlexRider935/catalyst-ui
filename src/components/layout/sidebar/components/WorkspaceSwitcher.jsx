"use client";

import { Menu, Transition } from "@headlessui/react";
import { ChevronsUpDown, Plus, Settings, Search, Check } from "lucide-react";
import { Fragment, useContext, useState } from "react";
import { SidebarContext } from "../SidebarContext";

// --- MOCK DATA ---
const workspaces = [
  {
    id: 1,
    name: "The Catalyst Corp.",
    plan: "Pro Plan",
    avatar: "C",
    color: "bg-slate-900",
    active: true,
  },
  {
    id: 2,
    name: "Project Chimera",
    plan: "Free Plan",
    avatar: "P",
    color: "bg-red-500",
    active: false,
  },
  {
    id: 3,
    name: "Stealth R&D",
    plan: "Enterprise",
    avatar: "S",
    color: "bg-indigo-600",
    active: false,
  },
];

// --- MAIN COMPONENT ---
export default function WorkspaceSwitcher() {
  const { expanded } = useContext(SidebarContext);
  const [query, setQuery] = useState("");

  const activeWorkspace = workspaces.find((w) => w.active);
  const filteredWorkspaces =
    query === ""
      ? workspaces
      : workspaces.filter((w) =>
          w.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div
      className={`p-3 border-b border-slate-200 ${
        !expanded ? "hidden" : "block"
      }`}>
      <Menu as="div" className="relative">
        <Menu.Button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <div
            className={`w-10 h-10 shrink-0 rounded-lg ${activeWorkspace.color} text-white flex items-center justify-center font-bold text-lg`}>
            {activeWorkspace.avatar}
          </div>
          <div className="flex justify-between items-center w-full overflow-hidden">
            <div className="leading-4 text-left">
              <h4 className="font-semibold text-slate-800">
                {activeWorkspace.name}
              </h4>
              <span className="text-xs text-slate-500">
                {activeWorkspace.plan}
              </span>
            </div>
            <ChevronsUpDown size={18} className="text-slate-400 shrink-0" />
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
          <Menu.Items className="absolute top-full left-0 mt-2 w-full origin-top-left rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="p-1.5">
              {/* Search Input */}
              <div className="relative px-2 py-1">
                <Search
                  size={16}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Prevent menu from closing on click
                  placeholder="Filter workspaces..."
                  className="w-full rounded-md border-0 bg-slate-100 py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-inset focus:ring-blue-500"
                />
              </div>

              {/* Workspace List */}
              <div className="mt-1 max-h-48 overflow-y-auto">
                {filteredWorkspaces.map((w) => (
                  <Menu.Item key={w.id}>
                    {({ active }) => (
                      <a
                        href="#"
                        className={`flex items-center gap-3 px-2.5 py-2 text-sm rounded-md ${
                          active ? "bg-slate-100" : ""
                        }`}>
                        <div
                          className={`w-7 h-7 shrink-0 rounded-md ${w.color} text-white flex items-center justify-center font-bold text-xs`}>
                          {w.avatar}
                        </div>
                        <div className="flex-1 leading-4">
                          <p className="font-medium text-slate-800">{w.name}</p>
                          <p className="text-xs text-slate-500">{w.plan}</p>
                        </div>
                        {w.active && (
                          <Check size={18} className="text-blue-600" />
                        )}
                      </a>
                    )}
                  </Menu.Item>
                ))}
              </div>

              <div className="my-1.5 h-px bg-slate-100" />

              {/* Actions */}
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={`flex items-center gap-3 px-2.5 py-2 text-sm rounded-md ${
                      active ? "bg-slate-100 text-slate-800" : "text-slate-700"
                    }`}>
                    <Settings size={16} /> Workspace Settings
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={`flex items-center gap-3 px-2.5 py-2 text-sm rounded-md ${
                      active ? "bg-blue-50 text-blue-600" : "text-blue-600"
                    }`}>
                    <Plus size={16} /> Create Workspace
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
