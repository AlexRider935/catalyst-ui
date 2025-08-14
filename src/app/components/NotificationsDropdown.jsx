"use client";

import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { Bell, Shield, Bug, MessageSquare, FileText } from "lucide-react";

// Mock data for demonstration purposes
const notificationsData = [
  {
    type: "alert",
    title:
      "Critical Alert: Unusual login activity detected from a new IP address.",
    time: "2m ago",
    isNew: true,
    icon: <Shield className="text-red-500" size={20} />,
  },
  {
    type: "vulnerability",
    title:
      "New high-severity vulnerability (CVE-2025-12345) found on 3 endpoints.",
    time: "1h ago",
    isNew: true,
    icon: <Bug className="text-orange-500" size={20} />,
  },
  {
    type: "mention",
    title: "Alex Rider mentioned you in Case #8421.",
    time: "4h ago",
    isNew: false,
    icon: <MessageSquare className="text-blue-500" size={20} />,
  },
  {
    type: "report",
    title: "Your weekly compliance report is ready for download.",
    time: "1d ago",
    isNew: false,
    icon: <FileText className="text-slate-500" size={20} />,
  },
];

const newNotifications = notificationsData.filter((n) => n.isNew);
const archivedNotifications = notificationsData.filter((n) => !n.isNew);

// CORRECTED: Renamed component and accepts onNavigate prop
export default function NotificationsDropdown({ onNavigate }) {
  const hasUnread = newNotifications.length > 0;

  const handleViewAllClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate("/notifications");
    }
  };

  return (
    <Popover className="relative">
      <Popover.Button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        <Bell size={18} />
        {hasUnread && (
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        )}
      </Popover.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1">
        <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Notifications
              </h3>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Mark all as read
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {notificationsData.length > 0 ? (
              <div>
                {newNotifications.length > 0 && (
                  <div>
                    <h4 className="px-4 pb-2 text-sm font-semibold text-slate-500">
                      New
                    </h4>
                    <ul>
                      {newNotifications.map((notification, idx) => (
                        <li
                          key={idx}
                          className="relative hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="absolute left-4 top-4 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <div className="flex items-start gap-4 p-4 pl-8">
                            <div className="flex-shrink-0">
                              {notification.icon}
                            </div>
                            <div>
                              <p className="text-sm text-slate-800">
                                {notification.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {archivedNotifications.length > 0 && (
                  <div className="mt-4">
                    <h4 className="px-4 pb-2 text-sm font-semibold text-slate-500">
                      Archive
                    </h4>
                    <ul>
                      {archivedNotifications.map((notification, idx) => (
                        <li
                          key={idx}
                          className="hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="flex items-start gap-4 p-4">
                            <div className="flex-shrink-0">
                              {notification.icon}
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">
                                {notification.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <Bell size={32} className="mx-auto text-slate-300" />
                <h4 className="mt-4 text-lg font-semibold text-slate-800">
                  All caught up!
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  You have no new notifications.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200/80">
            {/* CORRECTED: This link now uses the navigation handler */}
            <a
              href="/notifications"
              onClick={handleViewAllClick}
              className="block w-full text-center p-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
              View all notifications
            </a>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
