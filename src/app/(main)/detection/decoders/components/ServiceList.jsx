"use client";
import { useState } from "react";
import { Plus, Search, ChevronRight, Check, Minus, Trash2 } from "lucide-react";
import clsx from "clsx";

const SkeletonLoader = () => (
  <div className="p-2 space-y-1">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-slate-200 rounded-md animate-pulse"></div>
    ))}
  </div>
);

export default function ServiceList({
  services,
  selectedService,
  onSelect,
  isLoading,
  onCreateService,
  onDeleteService, // New prop for delete functionality
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-full max-w-xs h-full flex flex-col border-r border-slate-200/80 flex-shrink-0">
      {/* --- HEADER --- */}
      <div className="p-4 border-b border-slate-200/80 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Services</h2>
          <p className="text-sm text-slate-500">
            Select a log source to view its decoders.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* --- SERVICE LIST --- */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <SkeletonLoader />
        ) : filteredServices.length > 0 ? (
          <nav className="p-2 space-y-1">
            {filteredServices.map((service) => (
              <a
                key={service.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(service);
                }}
                className={clsx(
                  "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                  selectedService?.id === service.id
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}>
                <div className="flex items-center min-w-0">
                  {service.isActive ? (
                    <Check
                      size={14}
                      className="mr-2 text-green-500 flex-shrink-0"
                    />
                  ) : (
                    <Minus
                      size={14}
                      className="mr-2 text-slate-400 flex-shrink-0"
                    />
                  )}
                  <div className="truncate">
                    <span className="font-medium">{service.name}</span>
                    <span className="ml-2 text-xs text-slate-500">
                      ({service.decoderCount || 0})
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className={clsx(
                    "h-5 w-5 flex-shrink-0 text-slate-400 transition-transform",
                    selectedService?.id === service.id ? "translate-x-1" : "",
                    "group-hover:translate-x-1"
                  )}
                />
              </a>
            ))}
          </nav>
        ) : (
          <div className="p-4 text-center text-sm text-slate-500">
            <p className="font-medium">No services found</p>
            {searchTerm && (
              <p className="text-xs mt-1">Try adjusting your search.</p>
            )}
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <div className="p-4 border-t border-slate-200/80 grid grid-cols-2 gap-3">
        <button
          onClick={() => onDeleteService(selectedService)}
          disabled={!selectedService}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white py-2.5 px-4 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
        <button
          onClick={onCreateService}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
          <Plus className="h-5 w-5" />
          New
        </button>
      </div>
    </aside>
  );
}
