import requests
import time
import os
import json
import argparse
import uuid
import threading # Import the threading library

# --- Configuration ---
CONFIG_FILE = 'agent_config.json' 
SERVER_URL = 'http://localhost:3000' 

def get_device_id():
    mac = ':'.join(['{:02x}'.format((uuid.getnode() >> i) & 0xff) for i in range(0, 8*6, 8)][::-1])
    return mac

def register_agent(token):
    device_id = get_device_id()
    print(f"Device ID: {device_id}")
    print("Attempting to register...")
    
    try:
        response = requests.post(
            f"{SERVER_URL}/api/agents/register",
            json={'registration_token': token, 'device_identifier': device_id}
        )
        response.raise_for_status()
        data = response.json()
        api_key = data.get('api_key')
        
        if not api_key:
            print("❌ Error: Did not receive an API key.")
            return

        print("✅ Registration successful! Saving permanent API key.")
        with open(CONFIG_FILE, 'w') as f:
            json.dump({'api_key': api_key}, f)
        
        run_agent_tasks(api_key)

    except requests.exceptions.HTTPError as e:
        print(f"❌ Registration failed: {e.response.status_code} {e.response.text}")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")

# --- NEW HEARTBEAT FUNCTION ---
def send_heartbeat(api_key, stop_event):
    """Sends a heartbeat every 60 seconds to keep the agent 'Online'."""
    headers = {'Authorization': f'Bearer {api_key}'}
    while not stop_event.is_set():
        try:
            requests.post(f"{SERVER_URL}/api/agents/heartbeat", headers=headers, timeout=10)
            # print("❤️ Heartbeat sent.") # You can uncomment this for debugging
        except requests.exceptions.RequestException:
            # print("⚠️ Heartbeat failed. Will retry.") # Uncomment for debugging
            pass
        # Wait for 60 seconds, but check for the stop signal every second
        for _ in range(60):
            if stop_event.is_set():
                break
            time.sleep(1)

def send_data_loop(api_key, stop_event):
    """The main loop for sending actual log data."""
    print("📡 Data sending loop started.")
    while not stop_event.is_set():
        # --- This is where you would collect your actual logs ---
        dummy_log_event = {
            "hostname": "local-machine",
            "data": {
                "service": "test_service",
                "message": f"Agent is alive and running at {time.ctime()}"
            }
        }
        
        try:
            headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}
            requests.post(f"{SERVER_URL}/api/ingestion/logs", headers=headers, json=[dummy_log_event], timeout=15)
            print(f"Logs sent at {time.ctime()}")
        except requests.exceptions.RequestException as e:
            print(f"🔌 Connection error while sending logs: {e}")
            
        # Wait for 30 seconds (adjust as needed)
        time.sleep(30)

def run_agent_tasks(api_key):
    """Starts the heartbeat and data sending threads."""
    stop_event = threading.Event()

    # Create and start the heartbeat thread
    heartbeat_thread = threading.Thread(target=send_heartbeat, args=(api_key, stop_event))
    heartbeat_thread.daemon = True # Allows main program to exit even if thread is running
    heartbeat_thread.start()

    # The main thread will run the data sending loop
    try:
        send_data_loop(api_key, stop_event)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down agent...")
        stop_event.set()
        heartbeat_thread.join() # Wait for the heartbeat thread to finish
        print("Agent stopped.")

def main():
    parser = argparse.ArgumentParser(description="A simple endpoint agent.")
    parser.add_argument('--register', metavar='TOKEN', help='Register the agent with a one-time token.')
    args = parser.parse_args()

    if args.register:
        register_agent(args.register)
    elif os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                config = json.load(f)
            api_key = config.get('api_key')
            if api_key:
                run_agent_tasks(api_key)
            else:
                print("Config file is corrupted. Please re-register.")
        except Exception as e:
            print(f"Could not read config file: {e}. Please re-register.")
    else:
        print("Agent is not registered. Use --register <TOKEN> to get started.")

if __name__ == '__main__':
    main()