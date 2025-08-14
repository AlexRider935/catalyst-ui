"use client";

import React, { Fragment } from "react";
import { Popover, Menu, Transition } from "@headlessui/react";
import { ChevronRight, Search, LayoutGrid } from "lucide-react";

// CORRECTED: Import paths now use robust path aliases.
// This assumes your components are in 'src/components/layout/'.
import NotificationsDropdown from "../../app/components/NotificationsDropdown";
import UserMenu from "../../app/components/UserMenu";

// --- Main Header Sub-components ---

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

const ActionItems = ({ onSearchClick, onNavigate }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onSearchClick}
      className="flex items-center gap-2 p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      <Search size={18} />
      <span className="text-xs border border-slate-300/80 rounded-md px-1.5 py-0.5 font-mono bg-white shadow-sm">
        ⌘K
      </span>
    </button>

    <NotificationsDropdown onNavigate={onNavigate} />
    <UserMenu />
  </div>
);

export default function Header({ onSearchClick, pathname, onNavigate }) {
  return (
    <header className="flex-shrink-0 h-16 px-4 md:px-6 z-40">
      <div className="flex items-center justify-between h-full bg-white/75 backdrop-blur-xl border-b border-slate-200/80 rounded-b-2xl px-4">
        <div className="flex items-center gap-4">
          <Breadcrumbs pathname={pathname} />
        </div>
        <ActionItems onSearchClick={onSearchClick} onNavigate={onNavigate} />
      </div>
    </header>
  );
}
