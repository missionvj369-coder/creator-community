// LCI API Server
// Exposes LCI functionality via HTTP endpoints

import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { systemDiagnostics } from '../device/system-diagnostics';
import { toolDiscovery } from '../world/tool-matrix';
import { BrainOrchestrator, OrchestratorConfig } from '../brain/orchestrator';
import { GitHubService } from '../github/service';
import { ProjectScaffolder } from '../github/project-scaffolder';
import { DeviceProfiler } from '../device/profiler';
import { HumanProfiler } from '../human/profiler';
import { capabilityRegistry } from '../capabilities/registry';

const PORT = 3001;

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Initialize LCI components
const deviceProfiler = new DeviceProfiler();
const humanProfiler = new HumanProfiler();

async function createBrain(): Promise<BrainOrchestrator> {
  const deviceProfile = await deviceProfiler.profile();
  const humanProfile = humanProfiler.getProfile();
  
  const config: OrchestratorConfig = {
    capabilities: capabilityRegistry.getAll(),
    deviceProfile,
    humanProfile,
    enableGuardian: true,
    enableEvolution: true,
    enableMemory: true,
  };
  
  const brain = new BrainOrchestrator(config);
  await brain.initialize();
  return brain;
}

const brainPromise = createBrain();
const github = new GitHubService({
  clientId: process.env.GITHUB_CLIENT_ID || 'demo-client-id',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'demo-client-secret',
  redirectUri: 'http://localhost:3001/callback',
  scopes: ['repo', 'user'],
});
const scaffolder = new ProjectScaffolder(github);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const path = url.pathname;

  // Add CORS headers to all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log(`${req.method} ${path}`);

  try {
    // Health check
    if (path === '/api/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    // System diagnostics
    if (path === '/api/system' && req.method === 'GET') {
      const systemInfo = await systemDiagnostics.getSystemInfo();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(systemInfo));
      return;
    }

    // Tool discovery
    if (path === '/api/tools' && req.method === 'GET') {
      const projectType = url.searchParams.get('type') || 'web-app';
      const tools = toolDiscovery.getRecommendedTools(projectType as any);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ tools, count: tools.length }));
      return;
    }

    // Match tools
    if (path === '/api/tools/match' && req.method === 'POST') {
      const body = await getRequestBody(req);
      const requirements = body.requirements || {};
      const capabilities = body.capabilities || {};
      const matches = toolDiscovery.matchTools(requirements, capabilities);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ matches, count: matches.length }));
      return;
    }

    // Process intention (main LCI pipeline)
    if (path === '/api/intention' && req.method === 'POST') {
      const body = await getRequestBody(req);
      const intention = body.intention;
      
      if (!intention) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Intention is required' }));
        return;
      }

      console.log(`Processing intention: ${intention.substring(0, 50)}...`);
      const brain = await brainPromise;
      const result = await brain.processIntention(intention);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    // GitHub OAuth
    if (path === '/api/github/auth' && req.method === 'GET') {
      const state = url.searchParams.get('state') || undefined;
      const authUrl = github.getAuthUrl(state);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ authUrl }));
      return;
    }

    // GitHub OAuth callback
    if (path === '/api/github/callback' && req.method === 'POST') {
      const body = await getRequestBody(req);
      const code = body.code;
      
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Authorization code is required' }));
        return;
      }

      const token = await github.exchangeCode(code);
      const user = await github.getAuthenticatedUser();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ token, user }));
      return;
    }

    // Create GitHub repository
    if (path === '/api/github/repo' && req.method === 'POST') {
      const body = await getRequestBody(req);
      const { name, description, private: isPrivate, files } = body;
      
      if (!name) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Repository name is required' }));
        return;
      }

      let result;
      if (files && Array.isArray(files)) {
        result = await scaffolder.createProjectFromCode(
          name,
          description || 'Created with LCI',
          files,
          isPrivate || false
        );
      } else {
        const template = ProjectScaffolder.nodeJsTemplate(name);
        result = await scaffolder.scaffoldProject({
          projectName: name,
          description: description || 'Created with LCI',
          template,
          private: isPrivate || false,
        });
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    // List GitHub repositories
    if (path === '/api/github/repos' && req.method === 'GET') {
      const repos = await github.listRepositories(30, 1);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ repos, count: repos.length }));
      return;
    }

    // Get GitHub user
    if (path === '/api/github/user' && req.method === 'GET') {
      const user = await github.getAuthenticatedUser();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
      return;
    }

    // Serve static files from public directory
    if (!path.startsWith('/api/')) {
      const filePath = join(process.cwd(), 'public', path === '/' ? 'index.html' : path);
      const extname = '.' + String(filePath).split('.').pop();
      const contentType = mimeTypes[extname] || 'application/octet-stream';
      
      if (existsSync(filePath)) {
        const content = readFileSync(filePath);
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        res.end(content);
        return;
      }
    }

    // 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    console.error('API Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
});

// Helper to parse request body
function getRequestBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

server.listen(PORT, () => {
  console.log(`\n🚀 LCI API Server running at http://localhost:${PORT}`);
  console.log(`\n📡 Available endpoints:`);
  console.log(`   GET  /api/health              - Health check`);
  console.log(`   GET  /api/system              - System diagnostics`);
  console.log(`   GET  /api/tools               - List tools (type=general|web|ai|data)`);
  console.log(`   POST /api/tools/match         - Match tools to requirements`);
  console.log(`   POST /api/intention           - Process human intention`);
  console.log(`   GET  /api/github/auth         - Get GitHub OAuth URL`);
  console.log(`   POST /api/github/callback     - Exchange OAuth code`);
  console.log(`   POST /api/github/repo         - Create repository`);
  console.log(`   GET  /api/github/repos        - List repositories`);
  console.log(`   GET  /api/github/user         - Get authenticated user`);
  console.log(`\n💡 Try: curl http://localhost:${PORT}/api/health\n`);
});