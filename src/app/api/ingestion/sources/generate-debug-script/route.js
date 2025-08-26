import { NextResponse } from 'next/server';

// This is the full Python agent script. It's included here so the generated
// script is fully self-contained.
const pythonAgentScript = `
import time, json, requests, os, argparse, configparser, signal
from threading import Thread, Lock, Event

class CatalystAgent:
    def __init__(self, config_path):
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
                        if self.last_inode is not None and self.last_inode != current_inode:
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
            except PermissionError:
                print(f"[!] PERMISSION DENIED to read {self.config['logFile']}. Ensure agent has access. Retrying in 30s...")
                time.sleep(30)
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
        try:
            while not self.shutdown_event.is_set():
                time.sleep(1)
        except KeyboardInterrupt:
            self.graceful_shutdown(signal.SIGINT, None)
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Catalyst Universal Agent")
    parser.add_argument('-c', '--config', help='Path to the agent configuration file.')
    args = parser.parse_args()
    agent = CatalystAgent(args.config)
    agent.start()
`;

const debugScriptTemplate = (config) => `#!/bin/bash
# Catalyst Universal Agent DEBUG Script for Linux/macOS

# Create a temporary directory for the test in the user's home folder
echo "[*] Creating temporary directory: ~/catalyst-agent-test"
mkdir -p ~/catalyst-agent-test && cd ~/catalyst-agent-test

# Write the configuration file
echo "[*] Writing temporary agent.conf..."
tee ./agent.conf > /dev/null << EOF
[credentials]
key = ${config.ingestionKey}
endpoint = ${config.ingestionEndpoint}
[monitor]
file = /var/log/system.log
[tuning]
batch_size = 5
flush_interval_seconds = 5
EOF

# Write the agent script
echo "[*] Writing temporary catalyst_agent.py..."
tee ./catalyst_agent.py > /dev/null << 'EOF_AGENT'
${pythonAgentScript}
EOF_AGENT

# Run the agent directly in your terminal
echo "[*] Starting agent in debug mode. Press Ctrl+C to stop."
python3 ./catalyst_agent.py -c ./agent.conf
`;

export async function POST(request) {
    try {
        const { config } = await request.json();

        if (!config || !config.ingestionKey) {
            return NextResponse.json({ error: 'Configuration is required.' }, { status: 400 });
        }

        const scriptContent = debugScriptTemplate(config);
        const filename = 'debug_catalyst_agent.sh';
        const contentType = 'application/x-sh';

        return new Response(scriptContent, {
            headers: {
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Type': contentType,
            },
        });

    } catch (error) {
        console.error("[API] Error generating debug script:", error);
        return NextResponse.json({ error: 'Failed to generate debug script.' }, { status: 500 });
    }
}
