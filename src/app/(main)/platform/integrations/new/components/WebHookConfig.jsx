// src/app/(main)/integrations/new/components/WebhookConfig.jsx

"use client";

import { useState } from "react";
import {
  Info,
  Copy,
  KeyRound,
  RadioTower,
  CheckCircle,
  XCircle,
  Loader2,
  Puzzle,
} from "lucide-react";
import clsx from "clsx";

export default function WebhookConfig({ onSave, isSaving }) {
  const [config, setConfig] = useState({ name: "", targetUrl: "", secret: "" });
  const [testStatus, setTestStatus] = useState("idle");

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const generateSecret = () => {
    const newSecret = `cat_sec_${[...Array(32)]
      .map(() => Math.random().toString(36)[2])
      .join("")}`;
    setConfig({ ...config, secret: newSecret });
  };

  const handleTest = async () => {
    /* ... same test logic as before ... */
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ type: "webhook", ...config });
  };

  // You can include the examplePayload and copySecret logic here as before

  return (
    <form
      id="integration-form"
      onSubmit={handleSubmit}
      className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Puzzle size={32} className="text-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Configure Custom Webhook
          </h2>
          <p className="text-slate-500">
            Send playbook data to any external API endpoint.
          </p>
        </div>
      </div>
      {/* The rest of the Webhook form fields would go here, structured like the SlackConfig component */}
      <p className="text-center text-slate-500 mt-8">
        (Webhook configuration form fields here)
      </p>
    </form>
  );
}
