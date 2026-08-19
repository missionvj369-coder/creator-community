// Open-Source Tool Discovery Engine
// Matches hardware capabilities to optimal tool combinations

export interface ToolRequirement {
  minRAM: number; // MB
  minCPU: number; // cores
  minStorage: number; // MB
  gpuRequired: boolean;
  minVRAM?: number; // MB
  networkRequired: boolean;
  minBandwidth?: number; // Mbps
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'ai' | 'development' | 'database' | 'container' | 'deployment' | 'monitoring';
  subcategory: string;
  homepage: string;
  repository: string;
  license: 'MIT' | 'Apache-2.0' | 'GPL-2.0' | 'GPL-3.0' | 'BSD-3' | 'SSPL' | 'PostgreSQL' | 'proprietary';
  requirements: ToolRequirement;
  capabilities: string[];
  installationMethods: InstallationMethod[];
  launchCommands: LaunchCommand[];
  alternatives: string[];
  popularity: number; // 0-100
  maturity: 'alpha' | 'beta' | 'stable' | 'mature';
  lastUpdated: string;
}

export interface InstallationMethod {
  platform: 'windows' | 'macos' | 'linux' | 'all';
  method: 'installer' | 'package-manager' | 'docker' | 'source' | 'binary';
  command?: string;
  url?: string;
  instructions: string;
}

export interface LaunchCommand {
  platform: 'windows' | 'macos' | 'linux' | 'all';
  command: string;
  description: string;
  args?: string[];
}

export interface ToolMatch {
  tool: ToolDefinition;
  compatibilityScore: number; // 0-100
  canInstall: boolean;
  canRun: boolean;
  missingRequirements: string[];
  recommended: boolean;
  reason: string;
}

export interface ProjectRequirements {
  type: 'web-app' | 'mobile-app' | 'desktop-app' | 'api' | 'ai-model' | 'data-analysis' | 'automation' | 'other';
  features: string[];
  scale: 'prototype' | 'small' | 'medium' | 'large' | 'enterprise';
  performance: 'low' | 'medium' | 'high' | 'maximum';
  offlineCapable: boolean;
  realTime: boolean;
}

// Comprehensive tool matrix
export const TOOL_MATRIX: ToolDefinition[] = [
  // AI/ML Tools
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Run LLMs locally with simple CLI. Supports Llama, Mistral, Gemma, and more.',
    category: 'ai',
    subcategory: 'llm-runtime',
    homepage: 'https://ollama.ai',
    repository: 'https://github.com/ollama/ollama',
    license: 'MIT',
    requirements: {
      minRAM: 4096,
      minCPU: 2,
      minStorage: 2048,
      gpuRequired: false,
      minVRAM: 2048,
      networkRequired: false,
    },
    capabilities: ['llm-inference', 'local-ai', 'model-management', 'api-server'],
    installationMethods: [
      {
        platform: 'all',
        method: 'installer',
        url: 'https://ollama.ai/download',
        instructions: 'Download and run installer from ollama.ai',
      },
      {
        platform: 'macos',
        method: 'package-manager',
        command: 'brew install ollama',
        instructions: 'Install via Homebrew',
      },
      {
        platform: 'linux',
        method: 'package-manager',
        command: 'curl -fsSL https://ollama.ai/install.sh | sh',
        instructions: 'Run official install script',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'ollama serve',
        description: 'Start Ollama server',
      },
      {
        platform: 'all',
        command: 'ollama run llama3.2',
        description: 'Run a specific model',
      },
    ],
    alternatives: ['lm-studio', 'llama.cpp', 'text-generation-webui'],
    popularity: 95,
    maturity: 'stable',
    lastUpdated: '2024-12-01',
  },
  {
    id: 'lm-studio',
    name: 'LM Studio',
    description: 'Desktop application for running local LLMs with GUI',
    category: 'ai',
    subcategory: 'llm-runtime',
    homepage: 'https://lmstudio.ai',
    repository: 'https://github.com/lmstudio-ai/lmstudio',
    license: 'MIT',
    requirements: {
      minRAM: 8192,
      minCPU: 4,
      minStorage: 4096,
      gpuRequired: false,
      minVRAM: 4096,
      networkRequired: false,
    },
    capabilities: ['llm-inference', 'gui', 'model-management', 'local-ai'],
    installationMethods: [
      {
        platform: 'all',
        method: 'installer',
        url: 'https://lmstudio.ai/download',
        instructions: 'Download from lmstudio.ai',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'lmstudio',
        description: 'Launch LM Studio GUI',
      },
    ],
    alternatives: ['ollama', 'llama.cpp'],
    popularity: 90,
    maturity: 'stable',
    lastUpdated: '2024-11-15',
  },
  {
    id: 'llama.cpp',
    name: 'llama.cpp',
    description: 'Portable LLM inference with minimal dependencies',
    category: 'ai',
    subcategory: 'llm-runtime',
    homepage: 'https://github.com/ggerganov/llama.cpp',
    repository: 'https://github.com/ggerganov/llama.cpp',
    license: 'MIT',
    requirements: {
      minRAM: 2048,
      minCPU: 2,
      minStorage: 1024,
      gpuRequired: false,
      networkRequired: false,
    },
    capabilities: ['llm-inference', 'local-ai', 'quantization', 'cross-platform'],
    installationMethods: [
      {
        platform: 'all',
        method: 'source',
        command: 'git clone https://github.com/ggerganov/llama.cpp && make',
        instructions: 'Build from source',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: './llama-cli -m model.gguf -p "Hello"',
        description: 'Run inference with model',
      },
    ],
    alternatives: ['ollama', 'lm-studio'],
    popularity: 85,
    maturity: 'stable',
    lastUpdated: '2024-12-05',
  },
  // Development Tools
  {
    id: 'bolt.diy',
    name: 'Bolt.diy',
    description: 'Open-source AI-powered web development environment',
    category: 'development',
    subcategory: 'ide',
    homepage: 'https://bolt.diy',
    repository: 'https://github.com/stackblitz/bolt.new',
    license: 'MIT',
    requirements: {
      minRAM: 4096,
      minCPU: 2,
      minStorage: 2048,
      gpuRequired: false,
      networkRequired: true,
      minBandwidth: 5,
    },
    capabilities: ['web-development', 'ai-assistant', 'code-generation', 'preview'],
    installationMethods: [
      {
        platform: 'all',
        method: 'docker',
        command: 'docker run -p 3000:3000 stackblitz/bolt.new',
        instructions: 'Run via Docker',
      },
      {
        platform: 'all',
        method: 'source',
        command: 'git clone https://github.com/stackblitz/bolt.new && npm install && npm run dev',
        instructions: 'Run from source',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'npm run dev',
        description: 'Start development server',
      },
    ],
    alternatives: ['dyad', 'appsmith', 'tooljet'],
    popularity: 88,
    maturity: 'beta',
    lastUpdated: '2024-11-20',
  },
  {
    id: 'dyad',
    name: 'Dyad',
    description: 'AI-powered app builder for creating full-stack applications',
    category: 'development',
    subcategory: 'app-builder',
    homepage: 'https://dyad.ai',
    repository: 'https://github.com/dyad-sh/dyad',
    license: 'MIT',
    requirements: {
      minRAM: 4096,
      minCPU: 2,
      minStorage: 2048,
      gpuRequired: false,
      networkRequired: true,
      minBandwidth: 5,
    },
    capabilities: ['app-generation', 'full-stack', 'ai-assisted', 'deployment'],
    installationMethods: [
      {
        platform: 'all',
        method: 'package-manager',
        command: 'npm install -g @dyad-sh/cli',
        instructions: 'Install via npm globally',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'dyad create my-app',
        description: 'Create new app',
      },
    ],
    alternatives: ['bolt.diy', 'appsmith', 'tooljet'],
    popularity: 82,
    maturity: 'beta',
    lastUpdated: '2024-10-15',
  },
  {
    id: 'appsmith',
    name: 'Appsmith',
    description: 'Open-source low-code platform for building internal tools',
    category: 'development',
    subcategory: 'low-code',
    homepage: 'https://www.appsmith.com',
    repository: 'https://github.com/appsmithorg/appsmith',
    license: 'Apache-2.0',
    requirements: {
      minRAM: 4096,
      minCPU: 2,
      minStorage: 4096,
      gpuRequired: false,
      networkRequired: false,
    },
    capabilities: ['low-code', 'ui-builder', 'data-sources', 'workflows'],
    installationMethods: [
      {
        platform: 'all',
        method: 'docker',
        command: 'docker run -d -p 80:80 -v $(pwd)/appsmith-data:/appsmith-stacks appsmith/appsmith-ce',
        instructions: 'Deploy with Docker',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'open http://localhost:80',
        description: 'Open Appsmith in browser',
      },
    ],
    alternatives: ['tooljet', 'budibase', 'retool'],
    popularity: 92,
    maturity: 'stable',
    lastUpdated: '2024-12-01',
  },
  {
    id: 'tooljet',
    name: 'ToolJet',
    description: 'Open-source low-code framework to build internal tools',
    category: 'development',
    subcategory: 'low-code',
    homepage: 'https://www.tooljet.com',
    repository: 'https://github.com/ToolJet/ToolJet',
    license: 'MIT',
    requirements: {
      minRAM: 4096,
      minCPU: 2,
      minStorage: 4096,
      gpuRequired: false,
      networkRequired: false,
    },
    capabilities: ['low-code', 'ui-builder', 'data-sources', 'integrations'],
    installationMethods: [
      {
        platform: 'all',
        method: 'docker',
        command: 'docker run -d -p 8080:8080 tooljet/tooljet-ce:latest',
        instructions: 'Deploy with Docker',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'open http://localhost:8080',
        description: 'Open ToolJet in browser',
      },
    ],
    alternatives: ['appsmith', 'budibase', 'retool'],
    popularity: 85,
    maturity: 'stable',
    lastUpdated: '2024-11-28',
  },
  // Database Tools
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    description: 'Advanced open-source relational database',
    category: 'database',
    subcategory: 'relational',
    homepage: 'https://www.postgresql.org',
    repository: 'https://github.com/postgres/postgres',
    license: 'PostgreSQL',
    requirements: {
      minRAM: 512,
      minCPU: 1,
      minStorage: 1024,
      gpuRequired: false,
      networkRequired: false,
    },
    capabilities: ['sql', 'acid', 'json', 'full-text-search', 'extensions'],
    installationMethods: [
      {
        platform: 'windows',
        method: 'installer',
        url: 'https://www.postgresql.org/download/windows/',
        instructions: 'Download installer',
      },
      {
        platform: 'macos',
        method: 'package-manager',
        command: 'brew install postgresql',
        instructions: 'Install via Homebrew',
      },
      {
        platform: 'linux',
        method: 'package-manager',
        command: 'sudo apt install postgresql',
        instructions: 'Install via apt',
      },
      {
        platform: 'all',
        method: 'docker',
        command: 'docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:latest',
        instructions: 'Run via Docker',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'pg_ctl start -D /usr/local/var/postgres',
        description: 'Start PostgreSQL server',
      },
    ],
    alternatives: ['mysql', 'mariadb', 'sqlite'],
    popularity: 98,
    maturity: 'mature',
    lastUpdated: '2024-11-15',
  },
  {
    id: 'mysql',
    name: 'MySQL',
    description: 'Popular open-source relational database',
    category: 'database',
    subcategory: 'relational',
    homepage: 'https://www.mysql.com',
    repository: 'https://github.com/mysql/mysql-server',
    license: 'GPL-2.0',
    requirements: {
      minRAM: 512,
      minCPU: 1,
      minStorage: 1024,
      gpuRequired: false,
      networkRequired: false,
    },
    capabilities: ['sql', 'acid', 'replication', 'clustering'],
    installationMethods: [
      {
        platform: 'all',
        method: 'installer',
        url: 'https://dev.mysql.com/downloads/mysql/',
        instructions: 'Download from mysql.com',
      },
      {
        platform: 'all',
        method: 'docker',
        command: 'docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password mysql:latest',
        instructions: 'Run via Docker',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'mysqld',
        description: 'Start MySQL server',
      },
    ],
    alternatives: ['postgresql', 'mariadb', 'sqlite'],
    popularity: 95,
    maturity: 'mature',
    lastUpdated: '2024-10-20',
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'Document-oriented NoSQL database',
    category: 'database',
    subcategory: 'nosql',
    homepage: 'https://www.mongodb.com',
    repository: 'https://github.com/mongodb/mongo',
    license: 'SSPL',
    requirements: {
      minRAM: 1024,
      minCPU: 2,
      minStorage: 2048,
      gpuRequired: false,
      networkRequired: false,
    },
    capabilities: ['nosql', 'document-store', 'aggregation', 'sharding'],
    installationMethods: [
      {
        platform: 'all',
        method: 'installer',
        url: 'https://www.mongodb.com/try/download/community',
        instructions: 'Download from mongodb.com',
      },
      {
        platform: 'all',
        method: 'docker',
        command: 'docker run -d -p 27017:27017 mongo:latest',
        instructions: 'Run via Docker',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'mongod',
        description: 'Start MongoDB server',
      },
    ],
    alternatives: ['postgresql', 'couchdb', 'firebase'],
    popularity: 90,
    maturity: 'mature',
    lastUpdated: '2024-11-01',
  },
  {
    id: 'redis',
    name: 'Redis',
    description: 'In-memory data structure store for caching and messaging',
    category: 'database',
    subcategory: 'key-value',
    homepage: 'https://redis.io',
    repository: 'https://github.com/redis/redis',
    license: 'BSD-3',
    requirements: {
      minRAM: 256,
      minCPU: 1,
      minStorage: 512,
      gpuRequired: false,
      networkRequired: false,
    },
    capabilities: ['cache', 'key-value', 'pub-sub', 'streams'],
    installationMethods: [
      {
        platform: 'windows',
        method: 'installer',
        url: 'https://github.com/microsoftarchive/redis/releases',
        instructions: 'Download Windows port',
      },
      {
        platform: 'macos',
        method: 'package-manager',
        command: 'brew install redis',
        instructions: 'Install via Homebrew',
      },
      {
        platform: 'linux',
        method: 'package-manager',
        command: 'sudo apt install redis-server',
        instructions: 'Install via apt',
      },
      {
        platform: 'all',
        method: 'docker',
        command: 'docker run -d -p 6379:6379 redis:latest',
        instructions: 'Run via Docker',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'redis-server',
        description: 'Start Redis server',
      },
    ],
    alternatives: ['memcached', 'keydb'],
    popularity: 93,
    maturity: 'mature',
    lastUpdated: '2024-11-10',
  },
  // Container Tools
  {
    id: 'docker',
    name: 'Docker',
    description: 'Platform for developing, shipping, and running applications in containers',
    category: 'container',
    subcategory: 'containerization',
    homepage: 'https://www.docker.com',
    repository: 'https://github.com/docker/docker-ce',
    license: 'Apache-2.0',
    requirements: {
      minRAM: 2048,
      minCPU: 2,
      minStorage: 4096,
      gpuRequired: false,
      networkRequired: false,
    },
    capabilities: ['containers', 'images', 'volumes', 'networking', 'orchestration'],
    installationMethods: [
      {
        platform: 'all',
        method: 'installer',
        url: 'https://docs.docker.com/get-docker/',
        instructions: 'Download Docker Desktop',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'docker run hello-world',
        description: 'Test Docker installation',
      },
    ],
    alternatives: ['podman', 'nerdctl', 'lxc'],
    popularity: 99,
    maturity: 'mature',
    lastUpdated: '2024-12-01',
  },
  // Deployment Tools
  {
    id: 'vercel-cli',
    name: 'Vercel CLI',
    description: 'Deploy web applications to Vercel edge network',
    category: 'deployment',
    subcategory: 'serverless',
    homepage: 'https://vercel.com',
    repository: 'https://github.com/vercel/vercel',
    license: 'MIT',
    requirements: {
      minRAM: 512,
      minCPU: 1,
      minStorage: 512,
      gpuRequired: false,
      networkRequired: true,
      minBandwidth: 5,
    },
    capabilities: ['deployment', 'serverless', 'edge-functions', 'previews'],
    installationMethods: [
      {
        platform: 'all',
        method: 'package-manager',
        command: 'npm install -g vercel',
        instructions: 'Install via npm',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'vercel',
        description: 'Deploy current directory',
      },
    ],
    alternatives: ['netlify-cli', 'aws-cli', 'gcloud'],
    popularity: 90,
    maturity: 'stable',
    lastUpdated: '2024-11-25',
  },
  // Monitoring Tools
  {
    id: 'prometheus',
    name: 'Prometheus',
    description: 'Open-source monitoring and alerting toolkit',
    category: 'monitoring',
    subcategory: 'metrics',
    homepage: 'https://prometheus.io',
    repository: 'https://github.com/prometheus/prometheus',
    license: 'Apache-2.0',
    requirements: {
      minRAM: 1024,
      minCPU: 2,
      minStorage: 2048,
      gpuRequired: false,
      networkRequired: false,
    },
    capabilities: ['metrics', 'monitoring', 'alerting', 'time-series'],
    installationMethods: [
      {
        platform: 'all',
        method: 'docker',
        command: 'docker run -d -p 9090:9090 prom/prometheus',
        instructions: 'Run via Docker',
      },
    ],
    launchCommands: [
      {
        platform: 'all',
        command: 'prometheus --config.file=prometheus.yml',
        description: 'Start Prometheus server',
      },
    ],
    alternatives: ['grafana', 'datadog', 'newrelic'],
    popularity: 92,
    maturity: 'stable',
    lastUpdated: '2024-11-18',
  },
];

export class ToolDiscoveryEngine {
  private toolMatrix: Map<string, ToolDefinition> = new Map();

  constructor() {
    // Index tools by ID
    for (const tool of TOOL_MATRIX) {
      this.toolMatrix.set(tool.id, tool);
    }
  }

  /**
   * Match tools to project requirements and system capabilities
   */
  matchTools(
    projectRequirements: ProjectRequirements,
    systemCapabilities: {
      ram: number;
      cpuCores: number;
      storage: number;
      hasGPU: boolean;
      vram?: number;
      networkType: string;
      bandwidth?: number;
      installedTools: string[];
    }
  ): ToolMatch[] {
    const matches: ToolMatch[] = [];

    for (const tool of TOOL_MATRIX) {
      const match = this.evaluateToolMatch(tool, projectRequirements, systemCapabilities);
      matches.push(match);
    }

    // Sort by compatibility score (descending)
    return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  /**
   * Get recommended tools for a specific project type
   */
  getRecommendedTools(projectType: ProjectRequirements['type']): ToolDefinition[] {
    const recommendations: { tool: ToolDefinition; score: number }[] = [];

    for (const tool of TOOL_MATRIX) {
      let score = 0;

      // Score based on project type relevance
      switch (projectType) {
        case 'web-app':
          if (tool.capabilities.includes('web-development') || tool.capabilities.includes('deployment')) {
            score += 50;
          }
          if (tool.id === 'appsmith' || tool.id === 'tooljet') score += 30;
          if (tool.id === 'vercel-cli') score += 20;
          break;
        case 'ai-model':
          if (tool.category === 'ai') score += 50;
          if (tool.capabilities.includes('llm-inference')) score += 30;
          if (tool.id === 'ollama') score += 20;
          break;
        case 'api':
          if (tool.id === 'postgresql' || tool.id === 'mongodb') score += 40;
          if (tool.id === 'docker') score += 20;
          break;
        case 'data-analysis':
          if (tool.id === 'postgresql' || tool.id === 'mongodb') score += 30;
          if (tool.id === 'redis') score += 20;
          break;
      }

      // Bonus for popularity and maturity
      score += (tool.popularity / 100) * 20;
      if (tool.maturity === 'stable' || tool.maturity === 'mature') score += 10;

      if (score > 0) {
        recommendations.push({ tool, score });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(r => r.tool);
  }

  /**
   * Check if a specific tool is installed
   */
  isToolInstalled(toolId: string, installedTools: string[]): boolean {
    const tool = this.toolMatrix.get(toolId);
    if (!tool) return false;

    // Check common command names
    const commands = tool.launchCommands.map(lc => lc.command.split(' ')[0]);
    return commands.some(cmd => installedTools.includes(cmd));
  }

  /**
   * Get installation instructions for a tool
   */
  getInstallationInstructions(
    toolId: string,
    platform: 'windows' | 'macos' | 'linux'
  ): InstallationMethod | null {
    const tool = this.toolMatrix.get(toolId);
    if (!tool) return null;

    // Find best installation method for platform
    const platformMethod = tool.installationMethods.find(m => m.platform === platform || m.platform === 'all');
    if (platformMethod) return platformMethod;

    // Fallback to first available method
    return tool.installationMethods[0] || null;
  }

  /**
   * Generate launch script for a tool
   */
  generateLaunchScript(toolId: string, platform: 'windows' | 'macos' | 'linux'): string | null {
    const tool = this.toolMatrix.get(toolId);
    if (!tool) return null;

    const launchCmd = tool.launchCommands.find(lc => lc.platform === platform || lc.platform === 'all');
    if (!launchCmd) return null;

    if (platform === 'windows') {
      return `@echo off\n${launchCmd.command} ${launchCmd.args?.join(' ') || ''}`;
    } else {
      return `#!/bin/bash\n${launchCmd.command} ${launchCmd.args?.join(' ') || ''}`;
    }
  }

  /**
   * Get all tools in a category
   */
  getToolsByCategory(category: ToolDefinition['category']): ToolDefinition[] {
    return TOOL_MATRIX.filter(t => t.category === category);
  }

  /**
   * Search tools by keyword
   */
  searchTools(query: string): ToolDefinition[] {
    const lowerQuery = query.toLowerCase();
    return TOOL_MATRIX.filter(
      t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.capabilities.some(c => c.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Evaluate how well a tool matches requirements
   */
  private evaluateToolMatch(
    tool: ToolDefinition,
    project: ProjectRequirements,
    system: {
      ram: number;
      cpuCores: number;
      storage: number;
      hasGPU: boolean;
      vram?: number;
      networkType: string;
      bandwidth?: number;
      installedTools: string[];
    }
  ): ToolMatch {
    const req = tool.requirements;
    const missingRequirements: string[] = [];
    let score = 100;

    // Check RAM
    if (system.ram < req.minRAM) {
      missingRequirements.push(`RAM: need ${req.minRAM}MB, have ${system.ram}MB`);
      score -= 30;
    }

    // Check CPU
    if (system.cpuCores < req.minCPU) {
      missingRequirements.push(`CPU: need ${req.minCPU} cores, have ${system.cpuCores}`);
      score -= 20;
    }

    // Check Storage
    if (system.storage < req.minStorage) {
      missingRequirements.push(`Storage: need ${req.minStorage}MB, have ${system.storage}MB`);
      score -= 15;
    }

    // Check GPU
    if (req.gpuRequired && !system.hasGPU) {
      missingRequirements.push('GPU required but not detected');
      score -= 40;
    }

    // Check VRAM
    if (req.minVRAM && system.vram && system.vram < req.minVRAM) {
      missingRequirements.push(`VRAM: need ${req.minVRAM}MB, have ${system.vram}MB`);
      score -= 25;
    }

    // Check Network
    if (req.networkRequired && system.networkType === 'unknown') {
      missingRequirements.push('Network connection required');
      score -= 20;
    }

    // Check bandwidth
    if (req.minBandwidth && system.bandwidth && system.bandwidth < req.minBandwidth) {
      missingRequirements.push(`Bandwidth: need ${req.minBandwidth}Mbps, have ${system.bandwidth}Mbps`);
      score -= 15;
    }

    // Check if already installed
    const isInstalled = this.isToolInstalled(tool.id, system.installedTools);
    const canInstall = missingRequirements.length === 0;
    const canRun = isInstalled && missingRequirements.length === 0;

    // Determine if recommended
    const recommended = score >= 70 && (tool.maturity === 'stable' || tool.maturity === 'mature');

    // Generate reason
    let reason = '';
    if (isInstalled) {
      reason = 'Already installed and compatible';
    } else if (canInstall) {
      reason = `Compatible with your system (${tool.maturity})`;
    } else {
      reason = `Missing requirements: ${missingRequirements[0]}`;
    }

    return {
      tool,
      compatibilityScore: Math.max(0, score),
      canInstall,
      canRun,
      missingRequirements,
      recommended,
      reason,
    };
  }
}

// Singleton instance
export const toolDiscovery = new ToolDiscoveryEngine();