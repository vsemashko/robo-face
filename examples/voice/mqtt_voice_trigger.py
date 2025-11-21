#!/usr/bin/env python3
"""
MQTT Voice Trigger Example

This example shows how to trigger voice conversations via MQTT messages.
Useful for IoT integrations where sensors or other devices can trigger
voice responses from the characters.

Requirements:
    pip install paho-mqtt requests

Usage:
    python mqtt_voice_trigger.py

MQTT Message Format:
    Topic: robo-face/voice/command
    Payload: {
        "text": "Hello, how are you?",
        "character": "robo-face",
        "sessionId": "mqtt-session"
    }
"""

import paho.mqtt.client as mqtt
import requests
import json
import time
import sys

# Configuration
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC_COMMAND = "robo-face/voice/command"
MQTT_TOPIC_RESPONSE = "robo-face/voice/response"
MQTT_TOPIC_EMOTION = "robo-face/voice/emotion"

ROBO_FACE_URL = "http://localhost:3000"
DEFAULT_CHARACTER = "robo-face"


class VoiceMQTTBridge:
    """Bridge between MQTT and Robo-Face voice API."""

    def __init__(self, broker=MQTT_BROKER, port=MQTT_PORT, api_url=ROBO_FACE_URL):
        self.broker = broker
        self.port = port
        self.api_url = api_url
        self.client = mqtt.Client()

        # Set up callbacks
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect

    def on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker."""
        if rc == 0:
            print(f"✓ Connected to MQTT broker at {self.broker}:{self.port}")
            # Subscribe to command topic
            client.subscribe(MQTT_TOPIC_COMMAND)
            print(f"✓ Subscribed to {MQTT_TOPIC_COMMAND}")
        else:
            print(f"❌ Failed to connect to MQTT broker (code: {rc})")

    def on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from MQTT broker."""
        if rc != 0:
            print(f"⚠️  Unexpected disconnect from MQTT broker")

    def on_message(self, client, userdata, msg):
        """Callback when MQTT message received."""
        try:
            # Parse message
            payload = json.loads(msg.payload.decode())
            text = payload.get("text")
            character = payload.get("character", DEFAULT_CHARACTER)
            session_id = payload.get("sessionId", "mqtt-session")

            if not text:
                print("❌ Error: Message missing 'text' field")
                return

            print(f"\n📨 Received command: {text}")
            print(f"   Character: {character}")
            print(f"   Session: {session_id}")

            # Send to voice API
            response = self.send_voice_command(text, character, session_id)

            if response:
                # Publish response
                self.publish_response(response, character)
                # Publish emotion
                self.publish_emotion(response.get("emotion"), character)

        except json.JSONDecodeError:
            print(f"❌ Error: Invalid JSON in message")
        except Exception as e:
            print(f"❌ Error processing message: {e}")

    def send_voice_command(self, text, character, session_id):
        """Send command to voice API and get response."""
        url = f"{self.api_url}/api/voice/chat"

        payload = {
            "text": text,
            "character": character,
            "sessionId": session_id
        }

        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()

            print(f"✓ Response: {data['text']}")
            print(f"   Emotion: {data['emotion']}")

            return data

        except requests.exceptions.RequestException as e:
            print(f"❌ API Error: {e}")
            return None

    def publish_response(self, response, character):
        """Publish voice response to MQTT topic."""
        payload = {
            "text": response["text"],
            "character": character,
            "emotion": response["emotion"],
            "timestamp": time.time()
        }

        self.client.publish(
            MQTT_TOPIC_RESPONSE,
            json.dumps(payload),
            qos=1
        )
        print(f"✓ Published response to {MQTT_TOPIC_RESPONSE}")

    def publish_emotion(self, emotion, character):
        """Publish emotion change to MQTT topic."""
        if not emotion:
            return

        payload = {
            "emotion": emotion,
            "character": character,
            "timestamp": time.time()
        }

        self.client.publish(
            MQTT_TOPIC_EMOTION,
            json.dumps(payload),
            qos=1
        )
        print(f"✓ Published emotion to {MQTT_TOPIC_EMOTION}")

    def start(self):
        """Connect to MQTT broker and start listening."""
        print("🤖 MQTT Voice Bridge Starting...")
        print(f"   Broker: {self.broker}:{self.port}")
        print(f"   API: {self.api_url}")
        print(f"   Command topic: {MQTT_TOPIC_COMMAND}")
        print(f"   Response topic: {MQTT_TOPIC_RESPONSE}")
        print(f"   Emotion topic: {MQTT_TOPIC_EMOTION}")
        print()

        try:
            self.client.connect(self.broker, self.port, 60)
            self.client.loop_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Shutting down...")
            self.client.disconnect()
        except Exception as e:
            print(f"❌ Error: {e}")
            sys.exit(1)


def test_bridge():
    """Test the bridge by publishing sample messages."""
    print("🧪 Testing MQTT Voice Bridge\n")

    test_client = mqtt.Client()

    try:
        test_client.connect(MQTT_BROKER, MQTT_PORT, 60)
        test_client.loop_start()

        print("Publishing test messages...\n")

        # Test message 1: Robo-Face
        msg1 = {
            "text": "Hello! How are your systems today?",
            "character": "robo-face",
            "sessionId": "test-1"
        }
        test_client.publish(MQTT_TOPIC_COMMAND, json.dumps(msg1))
        print(f"✓ Published: {msg1['text']}")
        time.sleep(3)

        # Test message 2: Cat-Face
        msg2 = {
            "text": "Do you want to play?",
            "character": "cat-face",
            "sessionId": "test-2"
        }
        test_client.publish(MQTT_TOPIC_COMMAND, json.dumps(msg2))
        print(f"✓ Published: {msg2['text']}")
        time.sleep(3)

        # Test message 3: Pixel-Friend
        msg3 = {
            "text": "Ready Player One!",
            "character": "pixel-friend",
            "sessionId": "test-3"
        }
        test_client.publish(MQTT_TOPIC_COMMAND, json.dumps(msg3))
        print(f"✓ Published: {msg3['text']}")

        time.sleep(2)
        test_client.loop_stop()
        test_client.disconnect()

        print("\n✓ Test completed! Check the bridge output.\n")

    except Exception as e:
        print(f"❌ Test failed: {e}")
        test_client.loop_stop()
        test_client.disconnect()


def subscribe_to_responses():
    """Subscribe to response topics and print responses."""
    print("📡 Subscribing to Voice Responses\n")

    client = mqtt.Client()

    def on_message(client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())

            if msg.topic == MQTT_TOPIC_RESPONSE:
                print(f"\n💬 Response from {payload['character']}:")
                print(f"   {payload['text']}")
                print(f"   Emotion: {payload['emotion']}")

            elif msg.topic == MQTT_TOPIC_EMOTION:
                print(f"\n😊 Emotion: {payload['emotion']} ({payload['character']})")

        except Exception as e:
            print(f"Error: {e}")

    client.on_message = on_message

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.subscribe(MQTT_TOPIC_RESPONSE)
        client.subscribe(MQTT_TOPIC_EMOTION)

        print(f"✓ Subscribed to {MQTT_TOPIC_RESPONSE}")
        print(f"✓ Subscribed to {MQTT_TOPIC_EMOTION}")
        print("\nWaiting for messages... (Ctrl+C to exit)\n")

        client.loop_forever()

    except KeyboardInterrupt:
        print("\n\n👋 Stopping...")
        client.disconnect()
    except Exception as e:
        print(f"❌ Error: {e}")


def main():
    """Main entry point."""
    if len(sys.argv) > 1:
        if sys.argv[1] == "--test":
            test_bridge()
        elif sys.argv[1] == "--listen":
            subscribe_to_responses()
        elif sys.argv[1] == "--help":
            print("Usage:")
            print("  python mqtt_voice_trigger.py          # Start bridge")
            print("  python mqtt_voice_trigger.py --test   # Send test messages")
            print("  python mqtt_voice_trigger.py --listen # Listen to responses")
            print("  python mqtt_voice_trigger.py --help   # Show this help")
            print("\nMQTT Topics:")
            print(f"  {MQTT_TOPIC_COMMAND} - Send voice commands")
            print(f"  {MQTT_TOPIC_RESPONSE} - Receive voice responses")
            print(f"  {MQTT_TOPIC_EMOTION} - Receive emotion changes")
        else:
            print(f"Unknown option: {sys.argv[1]}")
            print("Use --help for usage information")
    else:
        # Start bridge
        bridge = VoiceMQTTBridge()
        bridge.start()


if __name__ == "__main__":
    main()
