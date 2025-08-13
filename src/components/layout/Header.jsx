"use client";

import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  ChevronRight,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronsUpDown,
  Plus,
  LayoutGrid,
} from "lucide-react";

// --- Sub-components for clarity ---

const OrganizationSwitcher = () => (
  <Menu as="div" className="relative">
    <Menu.Button className="flex items-center gap-2 rounded-lg p-2 text-sm font-semibold text-slate-900 transition-all duration-150 ease-in-out hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
        C
      </div>
      <span className="hidden sm:inline">Catalyst Corp</span>
      <ChevronsUpDown size={16} className="text-slate-400" />
    </Menu.Button>
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95">
      <Menu.Items className="absolute left-0 mt-2 w-64 origin-top-left rounded-lg bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
        <div className="p-1.5">
          <div className="px-2.5 py-2">
            <p className="text-xs text-slate-500">Workspaces</p>
          </div>
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={`flex items-center gap-3 px-2.5 py-1.5 text-sm rounded-md ${
                  active ? "bg-slate-100 text-slate-800" : "text-slate-700"
                }`}>
                <div className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  C
                </div>
                Catalyst Corp
              </a>
            )}
          </Menu.Item>
          {/* Other orgs */}
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
);

/**
 * CORRECTED: Breadcrumbs is now a pure component.
 * It has no internal state and relies entirely on the 'pathname' prop.
 */
const Breadcrumbs = ({ pathname }) => {
  if (!pathname || pathname === "/") return null;

  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const title =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");
    const isLast = index === pathSegments.length - 1;
    return { href, title, isLast };
  });

  return (
    <div className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 font-medium">
      <a
        href="/"
        className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
        <LayoutGrid size={16} className="text-slate-400" />
      </a>
      <ChevronRight size={16} className="text-slate-400" />

      {breadcrumbItems.map((item) => (
        <React.Fragment key={item.href}>
          {/* This should use the same onNavigate logic as the sidebar for a true SPA feel,
              but for now, standard links will work with the corrected state flow.
          */}
          <a href={item.href}>
            <span
              className={
                item.isLast
                  ? "text-slate-800"
                  : "hover:text-slate-800 cursor-pointer transition-colors"
              }>
              {item.title}
            </span>
          </a>
          {!item.isLast && (
            <ChevronRight size={16} className="text-slate-400" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const ActionItems = ({ onSearchClick }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onSearchClick}
      className="flex items-center gap-2 p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      <Search size={18} />
      <span className="text-xs border border-slate-300/80 rounded-md px-1.5 py-0.5 font-mono bg-white shadow-sm">
        ⌘K
      </span>
    </button>
    <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      <Bell size={18} />
      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
    </button>
    <Menu as="div" className="relative">
      <Menu.Button className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ring-1 ring-slate-200 hover:ring-slate-300 transition-all">
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
        <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-lg bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="p-1.5">
            <div className="px-2.5 py-2.5">
              <p className="text-sm font-semibold text-slate-800">Alex Rider</p>
              <p className="text-sm text-slate-500">director@thecatalyst.io</p>
            </div>
            {/* Other menu items */}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  </div>
);

/**
 * CORRECTED: Header now accepts 'pathname' as a prop
 * and passes it down to the Breadcrumbs component.
 */
export default function Header({ onSearchClick, pathname }) {
  return (
    <header className="flex-shrink-0 h-16 px-4 md:px-6 z-40">
      <div className="flex items-center justify-between h-full bg-white/75 backdrop-blur-xl border-b border-slate-200/80 rounded-b-2xl px-4">
        <div className="flex items-center gap-4">
          <OrganizationSwitcher />
          <div className="w-px h-6 bg-slate-200 hidden md:block" />
          <Breadcrumbs pathname={pathname} />
        </div>
        <ActionItems onSearchClick={onSearchClick} />
      </div>
    </header>
  );
}
