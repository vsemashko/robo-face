#!/bin/bash
# Emotion Demo Script
# Cycles through all emotions to demonstrate the robo-face

API_URL="http://localhost:3000/api/event"

emotions=(
    "idle:Calm and neutral"
    "happy:Cheerful and positive"
    "thinking:Processing and pondering"
    "alert:Warning and attention"
    "sad:Disappointed and down"
    "surprised:Shocked and amazed"
    "sleeping:Resting and inactive"
)

echo "🤖 Robo-Face Emotion Demo"
echo "========================="
echo ""

for emotion_info in "${emotions[@]}"; do
    IFS=':' read -r emotion description <<< "$emotion_info"

    echo "→ $emotion: $description"

    curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"type\":\"emotion\",\"value\":\"$emotion\",\"duration\":4000}" \
        > /dev/null

    sleep 5
done

echo ""
echo "✓ Demo complete!"
