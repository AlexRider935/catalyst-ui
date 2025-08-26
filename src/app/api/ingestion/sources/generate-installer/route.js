import { NextResponse } from 'next/server';

// This is the same Python agent script from before.
// Having it on the server ensures it's always up-to-date.
const pythonAgentScript = `
import time, json, requests, os, argparse, configparser, signal
from threading import Thread, Lock, Event

class CatalystAgent:
    def __init__(self, config_path):
        self.config = self.load_config(config_path)
        self.log_buffer = []
        self.buffer_lock = Lock()
        self.hostname = os.uname().nodename
        self.shutdown_event = Event()
        self.last_inode = None
    def load_config(self, path):
        print(f"[*] Loading configuration from: {path}")
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
            print("[+] Configuration loaded successfully.")
            return config
        except Exception as e:
            print(f"[!] FATAL: Could not load or parse config file: {e}")
            exit(1)
    def get_inode(self, file_path):
        try:
            return os.stat(file_path).st_ino
        except FileNotFoundError:
            return None
    def tail_log_file(self):
        print(f"[*] Starting to tail log file: {self.config['logFile']}")
        while not self.shutdown_event.is_set():
            try:
                with open(self.config['logFile'], 'r') as file:
                    self.last_inode = self.get_inode(self.config['logFile'])
                    file.seek(0, 2)
                    while not self.shutdown_event.is_set():
                        current_inode = self.get_inode(self.config['logFile'])
                        if self.last_inode != current_inode:
                            print("[*] Log file rotated. Re-opening.")
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
                print(f"[!] Log file not found: {self.config['logFile']}. Retrying in 10 seconds...")
                time.sleep(10)
            except Exception as e:
                print(f"[!] Error tailing file: {e}")
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
                print(f"[*] Sending batch of {len(logs)} logs (Attempt {attempt + 1})...")
                response = requests.post(self.config['ingestionEndpoint'], headers=headers, data=json.dumps(payload), timeout=10, verify=False)
                response.raise_for_status()
                print(f"[+] Batch sent successfully (Status: {response.status_code}).")
                return
            except requests.exceptions.RequestException as e:
                print(f"[!] FAILED to send logs: {e}")
                if attempt < 4:
                    print(f"[*] Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    print("[!] Max retries reached. Returning logs to buffer.")
                    with self.buffer_lock:
                        self.log_buffer.extend(logs)
                    break
    def graceful_shutdown(self, signum, frame):
        print(f"\\n[*] Shutdown signal received (Signal {signum}). Flushing final logs...")
        self.shutdown_event.set()
        self.flush_buffer(force=True)
        print("[*] Agent shutdown complete.")
    def start(self):
        signal.signal(signal.SIGINT, self.graceful_shutdown)
        signal.signal(signal.SIGTERM, self.graceful_shutdown)
        print("[*] Starting Catalyst Universal Agent...")
        tail_thread = Thread(target=self.tail_log_file, daemon=True)
        send_thread = Thread(target=self.flush_buffer_periodically, daemon=True)
        tail_thread.start()
        send_thread.start()
        print("[+] Agent is running. Press Ctrl+C to stop.")
        tail_thread.join()
        send_thread.join()
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Catalyst Universal Agent")
    parser.add_argument('-c', '--config', default='/etc/catalyst-agent/agent.conf', help='Path to the agent configuration file.')
    args = parser.parse_args()
    agent = CatalystAgent(args.config)
    agent.start()
`;

const linuxScriptTemplate = (config) => `#!/bin/bash
# Catalyst Universal Agent Installation Script for Linux/macOS

# Create configuration directory
echo "[*] Creating configuration directory..."
sudo mkdir -p /etc/catalyst-agent

# Create agent configuration file
echo "[*] Writing agent configuration..."
sudo tee /etc/catalyst-agent/agent.conf > /dev/null << EOF
[credentials]
key = ${config.ingestionKey}
endpoint = ${config.ingestionEndpoint}

[monitor]
file = /var/log/system.log

[tuning]
batch_size = 100
flush_interval_seconds = 10
EOF

# Create the agent script
echo "[*] Writing agent script..."
sudo tee /usr/local/bin/catalyst_agent.py > /dev/null << 'EOF_AGENT'
${pythonAgentScript}
EOF_AGENT

# Make the agent executable
sudo chmod +x /usr/local/bin/catalyst_agent.py

# Create launchd service for persistence on macOS
echo "[*] Creating launchd service..."
sudo tee /Library/LaunchDaemons/com.catalyst.agent.plist > /dev/null << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.catalyst.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/usr/local/bin/catalyst_agent.py</string>
        <string>-c</string>
        <string>/etc/catalyst-agent/agent.conf</string>
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
sudo launchctl load /Library/LaunchDaemons/com.catalyst.agent.plist
sudo launchctl start com.catalyst.agent

echo "[+] Catalyst Universal Agent installed and started successfully."
`;

export async function POST(request) {
    try {
        const { platform, config } = await request.json();

        if (!platform || !config || !config.ingestionKey) {
            return NextResponse.json({ error: 'Platform and configuration are required.' }, { status: 400 });
        }

        let scriptContent = '';
        let filename = '';
        let contentType = '';

        if (platform === 'linux') {
            scriptContent = linuxScriptTemplate(config);
            filename = 'install_catalyst_agent.sh';
            contentType = 'application/x-sh';
        } else {
            // Placeholder for Windows script
            scriptContent = `# Windows script generation is not yet implemented.`;
            filename = 'install_catalyst_agent.ps1';
            contentType = 'application/octet-stream';
        }

        return new Response(scriptContent, {
            headers: {
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Type': contentType,
            },
        });

    } catch (error) {
        console.error("[API] Error generating installer:", error);
        return NextResponse.json({ error: 'Failed to generate installer script.' }, { status: 500 });
    }
}