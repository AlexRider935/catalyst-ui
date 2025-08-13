"use client";

import { Menu, Transition } from "@headlessui/react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { Fragment, useContext } from "react";
import { SidebarContext } from "../Sidebar";

export default function WorkspaceSwitcher() {
  const { expanded } = useContext(SidebarContext);

  return (
    <Menu as="div" className="relative p-3">
      <Menu.Button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100">
        <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
          C
        </div>
        <div
          className={`flex justify-between items-center overflow-hidden transition-all ${
            expanded ? "w-52" : "w-0"
          }`}>
          <div className="leading-4 text-left">
            <h4 className="font-semibold">The Catalyst Corp.</h4>
            <span className="text-xs text-gray-600">Pro Plan</span>
          </div>
          <ChevronsUpDown size={16} className="text-slate-500" />
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
        <Menu.Items className="absolute top-full left-0 mt-2 w-full origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="p-1">
            <Menu.Item>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-slate-700 hover:bg-slate-100">
                Other Org 1
              </a>
            </Menu.Item>
            <Menu.Item>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-slate-700 hover:bg-slate-100">
                Other Org 2
              </a>
            </Menu.Item>
            <div className="my-1 h-px bg-slate-200" />
            <Menu.Item>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-blue-600 hover:bg-blue-50">
                <Plus size={16} /> Create Workspace
              </a>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
