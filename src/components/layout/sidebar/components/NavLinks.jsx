"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Rss,
  Settings,
  LifeBuoy,
  BarChart,
  Bug,
  Shield,
  Search,
  Cloud,
  Server,
  Users,
  FileText,
  FileBarChart,
  KeyRound,
  GitBranch,
  Bot,
  Bell,
  Code,
  Database,
  Share2,
  ToyBrick,
  Zap,
  CaseSensitive,
  Puzzle,
  Activity,
  ChevronDown,
} from "lucide-react";
import { useContext, useState } from "react";
import Link from "next/link";
import { SidebarContext } from "../Sidebar";

// --- Reusable Sub-Components ---
function SidebarItem({ icon, text, active, alert, href = "#" }) {
  const { expanded } = useContext(SidebarContext);
  return (
    <Link href={href}>
      <li
        className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${
          active
            ? "bg-slate-100 text-slate-900 font-semibold"
            : "hover:bg-slate-100 text-slate-600"
        }`}>
        {active && (
          <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
        )}
        {icon}
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-52 ml-3" : "w-0"
          }`}>
          {text}
        </span>
        {alert && (
          <div className="absolute right-3 w-2 h-2 rounded bg-blue-500" />
        )}
        {!expanded && (
          <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-slate-900 text-white text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50">
            {text}
          </div>
        )}
      </li>
    </Link>
  );
}

function SidebarDropdown({ icon, text, children, active }) {
  const { expanded } = useContext(SidebarContext);
  const [isOpen, setIsOpen] = useState(active);
  return (
    <>
      <li
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group hover:bg-slate-100 ${
          active ? "text-slate-900" : "text-slate-600"
        }`}>
        <div
          className={`absolute left-0 w-1 h-6 rounded-r-full ${
            active && !isOpen ? "bg-blue-600" : "bg-transparent"
          }`}
        />
        {icon}
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-48 ml-3" : "w-0"
          }`}>
          {text}
        </span>
        {expanded && (
          <ChevronDown
            size={18}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </li>
      {isOpen && expanded && (
        <ul className="pl-7 space-y-0.5 border-l border-slate-200 ml-5 mt-1">
          {children}
        </ul>
      )}
    </>
  );
}

function SidebarSection({ title }) {
  const { expanded } = useContext(SidebarContext);
  return (
    <h3
      className={`px-3 mt-6 mb-2 text-xs font-semibold uppercase text-slate-400 tracking-wider transition-all ${
        !expanded ? "text-center" : ""
      }`}>
      {expanded ? title : "•••"}
    </h3>
  );
}

export default function NavLinks() {
  const pathname = usePathname();
  const { expanded } = useContext(SidebarContext);

  return (
    <div className="flex-1 px-3 overflow-y-auto">
      <div className={`relative mb-2 ${!expanded ? "hidden" : "block"}`}>
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Filter navigation..."
          className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
        />
      </div>

      <ul className="mt-3">
        <SidebarSection title="Core" />
        <SidebarItem
          href="/"
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={pathname === "/"}
        />
        <SidebarItem
          href="/search"
          icon={<Search size={20} />}
          text="Global Search"
          active={pathname.startsWith("/search")}
        />
        <SidebarItem
          href="/audit-log"
          icon={<Activity size={20} />}
          text="Audit Log"
          active={pathname.startsWith("/audit-log")}
        />

        <SidebarSection title="Intelligence" />
        <SidebarItem
          href="/intelligence/events"
          icon={<Shield size={20} />}
          text="Security Events"
          active={pathname.startsWith("/intelligence/events")}
        />
        <SidebarItem
          href="/intelligence/vulnerabilities"
          icon={<Bug size={20} />}
          text="Vulnerabilities"
          active={pathname.startsWith("/intelligence/vulnerabilities")}
        />
        <SidebarItem
          href="/intelligence/cases"
          icon={<CaseSensitive size={20} />}
          text="Case Management"
          active={pathname.startsWith("/intelligence/cases")}
        />
        <SidebarItem
          href="/intelligence/feeds"
          icon={<Zap size={20} />}
          text="Threat Intel Feeds"
          active={pathname.startsWith("/intelligence/feeds")}
        />

        <SidebarSection title="Compliance" />
        <SidebarItem
          href="/compliance"
          icon={<ShieldCheck size={20} />}
          text="Auditor Console"
          active={
            pathname.startsWith("/compliance") &&
            !pathname.includes("evidence") &&
            !pathname.includes("frameworks")
          }
        />
        <SidebarItem
          href="/compliance/evidence"
          icon={<FileText size={20} />}
          text="Evidence Library"
          active={pathname.startsWith("/compliance/evidence")}
        />
        <SidebarItem
          href="/compliance/frameworks"
          icon={<ToyBrick size={20} />}
          text="Frameworks"
          active={pathname.startsWith("/compliance/frameworks")}
        />

        <SidebarSection title="Detection & Response" />
        <SidebarDropdown
          icon={<Code size={20} />}
          text="Detection Engine"
          active={pathname.startsWith("/detection")}>
          <SidebarItem
            href="/detection/rules"
            icon={<GitBranch size={20} />}
            text="Rules"
            active={pathname.startsWith("/detection/rules")}
          />
          <SidebarItem
            href="/detection/decoders"
            icon={<Share2 size={20} />}
            text="Decoders"
            active={pathname.startsWith("/detection/decoders")}
          />
        </SidebarDropdown>
        <SidebarDropdown
          icon={<Bot size={20} />}
          text="Response Engine"
          active={pathname.startsWith("/response")}>
          <SidebarItem
            href="/response/playbooks"
            icon={<Zap size={20} />}
            text="Playbooks"
            active={pathname.startsWith("/response/playbooks")}
          />
          <SidebarItem
            href="/response/actions"
            icon={<Zap size={20} />}
            text="Active Response"
            active={pathname.startsWith("/response/actions")}
          />
        </SidebarDropdown>

        <SidebarSection title="Data & Platform" />
        <SidebarItem
          href="/ingestion"
          icon={<Rss size={20} />}
          text="Ingestion Manager"
          active={pathname.startsWith("/ingestion")}
        />
        <SidebarItem
          href="/data/lake"
          icon={<Database size={20} />}
          text="Data Lake"
          active={pathname.startsWith("/data/lake")}
        />
        <SidebarItem
          href="/data/notifications"
          icon={<Bell size={20} />}
          text="Notification Rules"
          active={pathname.startsWith("/data/notifications")}
        />
        <SidebarItem
          href="/platform/integrations"
          icon={<Puzzle size={20} />}
          text="Integrations"
          active={pathname.startsWith("/platform/integrations")}
        />
        <SidebarItem
          href="/reporting"
          icon={<FileBarChart size={20} />}
          text="Reporting"
          active={pathname.startsWith("/reporting")}
        />
        <SidebarItem
          href="/settings"
          icon={<Settings size={20} />}
          text="Platform Settings"
          active={pathname.startsWith("/settings")}
        />
        <SidebarItem
          href="/help"
          icon={<LifeBuoy size={20} />}
          text="Help & Support"
          active={pathname.startsWith("/help")}
        />
      </ul>
    </div>
  );
}
