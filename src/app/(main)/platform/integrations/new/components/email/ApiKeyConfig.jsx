"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Info, Check, AlertCircle } from "lucide-react";

// ✅ Expanded provider data with documentation links and validation regex
const API_PROVIDERS = [
  {
    id: "sendgrid",
    name: "SendGrid",
    key_placeholder: "SG.••••••••••••••••••••••••••••••••",
    docs_url: "https://docs.sendgrid.com/ui/account-and-settings/api-keys",
    validation_regex: /^SG\..{22,}\..{43,}$/,
  },
  {
    id: "postmark",
    name: "Postmark",
    key_placeholder: "••••••••-••••-••••-••••-••••••••••••",
    docs_url:
      "https://postmarkapp.com/developer/api/overview#server-api-tokens",
    validation_regex: /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/,
  },
  {
    id: "mailgun",
    name: "Mailgun",
    key_placeholder: "key-••••••••••••••••••••••••••••••••",
    docs_url:
      "https://documentation.mailgun.com/en/latest/user_manual.html#api-keys",
    validation_regex: /^key-[a-f0-9]{32}$/,
  },
];

export default function ApiKeyConfig({ config, handleChange }) {
  const [keyValid, setKeyValid] = useState(null); // null, true, or false

  const selectedProvider = API_PROVIDERS.find(
    (p) => p.id === config.apiService
  );

  // ✅ Validate the key format whenever the key or service changes
  useEffect(() => {
    if (!config.apiKey || !selectedProvider) {
      setKeyValid(null);
      return;
    }
    const isValid = selectedProvider.validation_regex.test(config.apiKey);
    setKeyValid(isValid);
  }, [config.apiKey, selectedProvider]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label
            htmlFor="apiService"
            className="block text-sm font-semibold text-slate-700">
            Email Service Provider
          </label>
          <span className="group relative">
            <Info size={14} className="text-slate-400 cursor-help" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Using an API key is more secure than SMTP because it's
              application-specific, can be easily revoked, and doesn't expose
              your primary account password.
            </span>
          </span>
        </div>
        <select
          id="apiService"
          name="apiService"
          value={config.apiService}
          onChange={handleChange}
          className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          {API_PROVIDERS.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label
            htmlFor="apiKey"
            className="block text-sm font-semibold text-slate-700">
            {selectedProvider?.name} API Key
          </label>
          {selectedProvider?.docs_url && (
            <a
              href={selectedProvider.docs_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
              Find your API key <ExternalLink size={12} />
            </a>
          )}
        </div>
        <div className="relative">
          <input
            type="password"
            id="apiKey"
            name="apiKey"
            value={config.apiKey}
            onChange={handleChange}
            placeholder={selectedProvider?.key_placeholder || ""}
            className="block w-full rounded-lg border-slate-300 shadow-sm font-mono pr-10"
            required
          />
          {/* ✅ Inline Validation Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {keyValid === true && (
              <Check size={16} className="text-green-500" />
            )}
            {keyValid === false && config.apiKey.length > 0 && (
              <AlertCircle size={16} className="text-red-500" />
            )}
          </div>
        </div>
        {keyValid === false && config.apiKey.length > 0 && (
          <p className="mt-2 text-xs text-red-600">
            The key format appears incorrect for {selectedProvider?.name}.
          </p>
        )}
      </div>
    </div>
  );
}
