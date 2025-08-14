"use client";

import { AlertTriangle, X } from "lucide-react";

export default function RevokeSessionModal({ session, onClose }) {
  if (!session) return null;

  const handleRevoke = () => {
    console.log(`Revoking session ${session.id}: ${session.device}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl m-4">
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Revoke Session?
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Are you sure you want to revoke the session for{" "}
            <strong className="text-slate-700">{session.device}</strong>? This
            will immediately sign out this device.
          </p>
        </div>
        <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleRevoke}
            className="rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
            Revoke
          </button>
        </div>
      </div>
    </div>
  );
}
