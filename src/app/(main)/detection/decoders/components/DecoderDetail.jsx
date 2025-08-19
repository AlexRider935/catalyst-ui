"use client";

import { Plus, FileCode2, Pencil, LayoutList, Trash2 } from "lucide-react";
import StatusToggle from "./StatusToggle";

const DecoderSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="bg-white p-5 rounded-lg border border-slate-200 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-slate-200 rounded"></div>
            <div>
              <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-16"></div>
            </div>
          </div>
        </div>
        <div className="mt-4 pl-12 space-y-4">
          <div>
            <div className="h-3 bg-slate-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-slate-100 rounded"></div>
          </div>
          <div>
            <div className="h-3 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-8 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function DecoderDetail({
  service,
  onEditDecoder,
  onCreateDecoder,
  onDeleteDecoder,
}) {
  if (!service) {
    return (
      <section className="flex-1 h-full flex items-center justify-center">
        <div className="text-center p-8">
          <LayoutList className="h-16 w-16 text-slate-300 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Select a Service
          </h2>
          <p className="mt-1 text-slate-500">
            Choose a service to view its decoders.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 h-full flex flex-col">
      <div className="p-4 border-b border-slate-200" style={{paddingBottom: '3.4rem'}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {service.name} Decoders
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Prefilter Keyword:{" "}
              <code className="text-xs bg-slate-100 text-slate-700 px-1 py-0.5 rounded">
                {service.prefilter}
              </code>
            </p>
          </div>
          <button
            onClick={onCreateDecoder}
            className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
            <Plus className="h-5 w-5" />
            Create Decoder
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {service.decoders === undefined ? (
          <DecoderSkeleton />
        ) : service.decoders.length > 0 ? (
          <ul className="space-y-4">
            {service.decoders.map((decoder) => (
              <li
                key={decoder.id}
                className="group bg-white border border-slate-200 rounded-lg shadow-sm transition-all hover:border-blue-500/50 hover:shadow-md">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <FileCode2 className="h-8 w-8 text-slate-400 flex-shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">
                          {decoder.name}
                        </h3>
                        <p
                          className={`text-xs font-medium ${
                            decoder.isActive
                              ? "text-green-600"
                              : "text-slate-500"
                          }`}>
                          {decoder.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditDecoder(decoder)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5">
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() =>
                          onDeleteDecoder(decoder.id, decoder.name)
                        }
                        className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1.5">
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pl-12 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Example Log
                      </p>
                      <pre className="mt-1 w-full overflow-x-auto rounded-md bg-slate-50 p-2 text-xs text-slate-700 border border-slate-200" style={{whiteSpace: "pre-wrap", wordBreak: "break-all"}}>
                        <code>{decoder.log_example}</code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Regular Expression
                      </p>
                      <pre className="mt-1 w-full overflow-x-auto rounded-md bg-slate-50 p-2 text-xs text-slate-700 border border-slate-200" style={{whiteSpace: "pre-wrap", wordBreak: "break-all"}}>
                        <code>{decoder.regex}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <FileCode2 className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">
              No Decoders Found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Click "Create Decoder" to add the first one for this service.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
