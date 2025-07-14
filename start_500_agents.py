#!/usr/bin/env python3
"""
Living Economy Arena - 500 Agent System Startup Script
Starts the 500 AI agent system and opens the UI automatically
"""

import subprocess
import threading
import time
import webbrowser
import sys
import os

def print_banner():
    print("""
🏛️  LIVING ECONOMY ARENA - 500 AI AGENT SYSTEM
================================================================

🤖 Real AI Agents: 500 agents with OpenRouter integration
💰 Cost: $0/month (using google/gemma-2-9b-it:free)
📊 Dashboard: Real-time visualization at http://localhost:8000
🔗 WebSocket: Live updates on ws://localhost:8765

================================================================
""")

def start_backend():
    """Start the 500 agent backend system"""
    print("🚀 Starting 500 AI agent backend system...")
    
    # Change to backend directory
    backend_dir = "/Users/greghogue/living-ecomony-arena/backend"
    os.chdir(backend_dir)
    
    # Start the 500 agent system
    process = subprocess.Popen([
        sys.executable, "scaled_economy_500.py"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Monitor output
    for line in iter(process.stdout.readline, ''):
        print(f"[BACKEND] {line.strip()}")
    
    return process

def start_frontend():
    """Start the visualization frontend"""
    print("🌐 Starting visualization frontend...")
    
    # Change to visualization directory
    viz_dir = "/Users/greghogue/living-ecomony-arena/visualization"
    os.chdir(viz_dir)
    
    # Start simple HTTP server for the visualization
    process = subprocess.Popen([
        sys.executable, "-m", "http.server", "8000"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Monitor output
    for line in iter(process.stdout.readline, ''):
        print(f"[FRONTEND] {line.strip()}")
    
    return process

def open_browser():
    """Open browser to the visualization after a delay"""
    print("⏳ Waiting for systems to start...")
    time.sleep(5)
    
    print("🌐 Opening browser to visualization...")
    webbrowser.open("http://localhost:8000")

def main():
    print_banner()
    
    try:
        # Start backend in a separate thread
        backend_thread = threading.Thread(target=start_backend, daemon=True)
        backend_thread.start()
        
        # Start frontend in a separate thread  
        frontend_thread = threading.Thread(target=start_frontend, daemon=True)
        frontend_thread.start()
        
        # Open browser after a delay
        browser_thread = threading.Thread(target=open_browser, daemon=True)
        browser_thread.start()
        
        print("✅ All systems started!")
        print("📊 Dashboard: http://localhost:8000")
        print("🔗 WebSocket: ws://localhost:8765")
        print("⏹️  Press Ctrl+C to stop all systems")
        
        # Keep main thread alive
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping all systems...")
            
    except Exception as e:
        print(f"❌ Error starting systems: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()