"use client";

import { useState, useEffect } from "react";
import {
  Info,
  Ticket,
  RadioTower,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";

export default function JiraConfig({ onSave, isSaving }) {
  const [config, setConfig] = useState({
    name: "",
    jiraUrl: "",
    userEmail: "",
    apiToken: "",
    defaultProject: "",
    defaultIssueType: "",
  });
  const [connectionStatus, setConnectionStatus] = useState("idle"); // idle, testing, success, failed

  // State for data fetched dynamically from the user's Jira instance
  const [projects, setProjects] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleTestConnection = async () => {
    setConnectionStatus("testing");
    // Simulate API call to backend, which then calls Jira's /rest/api/3/myself endpoint
    await new Promise((res) => setTimeout(res, 1500));
    const success = Math.random() > 0.3; // Simulate success/failure
    setConnectionStatus(success ? "success" : "failed");
    if (success) {
      // If connection is successful, fetch the projects
      fetchJiraProjects();
    }
  };

  const fetchJiraProjects = async () => {
    setIsLoadingProjects(true);
    // Simulate API call to our backend to fetch projects from user's Jira
    await new Promise((res) => setTimeout(res, 1000));
    setProjects([
      { id: "10000", key: "SEC", name: "Security (SEC)" },
      { id: "10001", key: "IT", name: "IT Support (IT)" },
      { id: "10002", key: "ENG", name: "Engineering (ENG)" },
    ]);
    // Simulate fetching issue types for the first project
    setIssueTypes(["Task", "Bug", "Story", "Security Incident"]);
    setIsLoadingProjects(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ type: "jira", ...config });
  };

  return (
    <form
      id="integration-form"
      onSubmit={handleSubmit}
      className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Ticket size={32} className="text-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configure Jira</h2>
          <p className="text-slate-500">
            Create and manage Jira issues directly from playbooks.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-6 space-y-8">
          {/* --- STEP 1: CONNECTION & AUTHENTICATION --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              1. Connection Details
            </h3>
            <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 border border-amber-200">
              <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                The Jira API Token is a secret. It will be encrypted at rest and
                never displayed again.
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
                placeholder="e.g., Engineering Projects Jira"
                className="block w-full rounded-lg border-slate-300 shadow-sm"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="jiraUrl"
                  className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Jira URL
                </label>
                <input
                  type="url"
                  id="jiraUrl"
                  name="jiraUrl"
                  value={config.jiraUrl}
                  onChange={handleChange}
                  placeholder="https://your-company.atlassian.net"
                  className="block w-full rounded-lg border-slate-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="userEmail"
                  className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Your Atlassian Email
                </label>
                <input
                  type="email"
                  id="userEmail"
                  name="userEmail"
                  value={config.userEmail}
                  onChange={handleChange}
                  placeholder="you@your-company.com"
                  className="block w-full rounded-lg border-slate-300 shadow-sm"
                  required
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="apiToken"
                  className="block text-sm font-semibold text-slate-700">
                  API Token
                </label>
                <a
                  href="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                  How to create an API token <ExternalLink size={12} />
                </a>
              </div>
              <input
                type="password"
                id="apiToken"
                name="apiToken"
                value={config.apiToken}
                onChange={handleChange}
                className="block w-full rounded-lg border-slate-300 shadow-sm font-mono"
                required
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={connectionStatus === "testing"}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
                {connectionStatus === "testing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RadioTower size={16} />
                )}
                Test Connection
              </button>
              {connectionStatus !== "idle" && (
                <div
                  className={clsx(
                    "mt-4 flex items-center gap-2 text-sm font-medium",
                    connectionStatus === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  )}>
                  {connectionStatus === "success" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  {connectionStatus === "success"
                    ? "Connection successful! You can now set defaults."
                    : "Connection failed. Check URL, Email, and API Token."}
                </div>
              )}
            </div>
          </div>

          {/* --- STEP 2: DEFAULT CONFIGURATION (Gated UI) --- */}
          <div
            className={clsx(
              "space-y-4 transition-opacity duration-500",
              connectionStatus !== "success" && "opacity-40 pointer-events-none"
            )}>
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              2. Default Settings
            </h3>
            <p className="text-sm text-slate-500 -mt-2">
              Set the default project and issue type for tickets created by
              playbooks. These can be overridden in the playbook itself.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="defaultProject"
                  className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Default Project
                </label>
                {isLoadingProjects ? (
                  <div className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
                ) : (
                  <select
                    id="defaultProject"
                    name="defaultProject"
                    value={config.defaultProject}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-slate-300 shadow-sm"
                    required>
                    <option value="" disabled>
                      Select a project...
                    </option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.key}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label
                  htmlFor="defaultIssueType"
                  className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Default Issue Type
                </label>
                {isLoadingProjects ? (
                  <div className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
                ) : (
                  <select
                    id="defaultIssueType"
                    name="defaultIssueType"
                    value={config.defaultIssueType}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-slate-300 shadow-sm"
                    required>
                    <option value="" disabled>
                      Select an issue type...
                    </option>
                    {issueTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
