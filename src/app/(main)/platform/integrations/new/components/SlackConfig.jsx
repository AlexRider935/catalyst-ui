"use client";

import { useState, useEffect } from "react";
import { Info, MessageSquare, RadioTower, CheckCircle, XCircle, Loader2, KeyRound, ExternalLink, Link as LinkIcon } from "lucide-react";
import clsx from "clsx";

// This would be fetched from the playbook engine context
const TEMPLATE_VARIABLES = [
    { variable: "{{alert.name}}", description: "The name of the triggering alert." },
    { variable: "{{alert.severity}}", description: "The severity of the alert." },
    { variable: "{{endpoint.hostname}}", description: "The affected endpoint." },
];

export default function SlackConfig({ onSave, isSaving }) {
  const [authMethod, setAuthMethod] = useState("oauth"); // 'oauth' or 'webhook'
  const [config, setConfig] = useState({
    name: "",
    webhookUrl: "",
    // State for OAuth
    oauthToken: null, // This would be populated by the OAuth flow
    workspaceName: null,
    defaultChannel: "",
    // State for template
    messageTemplate: "🚨 *Security Alert: {{alert.name}}*\nSeverity: `{{alert.severity}}`\nEndpoint: `{{endpoint.hostname}}`"
  });
  const [testStatus, setTestStatus] = useState("idle");
  const [keyValid, setKeyValid] = useState(null); // For webhook URL validation

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };
  
  // Proactive validation for the webhook URL format
useEffect(() => {
  if (authMethod === "webhook" && config?.webhookUrl) {
    // ✅ Regex for Slack incoming webhooks
    const slackWebhookRegex =
      /^https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9\/]+$/;

    const isValid = slackWebhookRegex.test(config.webhookUrl.trim());
    setKeyValid(isValid);
  } else {
    setKeyValid(null);
  }
}, [config?.webhookUrl, authMethod]);

  const handleTest = async () => {
    setTestStatus("testing");
    await new Promise(res => setTimeout(res, 1500));
    setTestStatus(Math.random() > 0.3 ? "success" : "failed");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ type: 'slack', ...config, authMethod });
  };

  const handleConnectSlack = async () => {
    // In a real app, this would open a popup to Slack's OAuth page.
    // Here, we simulate the successful connection.
    setConfig({
      ...config,
      oauthToken: 'xoxb-simulated-token-xxxx',
      workspaceName: 'The Catalyst Corp'
    });
    alert("Simulated Slack connection successful!");
  };

  return (
    <form id="integration-form" onSubmit={handleSubmit} className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare size={32} className="text-slate-600"/>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configure Slack</h2>
          <p className="text-slate-500">Connect a new Slack workspace for playbook notifications.</p>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-6 space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">1. Connection Details</h3>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">Connection Name</label>
              <input type="text" id="name" name="name" value={config.name} onChange={handleChange} placeholder="e.g., SOC Alerts Workspace" className="block w-full rounded-lg border-slate-300 shadow-sm" required />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">2. Authentication</h3>
            <div className="flex items-center p-1 bg-slate-100 rounded-lg w-full md:w-auto">
                <button type="button" onClick={() => setAuthMethod('oauth')} className={clsx("flex-1 text-center flex items-center justify-center gap-2 px-3 py-1 rounded-md text-sm font-semibold transition-colors", authMethod === 'oauth' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700')}><KeyRound size={16}/> Slack App (OAuth)</button>
                <button type="button" onClick={() => setAuthMethod('webhook')} className={clsx("flex-1 text-center px-3 py-1 rounded-md text-sm font-semibold transition-colors", authMethod === 'webhook' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>Webhook URL</button>
            </div>

            {authMethod === 'oauth' ? (
                <div className="p-4 border border-slate-200 rounded-lg">
                    {config.workspaceName ? (
                        <div className="flex items-center gap-3">
                            <CheckCircle size={20} className="text-green-500"/>
                            <div>
                                <p className="font-semibold text-slate-800">Successfully connected to Slack</p>
                                <p className="text-sm text-slate-600">Workspace: <span className="font-bold">{config.workspaceName}</span></p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-slate-600 mb-3">Connecting as a Slack App is the recommended and most secure method. This allows you to select channels, send DMs, and use rich formatting.</p>
                            <button type="button" onClick={handleConnectSlack} className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-900">
                                <LinkIcon size={16}/> Connect to Slack
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 border border-amber-200"><Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" /><p className="text-sm text-amber-800">Webhook URLs are less secure and flexible than Slack Apps. This method is provided for legacy compatibility.</p></div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label htmlFor="webhookUrl" className="block text-sm font-semibold text-slate-700">Incoming Webhook URL</label>
                            <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">How to create a webhook <ExternalLink size={12} /></a>
                        </div>
                        <div className="relative">
                            <input type="password" id="webhookUrl" name="webhookUrl" value={config.webhookUrl} onChange={handleChange} placeholder="https://hooks.slack.com/services/T000/B000/XXXXXXXXXXXXXXXX" className="block w-full rounded-lg border-slate-300 shadow-sm font-mono pr-10" required />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">{keyValid === true && <CheckCircle size={16} className="text-green-500" />}{keyValid === false && config.webhookUrl.length > 0 && <XCircle size={16} className="text-red-500" />}</div>
                        </div>
                    </div>
                </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">3. Message Template & Testing</h3>
            <div>
                <label htmlFor="defaultChannel" className="block text-sm font-semibold text-slate-700 mb-1.5">Default Channel or User ID</label>
                <input type="text" id="defaultChannel" name="defaultChannel" value={config.defaultChannel} onChange={handleChange} placeholder={authMethod === 'oauth' ? "e.g., C024BE91L or U024BE91L" : "#soc-alerts"} className="block w-full rounded-lg border-slate-300 shadow-sm" required />
                <p className="mt-1 text-xs text-slate-500">For Webhooks, use the channel name. For Apps, use the Channel or User ID.</p>
            </div>
            <div>
              <label htmlFor="messageTemplate" className="block text-sm font-semibold text-slate-700 mb-1.5">Default Message Template</label>
              <textarea name="messageTemplate" value={config.messageTemplate} onChange={handleChange} rows={4} className="block w-full rounded-lg border-slate-300 shadow-sm font-mono text-xs" required/>
              <div className="flex flex-wrap gap-2 mt-2">
                  {TEMPLATE_VARIABLES.map(v => <button type="button" key={v.variable} title={v.description} className="bg-slate-100 text-slate-700 text-xs font-mono px-2 py-1 rounded-md hover:bg-slate-200">{v.variable}</button>)}
              </div>
            </div>
            <div>
                <button type="button" onClick={handleTest} disabled={(!config.webhookUrl && !config.oauthToken) || testStatus === 'testing'} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
                    {testStatus === 'testing' ? <Loader2 className="h-4 w-4 animate-spin"/> : <RadioTower size={16}/>}
                    {testStatus === 'testing' ? 'Testing...' : 'Send Test Notification'}
                </button>
                {testStatus !== 'idle' && (
                    <div className={clsx("mt-4 flex items-center gap-2 text-sm font-medium", testStatus === 'success' ? 'text-green-600' : 'text-red-600')}>
                        {testStatus === 'success' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                        {testStatus === 'success' ? 'Test notification sent successfully!' : 'Test failed. Check configuration.'}
                    </div>
                )}
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}