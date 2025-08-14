"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Combobox, Transition } from "@headlessui/react";
import {
  Search,
  LayoutDashboard,
  ShieldCheck,
  Rss,
  Settings,
  FileText,
  Bug,
  GitBranch,
  User,
  LogOut,
  ChevronsRight,
} from "lucide-react";

// --- Mock Data with Categories ---
const allCommands = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    category: "Navigation",
  },
  {
    name: "Compliance",
    href: "/compliance",
    icon: ShieldCheck,
    category: "Navigation",
  },
  {
    name: "Vulnerabilities",
    href: "/intelligence/vulnerabilities",
    icon: Bug,
    category: "Navigation",
  },
  {
    name: "Detection Rules",
    href: "/detection/rules",
    icon: GitBranch,
    category: "Navigation",
  },
  { name: "Ingestion", href: "/ingestion", icon: Rss, category: "Navigation" },
  {
    name: "Reporting",
    href: "/reporting",
    icon: FileText,
    category: "Navigation",
  },
  {
    name: "Platform Settings",
    href: "/settings",
    icon: Settings,
    category: "Actions",
  },
  { name: "Your Profile", href: "/profile", icon: User, category: "Actions" },
  { name: "Log Out", href: "/login", icon: LogOut, category: "Actions" },
];

export default function CommandPalette({ isOpen, setIsOpen }) {
  const [query, setQuery] = useState("");

  // Reset query when the palette is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setQuery(""), 100); // Delay to allow animation
    }
  }, [isOpen]);

  const filteredCommands =
    query === ""
      ? allCommands
      : allCommands.filter((cmd) =>
          cmd.name.toLowerCase().includes(query.toLowerCase())
        );

  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const category = command.category || "General";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(command);
    return groups;
  }, {});

  // This function would be tied to your router/navigation state handler
  const handleSelect = (href) => {
    setIsOpen(false);
    // In a real app, you would call your onNavigate(href) function here.
    console.log(`Navigating to: ${href}`);
    window.location.href = href; // Placeholder for actual navigation
  };

  return (
    <Transition.Root
      show={isOpen}
      as={Fragment}
      afterLeave={() => setQuery("")}>
      <Dialog
        onClose={setIsOpen}
        className="fixed inset-0 z-50 pt-[20vh] overflow-y-auto">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          {/* CORRECTED: Replaced non-existent Dialog.Backdrop with a standard div */}
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Panel */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95">
          <Dialog.Panel className="relative mx-auto max-w-xl w-full">
            <Combobox onChange={(cmd) => handleSelect(cmd.href)}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Combobox.Input
                  autoFocus
                  className="w-full rounded-xl border-0 bg-slate-800/80 py-3 pl-11 pr-4 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm shadow-2xl"
                  placeholder="Jump to or execute a command..."
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <Combobox.Options
                static
                className="mt-2 max-h-80 overflow-y-auto rounded-xl bg-slate-800/80 p-2 text-sm text-slate-400 shadow-2xl">
                {filteredCommands.length > 0 ? (
                  Object.entries(groupedCommands).map(
                    ([category, commands]) => (
                      <div key={category} className="mb-2">
                        <h3 className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {category}
                        </h3>
                        {commands.map((cmd) => (
                          <Combobox.Option
                            key={cmd.name}
                            value={cmd}
                            className={({ active }) =>
                              `flex cursor-pointer items-center gap-3 rounded-lg p-3 ${
                                active ? "bg-blue-600/50 text-white" : ""
                              }`
                            }>
                            {({ active }) => (
                              <>
                                <cmd.icon
                                  className={`h-5 w-5 ${
                                    active ? "text-white" : "text-slate-400"
                                  }`}
                                />
                                <span className="flex-auto truncate">
                                  {cmd.name}
                                </span>
                                {active && (
                                  <span className="flex-none text-blue-300">
                                    <ChevronsRight size={18} />
                                  </span>
                                )}
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                      </div>
                    )
                  )
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-slate-300">
                      No results found for &quot;{query}&quot;
                    </p>
                  </div>
                )}
              </Combobox.Options>
            </Combobox>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
}
