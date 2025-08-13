"use client";

import { Menu, Transition } from "@headlessui/react";
import {
  MoreHorizontal,
  LogOut,
  BookUser,
  SlidersHorizontal,
} from "lucide-react";
import { Fragment, useContext } from "react";
import { SidebarContext } from "../Sidebar";

export default function UserProfile() {
  const { expanded } = useContext(SidebarContext);

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100">
        <div className="w-10 h-10 shrink-0 rounded-full bg-slate-200" />
        <div
          className={`flex justify-between items-center overflow-hidden transition-all ${
            expanded ? "w-48" : "w-0"
          }`}>
          <div className="leading-4 text-left">
            <h4 className="font-semibold">Alex Rider</h4>
            <span className="text-xs text-gray-500">
              director@thecatalyst.io
            </span>
          </div>
          <MoreHorizontal size={20} className="text-slate-400" />
        </div>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95">
        <Menu.Items className="absolute bottom-full left-0 mb-2 w-64 origin-bottom-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="p-1">
            <Menu.Item>
              <a
                href="/profile"
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-slate-700 hover:bg-slate-100">
                <BookUser size={16} /> Your Profile
              </a>
            </Menu.Item>
            <Menu.Item>
              <a
                href="/profile/preferences"
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-slate-700 hover:bg-slate-100">
                <SlidersHorizontal size={16} /> Preferences
              </a>
            </Menu.Item>
            <div className="my-1 h-px bg-slate-200" />
            <Menu.Item>
              <a
                href="/login"
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50">
                <LogOut size={16} /> Log Out
              </a>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
