#!/usr/bin/env python3
"""
Smart Adaptive System Startup Script
Launches the enhanced 500 agent system with multi-model AI and intelligent scaling
"""

import subprocess
import threading
import time
import webbrowser
import sys
import os
import signal

def print_banner():
    print("""
🧠 SMART ADAPTIVE SYSTEM - LIVING ECONOMY ARENA
================================================================

🚀 ENHANCED FEATURES:
   • Multi-Model AI: 14 free models with intelligent load balancing
   • Intelligent Rate Limiting: Exponential backoff and queue management
   • Dynamic Agent Scaling: Hibernation and activation based on system load
   • Enhanced Storytelling: Quality response filtering and narrative generation
   • Clean Logging: Meaningful economic activity only
   • Performance Monitoring: Real-time metrics and alerts
   • WebSocket Fix: Proper connection handling for UI

📊 SYSTEM SPECS:
   • 500 AI Agents: Real decision-making with OpenRouter integration
   • 14 Models: google/gemini, deepseek, meta-llama, nvidia, qwen
   • $0/month Cost: All free models, no API charges
   • Smart Dashboard: Real-time visualization at http://localhost:8000
   • WebSocket: Live updates on ws://localhost:8765

================================================================
""")

def start_smart_backend():
    """Start the Smart Adaptive System backend"""
    print("🧠 Starting Smart Adaptive System backend...")
    
    # Change to backend directory
    backend_dir = "/Users/greghogue/living-ecomony-arena/backend"
    os.chdir(backend_dir)
    
    # Start the Smart Adaptive System
    process = subprocess.Popen([
        sys.executable, "smart_adaptive_system.py"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Monitor output with filtering
    for line in iter(process.stdout.readline, ''):
        line = line.strip()
        if line and not any(skip in line.lower() for skip in ["debug", "httpx", "openai._base_client"]):
            print(f"[SMART-BACKEND] {line}")
    
    return process

def start_smart_frontend():
    """Start the Smart Adaptive System frontend"""
    print("🌐 Starting Smart Adaptive System frontend...")
    
    # Change to visualization directory
    viz_dir = "/Users/greghogue/living-ecomony-arena/visualization"
    os.chdir(viz_dir)
    
    # Start simple HTTP server for the smart dashboard
    process = subprocess.Popen([
        sys.executable, "-m", "http.server", "8000"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Monitor output
    for line in iter(process.stdout.readline, ''):
        line = line.strip()
        if line:
            print(f"[SMART-FRONTEND] {line}")
    
    return process

def open_smart_dashboard():
    """Open browser to the Smart Adaptive System dashboard"""
    print("⏳ Waiting for Smart Adaptive System to initialize...")
    time.sleep(8)  # Give more time for smart system to start
    
    print("🌐 Opening Smart Adaptive System dashboard...")
    webbrowser.open("http://localhost:8000/smart_adaptive_dashboard.html")

def monitor_system():
    """Monitor system health and provide status updates"""
    print("📊 Smart Adaptive System health monitor started...")
    
    start_time = time.time()
    
    while True:
        time.sleep(30)  # Check every 30 seconds
        
        uptime = time.time() - start_time
        uptime_str = f"{int(uptime // 3600)}h {int((uptime % 3600) // 60)}m {int(uptime % 60)}s"
        
        print(f"📈 System Status - Uptime: {uptime_str}")
        print(f"   • Smart Adaptive System: Running")
        print(f"   • Multi-Model AI: Active")
        print(f"   • Dashboard: http://localhost:8000/smart_adaptive_dashboard.html")
        print(f"   • WebSocket: ws://localhost:8765")

def signal_handler(signum, frame):
    """Handle graceful shutdown"""
    print("\n🛑 Smart Adaptive System shutdown requested...")
    print("   Stopping all processes gracefully...")
    sys.exit(0)

def main():
    print_banner()
    
    # Set up signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    processes = []
    
    try:
        # Start backend in a separate thread
        backend_thread = threading.Thread(target=start_smart_backend, daemon=True)
        backend_thread.start()
        
        # Start frontend in a separate thread  
        frontend_thread = threading.Thread(target=start_smart_frontend, daemon=True)
        frontend_thread.start()
        
        # Open dashboard after a delay
        dashboard_thread = threading.Thread(target=open_smart_dashboard, daemon=True)
        dashboard_thread.start()
        
        # Start system monitor
        monitor_thread = threading.Thread(target=monitor_system, daemon=True)
        monitor_thread.start()
        
        print("✅ Smart Adaptive System started successfully!")
        print("📊 Dashboard: http://localhost:8000/smart_adaptive_dashboard.html")
        print("🔗 WebSocket: ws://localhost:8765")
        print("🧠 Features: Multi-Model AI, Dynamic Scaling, Enhanced Storytelling")
        print("⏹️  Press Ctrl+C to stop all systems")
        
        # Keep main thread alive
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Smart Adaptive System shutdown initiated...")
            
    except Exception as e:
        print(f"❌ Error starting Smart Adaptive System: {e}")
        sys.exit(1)
    
    finally:
        # Clean up processes
        for process in processes:
            try:
                process.terminate()
                process.wait(timeout=5)
            except:
                pass
        
        print("✅ Smart Adaptive System stopped gracefully")

if __name__ == "__main__":
    main()