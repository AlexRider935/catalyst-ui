"use client";

import {
  LayoutDashboard,
  ShieldCheck,
  Rss,
  Settings,
  LifeBuoy,
  Bug,
  Shield,
  Search,
  Activity,
  ChevronDown,
  Code,
  GitBranch,
  Share2,
  Bot,
  Zap,
  CaseSensitive,
  ToyBrick,
  FileText,
  FileBarChart,
  Database,
  Puzzle,
  Bell,
} from "lucide-react";
import { useContext, useState, useMemo, useEffect } from "react";
// CORRECTED: Path updated to a relative path to resolve the build error.
import { SidebarContext } from "../SidebarContext";
import Link from "next/link";

// --- NAVIGATION CONFIGURATION (CORRECTED & COMPLETE) ---
// This data structure defines the entire sidebar navigation.
const navConfig = [
  { type: "section", title: "Core" },
  { type: "item", title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { type: "item", title: "Global Search", icon: Search, href: "/search" },
  {
    type: "item",
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
    alert: true,
  },
  { type: "item", title: "Audit Log", icon: Activity, href: "/audit-log" },

  { type: "section", title: "Intelligence" },
  {
    type: "item",
    title: "Security Events",
    icon: Shield,
    href: "/intelligence/events",
  },
  {
    type: "item",
    title: "Vulnerabilities",
    icon: Bug,
    href: "/intelligence/vulnerabilities",
  },
  {
    type: "item",
    title: "Case Management",
    icon: CaseSensitive,
    href: "/intelligence/cases",
  },
  {
    type: "item",
    title: "Threat Intel Feeds",
    icon: Zap,
    href: "/intelligence/feeds",
  },

  { type: "section", title: "Compliance" },
  {
    type: "item",
    title: "Auditor Console",
    icon: ShieldCheck,
    href: "/compliance",
  },
  {
    type: "item",
    title: "Evidence Library",
    icon: FileText,
    href: "/compliance/evidence",
  },
  {
    type: "item",
    title: "Frameworks",
    icon: ToyBrick,
    href: "/compliance/frameworks",
  },

  { type: "section", title: "Detection & Response" },
  {
    type: "dropdown",
    title: "Detection Engine",
    icon: Code,
    prefix: "/detection",
    children: [
      {
        type: "item",
        title: "Rules",
        icon: GitBranch,
        href: "/detection/rules",
      },
      {
        type: "item",
        title: "Decoders",
        icon: Share2,
        href: "/detection/decoders",
      },
    ],
  },
  {
    type: "dropdown",
    title: "Response Engine",
    icon: Bot,
    prefix: "/response",
    children: [
      {
        type: "item",
        title: "Playbooks",
        icon: Zap,
        href: "/response/playbooks",
      },
      {
        type: "item",
        title: "Active Response",
        icon: Zap,
        href: "/response/actions",
      },
    ],
  },

  { type: "section", title: "Data & Platform" },
  { type: "item", title: "Ingestion", icon: Rss, href: "/ingestion" },
  { type: "item", title: "Data Lake", icon: Database, href: "/data/lake" },
  {
    type: "item",
    title: "Notification Rules",
    icon: Bell,
    href: "/data/notifications",
  },
  {
    type: "item",
    title: "Integrations",
    icon: Puzzle,
    href: "/platform/integrations",
  },
  { type: "item", title: "Reporting", icon: FileBarChart, href: "/reporting" },
  { type: "item", title: "Settings", icon: Settings, href: "/settings" },
  { type: "item", title: "Help", icon: LifeBuoy, href: "/help" },
];

// --- REUSABLE SUB-COMPONENTS ---

function SidebarItem({ item, active }) {
  const { expanded } = useContext(SidebarContext);
  return (
    <Link href={item.href}>
      <li
        className={`relative flex items-center py-2.5 px-4 my-1 font-medium rounded-lg cursor-pointer transition-colors group ${
          active
            ? "bg-gradient-to-tr from-blue-50 to-blue-100 text-blue-700"
            : "hover:bg-slate-100 text-slate-600"
        }`}
      >
        <item.icon size={20} />
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-52 ml-3" : "w-0"
          }`}
        >
          {item.title}
        </span>
        {item.alert && (
          <div
            className={`absolute right-4 w-2 h-2 rounded bg-blue-500 ${
              expanded ? "" : "top-2"
            }`}
          />
        )}
        {!expanded && (
          <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-slate-900 text-white text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50">
            {item.title}
          </div>
        )}
      </li>
    </Link>
  );
}

function SidebarDropdown({ item, active, children }) {
  const { expanded } = useContext(SidebarContext);
  const [isOpen, setIsOpen] = useState(active);

  useEffect(() => {
    setIsOpen(active);
  }, [active]);

  return (
    <>
      <li
        onClick={() => setIsOpen((v) => !v)}
        className={`relative flex items-center py-2.5 px-4 my-1 font-medium rounded-lg cursor-pointer transition-colors group hover:bg-slate-100 ${
          active ? "text-slate-800" : "text-slate-600"
        }`}>
        <item.icon size={20} />
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-48 ml-3" : "w-0"
          }`}>
          {item.title}
        </span>
        {expanded && (
          <ChevronDown
            size={18}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </li>
      {isOpen && expanded && (
        <ul className="pl-8 border-l border-slate-200 ml-6">{children}</ul>
      )}
    </>
  );
}

// --- MAIN COMPONENT ---

export default function NavLinks() {

  const { expanded, currentPath } = useContext(SidebarContext);
  const [filter, setFilter] = useState("");
  const pathname = currentPath || "";

  const filteredNav = useMemo(() => {
    if (!filter) return navConfig;

    const lowerCaseFilter = filter.toLowerCase();
    const result = [];
    let currentSection = null;

    for (const item of navConfig) {
      if (item.type === "section") {
        currentSection = { ...item, items: [] };
        continue;
      }

      let match = false;
      const itemsToAdd = [];

      if (item.type === "item") {
        if (item.title.toLowerCase().includes(lowerCaseFilter)) {
          match = true;
          itemsToAdd.push(item);
        }
      } else if (item.type === "dropdown") {
        const matchingChildren = item.children.filter((child) =>
          child.title.toLowerCase().includes(lowerCaseFilter)
        );
        if (matchingChildren.length > 0) {
          match = true;
          itemsToAdd.push({ ...item, children: matchingChildren });
        } else if (item.title.toLowerCase().includes(lowerCaseFilter)) {
          match = true;
          itemsToAdd.push(item);
        }
      }

      if (match) {
        if (currentSection && !result.includes(currentSection)) {
          result.push(currentSection);
        }
        result.push(...itemsToAdd);
      }
    }
    return result;
  }, [filter]);

  return (
    <div className="flex-1 flex flex-col px-3 overflow-y-auto">
      <div className={`relative my-2 ${!expanded ? "hidden" : "block"}`}>
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter navigation..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
        />
      </div>

      <ul className="flex-1">
        {filteredNav.map((item, index) => {
          switch (item.type) {
            case "section":
              return (
                <h3
                  key={index}
                  className={`px-4 mt-6 mb-2 text-xs font-semibold uppercase text-slate-400 tracking-wider transition-all ${
                    !expanded ? "text-center" : ""
                  }`}>
                  {expanded ? item.title : "•••"}
                </h3>
              );
            case "item":
              return (
                <SidebarItem
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                />
              );
            case "dropdown":
              const isActive = pathname.startsWith(item.prefix);
              return (
                <SidebarDropdown key={item.title} item={item} active={isActive}>
                  {item.children.map((child) => (
                    <SidebarItem
                      key={child.href}
                      item={child}
                      active={pathname === child.href}
                    />
                  ))}
                </SidebarDropdown>
              );
            default:
              return null;
          }
        })}
      </ul>
    </div>
  );
}
