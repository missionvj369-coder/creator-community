# Quick Start: Living Creation Intelligence Preview

## What is This?

Living Creation Intelligence (LCI) is a complete system that:
- Analyzes your hardware and installed tools
- Matches open-source tools to your project needs
- Processes human intentions into structured project concepts
- Creates GitHub repositories with generated code

## Quick Start (3 Steps)

### Step 1: Start the Server

**Windows:**
```bash
start-preview.bat
```

**Mac/Linux:**
```bash
npx tsx src/api/server.ts
```

You should see:
```
🚀 LCI API Server running at http://localhost:3001

📡 Available endpoints:
   GET  /api/health              - Health check
   GET  /api/system              - System diagnostics
   GET  /api/tools               - List tools
   POST /api/tools/match         - Match tools to requirements
   POST /api/intention           - Process human intention
   GET  /api/github/auth         - Get GitHub OAuth URL
   POST /api/github/callback     - Exchange OAuth code
   POST /api/github/repo         - Create repository
   GET  /api/github/repos        - List repositories
   GET  /api/github/user         - Get authenticated user
```

### Step 2: Open the Web UI

Open your browser and go to:
```
http://localhost:3001
```

You'll see a beautiful interface with 4 tabs:
- 💭 **Intention** - Enter your project idea
- 💻 **System** - View your hardware capabilities
- 🛠️ **Tools** - Get tool recommendations
- 🐙 **GitHub** - Connect and create repos

### Step 3: Try It Out

**Example 1: Check Your System**
1. Click the "System" tab
2. See your CPU, RAM, GPU, storage, and installed tools

**Example 2: Get Tool Recommendations**
1. Click the "Tools" tab
2. Select a project type (e.g., "Web App")
3. See recommended tools with compatibility scores

**Example 3: Process an Intention**
1. Click the "Intention" tab
2. Enter a project idea:
   ```
   I want to create a system that helps reduce food waste in my community 
   by connecting people with surplus food to those who need it.
   ```
3. Click "Process Intention"
4. See the AI analysis with possibilities, challenges, and recommendations

**Example 4: Create a GitHub Repository**
1. Click the "GitHub" tab
2. Click "Connect with GitHub" (requires GitHub OAuth app setup)
3. Enter a repository name and description
4. Click "Create Repository"

## API Testing

You can also test the API directly with curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Get system info
curl http://localhost:3001/api/system

# Get recommended tools
curl "http://localhost:3001/api/tools?type=web-app"

# Process intention
curl -X POST http://localhost:3001/api/intention \
  -H "Content-Type: application/json" \
  -d "{\"intention\": \"I want to build a task management app\"}"
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web UI (index.html)                   │
│                   http://localhost:3001                  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              API Server (src/api/server.ts)              │
│                   Port 3001                              │
├─────────────────────────────────────────────────────────┤
│  Endpoints:                                             │
│  • /api/health      - Health check                      │
│  • /api/system      - System diagnostics                │
│  • /api/tools       - Tool discovery                    │
│  • /api/intention   - LCI pipeline                      │
│  • /api/github/*    - GitHub integration                │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    LCI Core Modules                      │
├─────────────────────────────────────────────────────────┤
│  • Device/System Diagnostics (Step 1)                   │
│  • Tool Discovery Engine (Step 2)                       │
│  • World Intelligence (Step 3)                          │
│  • Living Creation Loop (Step 4)                        │
│  • GitHub Integration (Step 5)                          │
└─────────────────────────────────────────────────────────┘
```

## Features Implemented

### ✅ Step 1: System Diagnostics
- Real hardware detection (CPU, RAM, GPU, storage)
- Runtime discovery (Python, Node.js, Docker, etc.)
- Tool installation verification
- System capability profiling

### ✅ Step 2: Tool Discovery Engine
- 14 production-ready open-source tools
- Smart matching with compatibility scoring
- Project-type-based recommendations
- Platform-specific installation instructions
- Launch script generation

### ✅ Step 3: World Intelligence
- Capability discovery and graph relationships
- Possibility generation for projects
- Discovery cache with TTL
- Tool-to-capability abstraction

### ✅ Step 4: Living Creation Loop
- 9-stage reasoning pipeline
- Challenge Engine (8 dimensions)
- Multi-dimensional evaluation
- Strength-based selection
- Transparent reasoning chain

### ✅ Step 5: GitHub Integration
- OAuth 2.0 authentication
- Repository creation (user & org)
- Batch file push using Git Trees API
- Project scaffolder with 3 templates
- Repository name sanitization

### ✅ Step 6: Frontend Integration
- Beautiful, responsive web UI
- Real-time system status
- Interactive tool recommendations
- GitHub OAuth flow
- Project generation interface

### ✅ Step 7: Memory & Learning
- Experience recording for every analysis
- Knowledge storage and retrieval
- Pattern extraction from recurring intentions
- Lesson generation from outcomes
- Improvement suggestions from past experiences
- File-based persistent storage

## File Structure

```
living-creation-intelligence/
├── src/
│   ├── api/
│   │   └── server.ts              # NEW: API server with all endpoints
│   ├── device/
│   │   └── system-diagnostics.ts  # Step 1: Hardware detection
│   ├── world/
│   │   └── tool-matrix.ts         # Step 2: 14 tools + matching engine
│   ├── github/
│   │   ├── service.ts             # Step 5: GitHub API client
│   │   └── project-scaffolder.ts  # Step 5: Project templates
│   ├── brain/
│   │   └── orchestrator.ts        # Step 4: Living creation loop
│   ├── memory/
│   │   ├── types.ts               # Step 7: Memory type definitions
│   │   ├── store.ts               # Step 7: File-based storage
│   │   └── manager.ts             # Step 7: Memory manager
│   └── ...
├── public/
│   └── index.html                 # NEW: Beautiful web UI
├── start-preview.bat              # NEW: Windows launch script
├── test-github-integration.ts     # Step 5 tests (8/8 passing)
├── test-tool-discovery.ts         # Step 2 tests (8/8 passing)
├── tests/
│   └── memory.test.ts             # Step 7 tests (14/14 passing)
└── STEP_*_*.md                   # Documentation for each step
```

## Troubleshooting

### Server won't start
- Make sure you have Node.js 18+ installed
- Run `npm install` to install dependencies
- Check if port 3001 is already in use

### Can't access web UI
- Make sure the API server is running
- Check browser console for errors
- Try `http://localhost:3001` (not 3000)

### GitHub OAuth not working
- You need to create a GitHub OAuth App
- Set callback URL to `http://localhost:3001/callback`
- Add Client ID and Secret to environment variables

### Tools not loading
- Check that the API server is running
- Open browser console to see errors
- Try refreshing the page

## Next Steps

The core LCI system is complete! You can now:

1. **Use it as-is**: Start the server and use the web UI
2. **Extend it**: Add more tools to the matrix
3. **Integrate it**: Use the API in your own projects
4. **Deploy it**: Put it on a server for team use

## Documentation

- `STEP_1_SYSTEM_DIAGNOSTICS.md` - System diagnostics details
- `STEP_2_TOOL_DISCOVERY.md` - Tool discovery engine
- `STEP_3_SUMMARY.md` - World intelligence
- `STEP_4_SUMMARY.md` - Living creation loop
- `STEP_5_GITHUB_INTEGRATION.md` - GitHub integration
- `STEP_7_MEMORY_LEARNING.md` - Memory & learning
- `README.md` - Project overview
- `ARCHITECTURE.md` - System architecture

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal where the server is running
3. Review the documentation in the STEP_* files
4. Run the test scripts to verify components

## Credits

Living Creation Intelligence - Universal Creation Intelligence
One brain, infinite capability paths.