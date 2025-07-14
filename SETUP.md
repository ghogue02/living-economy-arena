# 🚀 Setup Guide - Living Economy Arena

## Prerequisites

### System Requirements
- **Python 3.8+** (recommended: Python 3.10+)
- **4GB+ RAM** (for running 100 AI agents simultaneously)
- **Stable Internet Connection** (for AI API calls)
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)

### API Requirements
- **OpenRouter Account**: Sign up at [openrouter.ai](https://openrouter.ai)
- **API Credits**: $65+ recommended for sustained operation
- **API Key**: Generated from OpenRouter dashboard

## Quick Setup (5 Minutes)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/living-economy-arena.git
cd living-economy-arena
```

### 2. Install Dependencies
```bash
# Install required Python packages
pip install websockets openai httpx

# Or use requirements file
pip install -r requirements.txt
```

### 3. Configure API Key
```bash
# Edit the backend configuration file
nano backend/smart_adaptive_system.py

# Update line 44 with your OpenRouter API key:
API_KEY = "sk-or-v1-YOUR_API_KEY_HERE"
```

### 4. Launch System
```bash
# Automated start (recommended)
python start_enhanced_system.py

# Manual start
cd backend && python smart_adaptive_system.py
```

### 5. Open Dashboard
- Dashboard opens automatically with automated start
- Manual: Open `visualization/living_economy_dashboard.html` in browser
- URL: `file:///path/to/living-economy-arena/visualization/living_economy_dashboard.html`

## Detailed Configuration

### OpenRouter API Setup

1. **Create Account**
   - Visit [openrouter.ai](https://openrouter.ai)
   - Sign up with email/GitHub
   - Verify email address

2. **Add Credits**
   - Navigate to "Credits" section
   - Add $65+ for sustained operation
   - Ultra-cheap models cost $0.05-$0.10 per million tokens

3. **Generate API Key**
   - Go to "API Keys" section
   - Create new API key
   - Copy the key (starts with `sk-or-v1-`)

4. **Update Configuration**
   ```python
   # In backend/smart_adaptive_system.py line 44:
   API_KEY = "sk-or-v1-your-actual-api-key-here"
   ```

### System Configuration

#### Agent Count
```python
# In smart_adaptive_system.py line 606:
smart_system.create_agents(100)  # Change to desired count
```

#### Update Frequency
```python
# In smart_adaptive_system.py line 703:
return max(3.0, min(30.0, base_sleep))  # Adjust timing
```

#### WebSocket Port
```python
# In smart_adaptive_system.py line 905:
server = await websockets.serve(
    self.websocket_handler,
    "localhost",
    8765  # Change port if needed
)
```

## Troubleshooting

### Common Issues

#### API Key Errors
```
Error: Invalid API key
Solution: Check API key format and credits balance
```

#### WebSocket Connection Failed
```
Error: Connection refused on localhost:8765
Solution: Ensure backend is running before opening dashboard
```

#### Rate Limiting
```
Error: Rate limit exceeded
Solution: System has intelligent rate limiting, wait briefly
```

#### Memory Issues
```
Error: Out of memory
Solution: Reduce agent count in configuration
```

### Performance Optimization

#### For Low-End Systems
```python
# Reduce agent count
smart_system.create_agents(50)  # Instead of 100

# Increase sleep time
return max(5.0, min(45.0, base_sleep))  # Slower updates
```

#### For High-Performance Systems
```python
# Increase agent count
smart_system.create_agents(200)  # More agents

# Decrease sleep time
return max(1.0, min(15.0, base_sleep))  # Faster updates
```

## Verification

### System Health Check
1. **Backend Running**: Check console for "Starting Smart Adaptive System"
2. **WebSocket Active**: Look for "server listening on 127.0.0.1:8765"
3. **Dashboard Connected**: Status should show "Connected" in green
4. **AI Agents Active**: Should see agent stories appearing
5. **Economic Map**: Activity numbers should update regularly

### Expected Console Output
```
🧠 SMART ADAPTIVE SYSTEM - LIVING ECONOMY ARENA
======================================================================
2025-XX-XX XX:XX:XX,XXX - INFO - Smart Adaptive System initialized
2025-XX-XX XX:XX:XX,XXX - INFO - Created 100 smart adaptive agents
2025-XX-XX XX:XX:XX,XXX - INFO - Starting Smart Adaptive WebSocket server
2025-XX-XX XX:XX:XX,XXX - INFO - server listening on 127.0.0.1:8765
2025-XX-XX XX:XX:XX,XXX - INFO - Starting Smart Adaptive System decision engine
```

### Dashboard Verification
- **Connection Status**: Green "Connected" indicator
- **Agent Stories**: Character names and economic narratives appearing
- **Economic Map**: Sector tiles showing activity numbers
- **Real-Time Updates**: Timestamps updating every few seconds

## Development Setup

### For Developers

#### Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Development Dependencies
```bash
# Optional development tools
pip install pytest black flake8

# For testing
pytest backend/test_smart_adaptive_system.py

# For code formatting
black backend/smart_adaptive_system.py
```

#### Environment Variables (Optional)
```bash
# Create .env file for API key
echo "OPENROUTER_API_KEY=sk-or-v1-your-key" > .env

# Load in Python
import os
from dotenv import load_dotenv
load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")
```

## Security Notes

### API Key Security
- **Never commit API keys** to version control
- **Use environment variables** for production
- **Rotate keys regularly** for security
- **Monitor usage** to prevent unexpected charges

### Network Security
- **WebSocket runs locally** by default (localhost:8765)
- **No external network exposure** unless configured
- **Dashboard files are local** HTML/CSS/JS

## Support

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Documentation**: See `ENHANCED_FEATURES.md` for detailed info
- **OpenRouter Support**: For API-related issues

### Performance Monitoring
- **API Usage**: Monitor costs in OpenRouter dashboard
- **System Performance**: Check browser console for errors
- **Agent Activity**: Verify stories are updating regularly

---

🎉 **You're ready to experience the Enhanced Living Economy Arena!**

The system should now be running with compelling AI characters like Viktor Steelworth, Luna Quantum, and Margaret Sterling making real economic decisions with explicit consequences.