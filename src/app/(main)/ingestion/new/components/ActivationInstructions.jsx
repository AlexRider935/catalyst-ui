// src/app/(main)/ingestion/new/components/ActivationInstructions.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function ActivationInstructions({ result }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Construct the full command using the token from the API result
  const activationCommand = `sudo python3 agent.py --token ${result.registration_token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activationCommand);
    setCopied(true);
    toast.success("Command copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900">
          Agent Pre-Registered Successfully
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Run the following command on your target endpoint to activate the
          agent.
        </p>
      </div>

      {/* Warning Box */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
        <div>
          <h4 className="text-sm font-semibold text-amber-900">
            This is a one-time token
          </h4>
          <p className="mt-1 text-sm text-amber-800">
            For security, this token will not be shown again. Copy the command
            below and store it securely before leaving this page.
          </p>
        </div>
      </div>

      {/* Command Box */}
      <div className="relative">
        <div className="rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-50 shadow-sm">
          <pre>
            <code>{activationCommand}</code>
          </pre>
        </div>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md bg-slate-700/80 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700">
          {copied ? (
            <>
              <Check size={14} className="text-green-400" /> Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy
            </>
          )}
        </button>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={() => router.push("/ingestion")}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
          Done, Go to Fleet Management
        </button>
      </div>
    </div>
  );
}
