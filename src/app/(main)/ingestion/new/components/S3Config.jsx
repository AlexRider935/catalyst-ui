"use client";

export default function S3Config({ config, onConfigChange }) {
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
          placeholder="e.g., AWS CloudTrail S3 Bucket"
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label
          htmlFor="bucket_name"
          className="block text-sm font-medium text-slate-700 mb-1">
          Bucket Name
        </label>
        <input
          type="text"
          id="bucket_name"
          name="bucket_name"
          value={config.bucket_name || ""}
          onChange={(e) =>
            onConfigChange({ ...config, bucket_name: e.target.value })
          }
          placeholder="my-security-log-bucket"
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label
          htmlFor="role_arn"
          className="block text-sm font-medium text-slate-700 mb-1">
          IAM Role ARN
        </label>
        <input
          type="text"
          id="role_arn"
          name="role_arn"
          value={config.role_arn || ""}
          onChange={(e) =>
            onConfigChange({ ...config, role_arn: e.target.value })
          }
          placeholder="arn:aws:iam::123456789012:role/CatalystS3AccessRole"
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          Provide the ARN of an IAM role with read access to the specified
          bucket.
        </p>
      </div>
    </div>
  );
}
