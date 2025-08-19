"use client";
import { useState } from "react";
import { Plus, Search, ChevronRight } from "lucide-react";

const SkeletonLoader = () => (
  <div className="p-2 space-y-1">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-9 bg-slate-200 rounded-md animate-pulse"></div>
    ))}
  </div>
);

export default function ServiceList({
  services,
  selectedService,
  onSelect,
  isLoading,
  onCreateService,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // ✨ UPDATED: Component is now transparent to fit inside the parent container
    <aside className="w-full max-w-xs h-full flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Services</h2>
        <p className="text-sm text-slate-500">All available parent decoders.</p>
      </div>
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-transparent pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto border-r border-slate-200">
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <nav className="p-2 space-y-1">
            {filteredServices.map((service) => (
              <a
                key={service.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(service);
                }}
                className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  selectedService?.id === service.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}>
                <div className="flex items-center">
                  <span
                    className={`mr-3 h-2 w-2 rounded-full ${
                      service.isActive ? "bg-green-500" : "bg-slate-400"
                    }`}></span>
                  <span className="truncate">{service.name}</span>
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-slate-400 transition-transform ${
                    selectedService?.id === service.id ? "translate-x-1" : ""
                  } group-hover:translate-x-1`}
                />
              </a>
            ))}
          </nav>
        )}
      </div>
      <div className="p-4 border-t border-slate-200 border-r">
        <button
          onClick={onCreateService}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700">
          <Plus className="h-5 w-5" />
          New Service
        </button>
      </div>
    </aside>
  );
}
