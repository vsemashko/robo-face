#!/usr/bin/env python3
"""
Simple example: Trigger emotions via REST API
"""

import requests
import sys
import time

API_URL = 'http://localhost:3000/api/event'

def trigger_emotion(emotion, duration=3000):
    """Trigger an emotion animation"""
    try:
        response = requests.post(API_URL,
            json={
                'type': 'emotion',
                'value': emotion,
                'duration': duration
            },
            timeout=5
        )
        response.raise_for_status()
        result = response.json()
        print(f"✓ Triggered {emotion}: {result}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"✗ Error: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python trigger_emotion.py <emotion> [duration]")
        print("Emotions: idle, happy, thinking, alert, sad, surprised, sleeping")
        sys.exit(1)

    emotion = sys.argv[1]
    duration = int(sys.argv[2]) if len(sys.argv) > 2 else 3000

    trigger_emotion(emotion, duration)

if __name__ == '__main__':
    main()
