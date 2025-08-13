"use client";

import { useState, useEffect } from "react";
import "../globals.css";
import CommandPalette from "../components/CommandPalette";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/sidebar/Sidebar";

export default function MainAppLayout({ children }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // State for the current path is now managed in this top-level layout.
  const [currentPath, setCurrentPath] = useState("");

  // Set the initial path on component mount.
  useEffect(() => {
    // This check ensures window is defined, preventing errors during server-side rendering.
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // Keyboard shortcut listener for the command palette.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /**
   * Handles navigation, updating the URL and state without a page refresh.
   * This function must be passed to and called by navigation links in the Sidebar.
   * @param {string} path - The new path to navigate to (e.g., '/intelligence/events').
   */
  const handleNavigate = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* The Sidebar now receives the navigation handler and the current path.
        Your Sidebar links must be updated to call onNavigate(newPath) onClick.
      */}
      <Sidebar onNavigate={handleNavigate} currentPath={currentPath} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* The Header receives the current path as a prop to render its breadcrumbs. */}
        <Header
          onSearchClick={() => setIsCommandPaletteOpen(true)}
          pathname={currentPath}
        />
        <main className="p-6 md:p-10 flex-1 overflow-y-auto">{children}</main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        setIsOpen={setIsCommandPaletteOpen}
      />
    </div>
  );
}
