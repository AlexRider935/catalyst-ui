"use client";

import { createContext, useState } from "react";
import NavLinks from "./components/Navlinks";
import UserProfile from "./components/UserProfile";
import WorkspaceSwitcher from "./components/WorkspaceSwitcher";

// The context now includes the navigation handler and current path.
export const SidebarContext = createContext();

// The component now accepts the props passed down from the layout.
export default function Sidebar({ currentPath }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside
      className={`h-screen sticky top-0 transition-all duration-300 ease-in-out ${
        expanded ? "w-80" : "w-24"
      }`}>
      <nav className="h-full flex flex-col bg-white border-r border-slate-200 shadow-sm">
        {/* The context provider now makes the navigation props available to all children. */}
        <SidebarContext.Provider
          value={{ expanded, setExpanded, currentPath }}>
          <WorkspaceSwitcher />
          <NavLinks />
          <UserProfile />
        </SidebarContext.Provider>
      </nav>
    </aside>
  );
}
