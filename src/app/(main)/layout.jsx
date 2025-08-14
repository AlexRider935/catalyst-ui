"use client";

import { useState, useEffect } from "react";

import { usePathname } from "next/navigation";
import "../globals.css";
import CommandPalette from "../components/CommandPalette";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/sidebar/Sidebar";

export default function MainAppLayout({ children }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <div className="flex h-screen w-full bg-slate-50">
      <Sidebar currentPath={pathname} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          onSearchClick={() => setIsCommandPaletteOpen(true)}
          pathname={pathname}
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
