#!/bin/bash
# MQTT Publisher Example
# Publishes emotions to MQTT topic
# Requires: mosquitto-clients

BROKER="localhost"
TOPIC="robo-face/event"

if ! command -v mosquitto_pub &> /dev/null; then
    echo "Error: mosquitto_pub not found"
    echo "Install with: sudo apt install mosquitto-clients"
    exit 1
fi

echo "MQTT Emotion Publisher"
echo "======================"
echo "Broker: $BROKER"
echo "Topic: $TOPIC"
echo ""

# Example 1: Trigger happy emotion
echo "→ Publishing happy emotion..."
mosquitto_pub -h "$BROKER" -t "$TOPIC" \
    -m '{"type":"emotion","value":"happy","duration":5000}'

sleep 2

# Example 2: System boot event
echo "→ Publishing system boot..."
mosquitto_pub -h "$BROKER" -t "$TOPIC" \
    -m '{"type":"system.boot"}'

sleep 2

# Example 3: Alert notification
echo "→ Publishing alert..."
mosquitto_pub -h "$BROKER" -t "$TOPIC" \
    -m '{"type":"notification.alert","duration":8000}'

echo ""
echo "✓ Published 3 events"
