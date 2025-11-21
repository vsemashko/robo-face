#!/usr/bin/env python3
"""
Python Voice Chat Example

This example shows how to interact with the Robo-Face voice API
using Python. It demonstrates sending text to the character and
receiving voice responses.

Requirements:
    pip install requests

Usage:
    python python_voice_chat.py
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:3000"
CHARACTER = "robo-face"  # robo-face, cat-face, or pixel-friend
SESSION_ID = "python-session"


def chat(text, character=CHARACTER, session_id=SESSION_ID):
    """
    Send a message to the character and get a response.

    Args:
        text: The message to send
        character: Which character to talk to
        session_id: Session ID for conversation history

    Returns:
        Response dictionary with text, emotion, and voice settings
    """
    url = f"{BASE_URL}/api/voice/chat"

    payload = {
        "text": text,
        "character": character,
        "sessionId": session_id
    }

    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None


def clear_history(session_id=SESSION_ID):
    """Clear the conversation history."""
    url = f"{BASE_URL}/api/voice/clear"

    payload = {"sessionId": session_id}

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print("✓ Conversation history cleared")

    except requests.exceptions.RequestException as e:
        print(f"Error clearing history: {e}")


def get_history(session_id=SESSION_ID):
    """Get the conversation history."""
    url = f"{BASE_URL}/api/voice/history/{session_id}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()["history"]

    except requests.exceptions.RequestException as e:
        print(f"Error getting history: {e}")
        return []


def check_voice_enabled():
    """Check if voice plugin is enabled."""
    url = f"{BASE_URL}/api/health"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return data.get("voiceEnabled", False)

    except requests.exceptions.RequestException as e:
        print(f"Error checking health: {e}")
        return False


def interactive_mode():
    """Run an interactive chat session."""
    print("🤖 Robo-Face Voice Chat (Python)")
    print(f"Character: {CHARACTER}")
    print(f"Session: {SESSION_ID}")
    print("\nCommands:")
    print("  /clear - Clear conversation history")
    print("  /history - Show conversation history")
    print("  /character <name> - Switch character")
    print("  /quit - Exit")
    print("\nType your message and press Enter:\n")

    current_character = CHARACTER

    while True:
        try:
            user_input = input("You: ").strip()

            if not user_input:
                continue

            # Handle commands
            if user_input.startswith("/"):
                cmd = user_input.split()[0]

                if cmd == "/quit":
                    print("Goodbye!")
                    break

                elif cmd == "/clear":
                    clear_history()
                    continue

                elif cmd == "/history":
                    history = get_history()
                    print("\n--- Conversation History ---")
                    for msg in history:
                        role = "You" if msg["role"] == "user" else current_character
                        print(f"{role}: {msg['content']}")
                    print("----------------------------\n")
                    continue

                elif cmd == "/character":
                    if len(user_input.split()) > 1:
                        current_character = user_input.split()[1]
                        print(f"✓ Switched to {current_character}")
                    else:
                        print("Usage: /character <name>")
                    continue

                else:
                    print(f"Unknown command: {cmd}")
                    continue

            # Send message
            response = chat(user_input, current_character)

            if response:
                print(f"{current_character}: {response['text']}")
                print(f"[Emotion: {response['emotion']}]\n")
            else:
                print("Error: Failed to get response\n")

        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {e}\n")


def example_conversations():
    """Run some example conversations."""
    print("🤖 Running Example Conversations\n")

    # Example 1: Talk to Robo-Face
    print("--- Robo-Face Conversation ---")
    response = chat("Hello! How are you today?", "robo-face")
    if response:
        print(f"You: Hello! How are you today?")
        print(f"Robo-Face: {response['text']}")
        print(f"Emotion: {response['emotion']}\n")

    # Example 2: Talk to Cat-Face
    print("--- Cat-Face Conversation ---")
    clear_history("cat-session")
    response = chat("Do you want to play?", "cat-face", "cat-session")
    if response:
        print(f"You: Do you want to play?")
        print(f"Cat-Face: {response['text']}")
        print(f"Emotion: {response['emotion']}\n")

    # Example 3: Talk to Pixel-Friend
    print("--- Pixel-Friend Conversation ---")
    clear_history("pixel-session")
    response = chat("What's your favorite video game?", "pixel-friend", "pixel-session")
    if response:
        print(f"You: What's your favorite video game?")
        print(f"Pixel-Friend: {response['text']}")
        print(f"Emotion: {response['emotion']}\n")


def main():
    """Main entry point."""
    # Check if voice is enabled
    if not check_voice_enabled():
        print("❌ Error: Voice plugin is not enabled on the server")
        print("\nTo enable voice:")
        print("1. Edit .env file")
        print("2. Set VOICE_ENABLED=true")
        print("3. Set VOICE_LLM_PROVIDER=openai (or anthropic/ollama)")
        print("4. Add your API key")
        print("5. Restart the server")
        sys.exit(1)

    print("✓ Voice plugin is enabled\n")

    # Check command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "--examples":
            example_conversations()
        elif sys.argv[1] == "--help":
            print("Usage:")
            print("  python python_voice_chat.py           # Interactive mode")
            print("  python python_voice_chat.py --examples  # Run examples")
            print("  python python_voice_chat.py --help     # Show this help")
        else:
            print(f"Unknown option: {sys.argv[1]}")
            print("Use --help for usage information")
    else:
        # Interactive mode
        interactive_mode()


if __name__ == "__main__":
    main()
