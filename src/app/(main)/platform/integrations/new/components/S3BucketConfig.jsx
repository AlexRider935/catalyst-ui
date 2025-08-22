// src/app/(main)/integrations/new/components/S3BucketConfig.jsx
"use client";
import { useState } from "react";
import { Info, Cloud } from "lucide-react";

export default function S3BucketConfig({ onSave, isSaving }) {
  const [config, setConfig] = useState({
    name: "",
    bucketName: "",
    region: "us-east-1",
    accessKeyId: "",
    secretAccessKey: "",
  });
  const handleChange = (e) =>
    setConfig({ ...config, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ type: "s3", ...config });
  };

  return (
    <form
      id="integration-form"
      onSubmit={handleSubmit}
      className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Cloud size={32} className="text-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Configure AWS S3 Bucket
          </h2>
          <p className="text-slate-500">
            Export enriched logs and evidence to an S3 bucket.
          </p>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200">
            <Info className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              **Security Best Practice:** It is strongly recommended to use an
              IAM Role with minimum necessary permissions (`s3:PutObject`)
              instead of long-lived access keys where possible.
            </p>
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-slate-700 mb-1.5">
              Connection Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={config.name}
              onChange={handleChange}
              placeholder="e.g., Security Log Archive"
              className="block w-full rounded-lg border-slate-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="bucketName"
              className="block text-sm font-semibold text-slate-700 mb-1.5">
              S3 Bucket Name
            </label>
            <input
              type="text"
              id="bucketName"
              name="bucketName"
              value={config.bucketName}
              onChange={handleChange}
              placeholder="e.g., catalyst-security-logs"
              className="block w-full rounded-lg border-slate-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="accessKeyId"
              className="block text-sm font-semibold text-slate-700 mb-1.5">
              AWS Access Key ID
            </label>
            <input
              type="text"
              id="accessKeyId"
              name="accessKeyId"
              value={config.accessKeyId}
              onChange={handleChange}
              className="block w-full rounded-lg border-slate-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="secretAccessKey"
              className="block text-sm font-semibold text-slate-700 mb-1.5">
              AWS Secret Access Key
            </label>
            <input
              type="password"
              id="secretAccessKey"
              name="secretAccessKey"
              value={config.secretAccessKey}
              onChange={handleChange}
              className="block w-full rounded-lg border-slate-300 shadow-sm"
              required
            />
          </div>
        </div>
      </div>
    </form>
  );
}
