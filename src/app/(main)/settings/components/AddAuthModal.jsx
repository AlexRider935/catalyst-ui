"use client";

import { Smartphone, KeyRound, X } from "lucide-react";

export default function AddAuthMethodModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl m-4">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Add an Authentication Method
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Strengthen your account security.
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <button className="w-full flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Smartphone className="h-8 w-8 text-slate-500" />
            <div className="text-left">
              <h3 className="font-semibold text-slate-800">
                Authenticator App
              </h3>
              <p className="text-sm text-slate-500">
                Use an app like Google Authenticator or Authy.
              </p>
            </div>
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <KeyRound className="h-8 w-8 text-slate-500" />
            <div className="text-left">
              <h3 className="font-semibold text-slate-800">Security Key</h3>
              <p className="text-sm text-slate-500">
                Use a physical security key like a YubiKey.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
