#!/usr/bin/env python3
"""
GPIO Sensors Example
Triggers animations based on physical sensors
Requires: RPi.GPIO
"""

import requests
import time

try:
    import RPi.GPIO as GPIO
    GPIO_AVAILABLE = True
except ImportError:
    print("Warning: RPi.GPIO not available. Running in simulation mode.")
    GPIO_AVAILABLE = False

API_URL = 'http://localhost:3000/api/event'

# GPIO Pin Configuration
MOTION_SENSOR_PIN = 17
BUTTON_PIN = 27
LED_PIN = 22

def trigger_event(event_type):
    """Trigger an event via API"""
    try:
        response = requests.post(API_URL,
            json={'type': event_type},
            timeout=2
        )
        print(f"✓ Triggered: {event_type}")
        return response.json()
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def setup_gpio():
    """Initialize GPIO pins"""
    if not GPIO_AVAILABLE:
        return

    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)

    # Setup input pins
    GPIO.setup(MOTION_SENSOR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
    GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    # Setup output pins
    GPIO.setup(LED_PIN, GPIO.OUT)

    print("GPIO initialized")

def motion_callback(channel):
    """Handle motion sensor trigger"""
    print("Motion detected!")
    trigger_event('sensor.motion')

    # Blink LED
    if GPIO_AVAILABLE:
        GPIO.output(LED_PIN, GPIO.HIGH)
        time.sleep(0.5)
        GPIO.output(LED_PIN, GPIO.LOW)

def button_callback(channel):
    """Handle button press"""
    print("Button pressed!")
    trigger_event('sensor.button')

def main():
    print("GPIO Sensors Example")
    print("=" * 40)

    if not GPIO_AVAILABLE:
        print("Running in simulation mode")
        print("Press Ctrl+C to trigger simulated events")
        print()

        try:
            counter = 0
            while True:
                time.sleep(5)
                counter += 1

                if counter % 2 == 0:
                    print("Simulating motion detection...")
                    trigger_event('sensor.motion')
                else:
                    print("Simulating button press...")
                    trigger_event('sensor.button')

        except KeyboardInterrupt:
            print("\n\nStopped")
        return

    # Real GPIO mode
    setup_gpio()

    # Add event detection
    GPIO.add_event_detect(MOTION_SENSOR_PIN, GPIO.RISING,
        callback=motion_callback, bouncetime=2000)

    GPIO.add_event_detect(BUTTON_PIN, GPIO.FALLING,
        callback=button_callback, bouncetime=300)

    print("Monitoring sensors...")
    print(f"  Motion sensor: GPIO {MOTION_SENSOR_PIN}")
    print(f"  Button: GPIO {BUTTON_PIN}")
    print(f"  LED: GPIO {LED_PIN}")
    print("\nPress Ctrl+C to exit\n")

    try:
        # Startup indication
        trigger_event('system.boot')
        if GPIO_AVAILABLE:
            GPIO.output(LED_PIN, GPIO.HIGH)
            time.sleep(0.5)
            GPIO.output(LED_PIN, GPIO.LOW)

        # Main loop
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n\nCleaning up...")
        trigger_event('system.shutdown')

    finally:
        if GPIO_AVAILABLE:
            GPIO.cleanup()

if __name__ == '__main__':
    main()
