"use client";

import { UploadCloud } from "lucide-react";

export default function FileUploadConfig({ config, onConfigChange }) {
  // This handler is specific to file inputs
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onConfigChange({ ...config, file: e.target.files[0] });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 mb-1">
          Source Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={config.name || ""}
          onChange={(e) => onConfigChange({ ...config, name: e.target.value })}
          placeholder="e.g., Q3 Firewall Log Export"
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          Give this one-time upload a descriptive name for your records.
        </p>
      </div>

      <div>
        <label
          htmlFor="file_format"
          className="block text-sm font-medium text-slate-700 mb-1">
          File Format
        </label>
        <select
          id="file_format"
          name="file_format"
          value={config.file_format || "json"}
          onChange={(e) =>
            onConfigChange({ ...config, file_format: e.target.value })
          }
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
          <option value="json">JSON Lines</option>
          <option value="csv">CSV</option>
          <option value="log">Plain Text (.log)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Upload File
        </label>
        <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 pt-5 pb-6">
          <div className="space-y-1 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
            <div className="flex text-sm text-slate-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                <span>Select a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            {config.file ? (
              <p className="text-sm font-semibold text-slate-800 pt-2">
                {config.file.name}
              </p>
            ) : (
              <p className="text-xs text-slate-500">Maximum file size: 100MB</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
