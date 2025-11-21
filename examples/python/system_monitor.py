#!/usr/bin/env python3
"""
System Monitor Example
Monitors system resources and triggers appropriate emotions
"""

import requests
import time
import psutil

API_URL = 'http://localhost:3000/api/event'

def trigger_emotion(emotion):
    """Trigger an emotion animation"""
    try:
        requests.post(API_URL,
            json={'type': 'emotion', 'value': emotion},
            timeout=2
        )
    except Exception as e:
        print(f"Error triggering emotion: {e}")

def get_system_state():
    """Determine system state based on resource usage"""
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory().percent

    print(f"CPU: {cpu}%, Memory: {memory}%")

    if cpu > 80 or memory > 90:
        return 'alert'  # High resource usage
    elif cpu > 60 or memory > 70:
        return 'thinking'  # Moderate usage
    elif cpu < 10 and memory < 30:
        return 'sleeping'  # Low usage
    else:
        return 'idle'  # Normal usage

def main():
    print("Starting system monitor...")
    print("Monitoring CPU and memory usage...")
    print("Press Ctrl+C to stop\n")

    last_state = None

    try:
        while True:
            current_state = get_system_state()

            # Only trigger if state changed
            if current_state != last_state:
                print(f"→ State changed to: {current_state}")
                trigger_emotion(current_state)
                last_state = current_state

            time.sleep(10)  # Check every 10 seconds

    except KeyboardInterrupt:
        print("\n\nStopping monitor...")
        trigger_emotion('idle')

if __name__ == '__main__':
    main()
