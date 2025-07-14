#!/usr/bin/env python3
"""
Enhanced Start Script for Living Economy Arena
Starts the backend and opens the dashboard automatically
"""

import subprocess
import time
import webbrowser
import os
import signal
import sys
from pathlib import Path

def main():
    """Start the enhanced system and open dashboard"""
    print("🚀 Starting Enhanced Living Economy Arena")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    # Start the backend system
    print("📡 Starting Smart Adaptive System backend...")
    backend_process = subprocess.Popen([
        sys.executable, "smart_adaptive_system.py"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Wait for system to initialize
    print("⏳ Waiting for system initialization...")
    time.sleep(3)
    
    # Open the enhanced dashboard
    dashboard_path = Path(__file__).parent / "visualization" / "living_economy_dashboard.html"
    dashboard_url = f"file://{dashboard_path.absolute()}"
    
    print("🌐 Opening Enhanced Dashboard...")
    webbrowser.open(dashboard_url)
    
    print("\n✅ Enhanced Living Economy Arena is now running!")
    print(f"📊 Dashboard: {dashboard_url}")
    print("🔗 WebSocket: ws://localhost:8765")
    print("\n🎯 Features Active:")
    print("   • Rich Character Names & Personalities")
    print("   • Detailed Economic Stories with Real Impact")
    print("   • Responsive Dashboard Layout")
    print("   • Agent Relationships & Population Dynamics")
    print("   • Interactive Economic Scenarios")
    print("   • Dual-Tab Interface (World + Analytics)")
    print("\n💡 Use the World tab for immersive economic storytelling")
    print("📈 Use the Analytics tab for technical performance metrics")
    print("\nPress Ctrl+C to stop the system")
    
    try:
        # Keep script running and monitor backend
        while True:
            # Check if backend is still running
            poll = backend_process.poll()
            if poll is not None:
                print(f"\n❌ Backend process ended with code {poll}")
                break
            time.sleep(1)
    
    except KeyboardInterrupt:
        print("\n🛑 Shutting down Enhanced Living Economy Arena...")
        backend_process.terminate()
        try:
            backend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_process.kill()
        print("✅ System stopped gracefully")

if __name__ == "__main__":
    main()