"use client";

export default function SmtpConfig({ config, handleChange, presets, isLoadingPresets, handlePresetClick }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">Load common provider settings:</label>
        <div className="flex flex-wrap gap-2">
            {isLoadingPresets ? (
                <span className="text-xs text-slate-400">Loading presets...</span>
            ) : (
                presets.map(preset => (
                    <button key={preset.name} type="button" onClick={() => handlePresetClick(preset)} className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-slate-200">
                        {preset.name}
                    </button>
                ))
            )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">SMTP Server</label><input type="text" name="smtpServer" value={config.smtpServer} onChange={handleChange} placeholder="smtp.example.com" className="block w-full rounded-lg border-slate-300 shadow-sm" required/></div>
        <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Port</label><input type="text" name="smtpPort" value={config.smtpPort} onChange={handleChange} placeholder="587" className="block w-full rounded-lg border-slate-300 shadow-sm" required/></div>
        <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label><input type="text" name="smtpUser" value={config.smtpUser} onChange={handleChange} className="block w-full rounded-lg border-slate-300 shadow-sm" required/></div>
        <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label><input type="password" name="smtpPass" value={config.smtpPass} onChange={handleChange} className="block w-full rounded-lg border-slate-300 shadow-sm" required/></div>
      </div>
    </div>
  );
}