"use client";

import { useState } from "react";
import {
  KeyRound,
  Download,
  Loader2,
  Server,
  Terminal,
  Check,
  Copy,
  AlertCircle,
  Trash2,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

// This is the full Python agent script, now with proper file logging.
const pythonAgentScript = `
import time, json, requests, os, argparse, configparser, signal, logging, logging.handlers
from threading import Thread, Lock, Event

def setup_logging(log_file):
    """Configures logging to a rotating file."""
    logger = logging.getLogger('CatalystAgent')
    logger.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    
    # Always log to console for immediate feedback
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    try:
        # Create the log directory if it doesn't exist
        log_dir = os.path.dirname(log_file)
        if not os.path.exists(log_dir):
            print(f"[*] Log directory not found. Creating: {log_dir}")
            os.makedirs(log_dir, exist_ok=True)
            
        handler = logging.handlers.RotatingFileHandler(log_file, maxBytes=5*1024*1024, backupCount=3)
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    except Exception as e:
        logger.error(f"Could not set up file logging to {log_file}: {e}")

    return logger

class CatalystAgent:
    def __init__(self, config_path, logger):
        self.logger = logger
        self.config = self.load_config(config_path)
        self.log_buffer = []
        self.buffer_lock = Lock()
        try:
            self.hostname = os.uname().nodename
        except AttributeError:
            self.hostname = os.environ.get('COMPUTERNAME', 'unknown-host')
        self.shutdown_event = Event()
        self.last_inode = None

    def load_config(self, path):
        self.logger.info(f"Loading configuration from: {path}")
        try:
            parser = configparser.ConfigParser()
            parser.read(path)
            config = {
                'ingestionKey': parser.get('credentials', 'key'),
                'ingestionEndpoint': parser.get('credentials', 'endpoint'),
                'logFile': parser.get('monitor', 'file'),
                'batchSize': parser.getint('tuning', 'batch_size', fallback=100),
                'flushInterval': parser.getint('tuning', 'flush_interval_seconds', fallback=10)
            }
            self.logger.info("Configuration loaded successfully.")
            return config
        except Exception as e:
            self.logger.critical(f"FATAL: Could not load or parse config file: {e}")
            exit(1)

    def tail_log_file(self):
        self.logger.info(f"Starting to tail log file: {self.config['logFile']}")
        while not self.shutdown_event.is_set():
            try:
                with open(self.config['logFile'], 'r') as file:
                    self.last_inode = os.stat(self.config['logFile']).st_ino
                    file.seek(0, 2)
                    while not self.shutdown_event.is_set():
                        current_inode = os.stat(self.config['logFile']).st_ino
                        if self.last_inode is not None and self.last_inode != current_inode:
                            self.logger.info("Log file rotated. Re-opening.")
                            break
                        line = file.readline()
                        if not line:
                            time.sleep(0.1)
                            continue
                        with self.buffer_lock:
                            self.log_buffer.append(line.strip())
                            if len(self.log_buffer) >= self.config['batchSize']:
                                self.flush_buffer(force=True)
            except FileNotFoundError:
                self.logger.warning(f"Log file not found: {self.config['logFile']}. Retrying in 10 seconds...")
                time.sleep(10)
            except PermissionError:
                self.logger.error(f"PERMISSION DENIED to read {self.config['logFile']}. Ensure agent has access. Retrying in 30s...")
                time.sleep(30)
            except Exception as e:
                self.logger.error(f"Error tailing file: {e}")
                time.sleep(5)

    def flush_buffer(self, force=False):
        logs_to_send = []
        with self.buffer_lock:
            if self.log_buffer and (force or len(self.log_buffer) > 0):
                logs_to_send = self.log_buffer
                self.log_buffer = []
        if logs_to_send:
            self.send_logs(logs_to_send)

    def flush_buffer_periodically(self):
        while not self.shutdown_event.wait(self.config['flushInterval']):
            self.flush_buffer()

    def send_logs(self, logs):
        headers = {'Content-Type': 'application/json', 'Authorization': f"Bearer {self.config['ingestionKey']}"}
        payload = [{'timestamp': time.time(), 'hostname': self.hostname, 'message': log} for log in logs]
        retry_delay = 1
        for attempt in range(5):
            try:
                self.logger.info(f"Sending batch of {len(logs)} logs (Attempt {attempt + 1})...")
                response = requests.post(self.config['ingestionEndpoint'], headers=headers, data=json.dumps(payload), timeout=10, verify=False)
                response.raise_for_status()
                self.logger.info(f"Batch sent successfully (Status: {response.status_code}).")
                return
            except requests.exceptions.RequestException as e:
                self.logger.error(f"FAILED to send logs: {e}")
                if attempt < 4:
                    self.logger.warning(f"Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    self.logger.error("Max retries reached. Returning logs to buffer.")
                    with self.buffer_lock:
                        self.log_buffer.extend(logs)
                    break

    def graceful_shutdown(self, signum, frame):
        self.logger.info(f"Shutdown signal received. Flushing final logs...")
        self.shutdown_event.set()
        self.flush_buffer(force=True)
        self.logger.info("Agent shutdown complete.")

    def start(self):
        signal.signal(signal.SIGINT, self.graceful_shutdown)
        signal.signal(signal.SIGTERM, self.graceful_shutdown)
        self.logger.info("Starting Catalyst Universal Agent...")
        tail_thread = Thread(target=self.tail_log_file, daemon=True)
        send_thread = Thread(target=self.flush_buffer_periodically, daemon=True)
        tail_thread.start()
        send_thread.start()
        self.logger.info("Agent is running.")
        try:
            while not self.shutdown_event.is_set():
                time.sleep(1)
        except KeyboardInterrupt:
            self.graceful_shutdown(signal.SIGINT, None)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Catalyst Universal Agent")
    parser.add_argument('-c', '--config', help='Path to the agent configuration file.')
    args = parser.parse_args()
    
    config_parser = configparser.ConfigParser()
    config_parser.read(args.config)
    log_path = config_parser.get('agent', 'log_file', fallback=None)
    
    logger = setup_logging(log_path)
    agent = CatalystAgent(args.config, logger)
    agent.start()
`;

const linuxScriptTemplate = (config) => `#!/bin/bash
# Catalyst Universal Agent Installation Script for macOS (User-Level)

AGENT_DIR="$HOME/.catalyst-agent"
PLIST_NAME="com.catalyst.agent.plist"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME"

# --- Start: Clean up previous installations ---
echo "[*] Stopping and removing any previous agent service..."
launchctl unload "$PLIST_PATH" 2>/dev/null
rm "$PLIST_PATH" 2>/dev/null
rm -rf "$AGENT_DIR" 2>/dev/null
echo "[+] Cleanup complete."
# --- End: Clean up ---

# Create agent directory in user's home
echo "[*] Creating agent directory: $AGENT_DIR"
mkdir -p "$AGENT_DIR/logs"

# Create agent configuration file
echo "[*] Writing agent configuration..."
tee "$AGENT_DIR/agent.conf" > /dev/null << EOF
[credentials]
key = ${config.ingestionKey}
endpoint = ${config.ingestionEndpoint}

[monitor]
file = ${config.logFile || "/var/log/system.log"}

[tuning]
batch_size = 100
flush_interval_seconds = 10

[agent]
log_file = $AGENT_DIR/logs/catalyst-agent.log
EOF

# Create the agent script
echo "[*] Writing agent script..."
tee "$AGENT_DIR/catalyst_agent.py" > /dev/null << 'EOF_AGENT'
${pythonAgentScript}
EOF_AGENT

chmod +x "$AGENT_DIR/catalyst_agent.py"

# Create launchd service for persistence
echo "[*] Creating launchd service..."
tee "$PLIST_PATH" > /dev/null << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.catalyst.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>$AGENT_DIR/catalyst_agent.py</string>
        <string>-c</string>
        <string>$AGENT_DIR/agent.conf</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# Load and start the service
echo "[*] Starting and enabling the agent service..."
launchctl load "$PLIST_PATH"
launchctl start com.catalyst.agent

echo "[+] Catalyst Universal Agent installed and started successfully."
echo "[*] To view live agent logs, run: tail -f $AGENT_DIR/logs/catalyst-agent.log"
`;

export default function CatalystAgentConfig({ config, onConfigChange, type }) {
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptTab, setScriptTab] = useState("install");

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    setGeneratedConfig(null);
    try {
      const response = await fetch("/api/ingestion/sources/register-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: config.name, type: "catalyst-agent" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate key");

      const localConfig = {
        ...data,
        ingestionEndpoint: "http://localhost:3000/api/ingestion/logs",
      };

      setGeneratedConfig(localConfig);
      onConfigChange({ ...config, ...localConfig });
      toast.success("Credentials generated successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadScript = async (platform) => {
    try {
      const response = await fetch(
        "/api/ingestion/sources/generate-installer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform,
            config: { ...generatedConfig, logFile: config.logFile },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to download script.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        platform === "linux"
          ? "install_catalyst_agent.sh"
          : "install_catalyst_agent.ps1";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 mb-1">
          Agent Group Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={config.name || ""}
          onChange={(e) => onConfigChange({ ...config, name: e.target.value })}
          placeholder="e.g., My MacBook Pro"
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          A logical name for the group of agents that will use these
          credentials.
        </p>
      </div>

      <div>
        <label
          htmlFor="logFile"
          className="block text-sm font-medium text-slate-700 mb-1">
          Log File to Monitor
        </label>
        <input
          type="text"
          id="logFile"
          name="logFile"
          value={config.logFile || "/var/log/system.log"}
          onChange={(e) =>
            onConfigChange({ ...config, logFile: e.target.value })
          }
          className="block w-full font-mono text-xs rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          Enter the absolute path to the log file the agent should monitor.
        </p>
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={handleGenerateKey}
          disabled={isGenerating || !config.name || !config.logFile}
          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50">
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <KeyRound size={16} />
          )}
          {isGenerating ? "Generating..." : "Generate Credentials"}
        </button>
      </div>

      {generatedConfig && (
        <div className="space-y-6 pt-4 border-t border-slate-200">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-800">
              Installation & Management
            </h3>
            <div className="flex items-center p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setScriptTab("install")}
                className={clsx(
                  "flex-1 text-center flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors",
                  scriptTab === "install"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}>
                <Terminal size={16} /> Install
              </button>
              <button
                type="button"
                onClick={() => setScriptTab("troubleshoot")}
                className={clsx(
                  "flex-1 text-center flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors",
                  scriptTab === "troubleshoot"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}>
                <BookOpen size={16} /> Troubleshoot
              </button>
              <button
                type="button"
                onClick={() => setScriptTab("uninstall")}
                className={clsx(
                  "flex-1 text-center flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors",
                  scriptTab === "uninstall"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}>
                <Trash2 size={16} /> Uninstall
              </button>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scriptTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}>
                  {scriptTab === "install" && (
                    <LinuxInstructions
                      onDownload={() => handleDownloadScript("linux")}
                    />
                  )}
                  {scriptTab === "troubleshoot" && <TroubleshootInstructions />}
                  {scriptTab === "uninstall" && <UninstallInstructions />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CodeBlock = ({ command }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="relative">
      <pre className="block w-full rounded-md bg-slate-900 text-slate-300 p-3 text-xs font-mono overflow-x-auto">
        <code>{command}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md bg-slate-700/50 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700">
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};

const LinuxInstructions = ({ onDownload }) => (
  <div className="text-sm text-slate-700 space-y-4">
    <p>
      Download the installer script, transfer it to the target endpoint, and run
      it in the terminal. It does not require sudo.
    </p>
    <button
      type="button"
      onClick={onDownload}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
      <Download size={16} /> Download Installer (.sh)
    </button>
  </div>
);

const TroubleshootInstructions = () => (
  <div className="text-sm text-slate-700 space-y-4">
    <p>
      If the agent is not reporting data, you can view its live log output to
      diagnose the issue. Run this command in the terminal on the endpoint:
    </p>
    <CodeBlock command="tail -f ~/.catalyst-agent/logs/catalyst-agent.log" />
    <div className="text-xs p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
      <p>
        <span className="font-bold">macOS Permission Note:</span> You may still
        need to grant your terminal application "Full Disk Access" in System
        Settings {">"} Privacy & Security to allow it to read system log files.
      </p>
    </div>
  </div>
);

const UninstallInstructions = () => (
  <div className="text-sm text-slate-700 space-y-4">
    <p>
      To completely remove the Catalyst agent and its configuration from a macOS
      endpoint, run the following commands in your terminal:
    </p>
    <ol className="space-y-4 list-decimal list-inside">
      <li>
        <span className="font-semibold">
          Stop and unload the agent service:
        </span>
        <CodeBlock command="launchctl unload ~/Library/LaunchAgents/com.catalyst.agent.plist" />
      </li>
      <li>
        <span className="font-semibold">Remove all agent files:</span>
        <CodeBlock command="rm ~/Library/LaunchAgents/com.catalyst.agent.plist" />
      </li>
      <li>
        <span className="font-semibold">Remove the agent directory:</span>
        <CodeBlock command="rm -rf ~/.catalyst-agent" />
      </li>
    </ol>
  </div>
);
