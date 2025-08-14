"use client";

import { Fragment } from "react";
import { Plus, MoreVertical } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";

const SettingsCard = ({ title, subtitle, children, footer }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="p-6 border-b border-slate-200">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    <div className="p-6 space-y-6">{children}</div>
    {footer && (
      <div className="bg-slate-50/80 px-6 py-4 text-right rounded-b-xl border-t border-slate-200">
        {footer}
      </div>
    )}
  </div>
);

export default function TeamSettings() {
  const teamMembers = [
    {
      name: "Alex Rider",
      email: "director@thecatalyst.io",
      role: "Owner",
      avatar: "https://i.pravatar.cc/150?u=alexrider",
    },
    {
      name: "Jane Doe",
      email: "jane.doe@thecatalyst.io",
      role: "Admin",
      avatar: "https://i.pravatar.cc/150?u=janedoe",
    },
    {
      name: "John Smith",
      email: "john.smith@thecatalyst.io",
      role: "Member",
      avatar: "https://i.pravatar.cc/150?u=johnsmith",
    },
  ];
  return (
    <SettingsCard
      title="Team Members"
      subtitle="Manage who has access to this organization.">
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
          <Plus size={16} /> Invite Member
        </button>
      </div>
      <ul className="divide-y divide-slate-200 -mt-6">
        {teamMembers.map((member) => (
          <li
            key={member.email}
            className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-slate-800">{member.name}</p>
                <p className="text-sm text-slate-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-600 hidden sm:block">
                {member.role}
              </p>
              <Menu as="div" className="relative">
                <Menu.Button className="p-2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <MoreVertical size={16} />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95">
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                      <Menu.Item>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                          Change Role
                        </a>
                      </Menu.Item>
                      <Menu.Item>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          Remove Member
                        </a>
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </li>
        ))}
      </ul>
    </SettingsCard>
  );
}
