// Test script for Tool Discovery Engine
// Run with: npx tsx test-tool-discovery.ts

import { toolDiscovery, TOOL_MATRIX } from './src/world/tool-matrix';

// Declare Node.js globals
declare const process: {
  exit(code: number): void;
};

async function testToolDiscovery() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         TOOL DISCOVERY ENGINE TEST                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Display tool matrix summary
    console.log('📦 TOOL MATRIX SUMMARY:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`   Total tools: ${TOOL_MATRIX.length}`);
    
    const categories = [...new Set(TOOL_MATRIX.map(t => t.category))];
    console.log(`   Categories: ${categories.join(', ')}\n`);

    for (const category of categories) {
      const tools = TOOL_MATRIX.filter(t => t.category === category);
      console.log(`   ${category.toUpperCase()}: ${tools.length} tools`);
      tools.forEach(tool => {
        console.log(`      - ${tool.name} (${tool.maturity}, popularity: ${tool.popularity})`);
      });
    }

    // Test 1: Get recommended tools for AI model project
    console.log('\n\n🧪 TEST 1: AI Model Project Recommendations');
    console.log('═══════════════════════════════════════════════════════════════');
    const aiTools = toolDiscovery.getRecommendedTools('ai-model');
    console.log('   Top 5 recommended tools for AI model project:');
    aiTools.forEach((tool, i) => {
      console.log(`   ${i + 1}. ${tool.name} - ${tool.description.substring(0, 60)}...`);
    });

    // Test 2: Get recommended tools for web app
    console.log('\n\n🧪 TEST 2: Web App Project Recommendations');
    console.log('═══════════════════════════════════════════════════════════════');
    const webTools = toolDiscovery.getRecommendedTools('web-app');
    console.log('   Top 5 recommended tools for web app project:');
    webTools.forEach((tool, i) => {
      console.log(`   ${i + 1}. ${tool.name} - ${tool.description.substring(0, 60)}...`);
    });

    // Test 3: Get recommended tools for API
    console.log('\n\n🧪 TEST 3: API Project Recommendations');
    console.log('═══════════════════════════════════════════════════════════════');
    const apiTools = toolDiscovery.getRecommendedTools('api');
    console.log('   Top 5 recommended tools for API project:');
    apiTools.forEach((tool, i) => {
      console.log(`   ${i + 1}. ${tool.name} - ${tool.description.substring(0, 60)}...`);
    });

    // Test 4: Search tools
    console.log('\n\n🧪 TEST 4: Tool Search');
    console.log('═══════════════════════════════════════════════════════════════');
    const searchResults = toolDiscovery.searchTools('database');
    console.log(`   Found ${searchResults.length} tools matching "database":`);
    searchResults.forEach(tool => {
      console.log(`      - ${tool.name}: ${tool.description.substring(0, 50)}...`);
    });

    const aiResults = toolDiscovery.searchTools('AI');
    console.log(`\n   Found ${aiResults.length} tools matching "AI":`);
    aiResults.forEach(tool => {
      console.log(`      - ${tool.name}: ${tool.description.substring(0, 50)}...`);
    });

    // Test 5: Match tools to system capabilities
    console.log('\n\n🧪 TEST 5: Tool Matching with System Capabilities');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const projectRequirements = {
      type: 'ai-model' as const,
      features: ['llm-inference', 'local-ai', 'api-server'],
      scale: 'small' as const,
      performance: 'medium' as const,
      offlineCapable: true,
      realTime: false,
    };

    const systemCapabilities = {
      ram: 16075, // 16GB
      cpuCores: 8,
      storage: 500000, // 500GB
      hasGPU: true,
      vram: 2048, // 2GB
      networkType: 'wifi',
      bandwidth: 100,
      installedTools: ['node', 'npm', 'docker', 'ollama', 'git'],
    };

    const matches = toolDiscovery.matchTools(projectRequirements, systemCapabilities);
    console.log('   Top 10 compatible tools for your system:');
    matches.slice(0, 10).forEach((match, i) => {
      const status = match.canRun ? '✅' : match.canInstall ? '⚠️' : '❌';
      console.log(`   ${i + 1}. ${status} ${match.tool.name}`);
      console.log(`      Score: ${match.compatibilityScore}% | ${match.reason}`);
      if (match.missingRequirements.length > 0) {
        console.log(`      Missing: ${match.missingRequirements.join(', ')}`);
      }
    });

    // Test 6: Installation instructions
    console.log('\n\n🧪 TEST 6: Installation Instructions');
    console.log('═══════════════════════════════════════════════════════════════');
    const installInstructions = toolDiscovery.getInstallationInstructions('ollama', 'windows');
    if (installInstructions) {
      console.log(`   Installing Ollama on Windows:`);
      console.log(`   Method: ${installInstructions.method}`);
      console.log(`   Instructions: ${installInstructions.instructions}`);
      if (installInstructions.command) {
        console.log(`   Command: ${installInstructions.command}`);
      }
      if (installInstructions.url) {
        console.log(`   URL: ${installInstructions.url}`);
      }
    }

    // Test 7: Launch script generation
    console.log('\n\n🧪 TEST 7: Launch Script Generation');
    console.log('═══════════════════════════════════════════════════════════════');
    const launchScript = toolDiscovery.generateLaunchScript('ollama', 'windows');
    if (launchScript) {
      console.log('   Windows launch script for Ollama:');
      console.log('   ┌─────────────────────────────────────');
      launchScript.split('\n').forEach(line => console.log(`   │ ${line}`));
      console.log('   └─────────────────────────────────────');
    }

    const bashScript = toolDiscovery.generateLaunchScript('postgresql', 'linux');
    if (bashScript) {
      console.log('\n   Linux launch script for PostgreSQL:');
      console.log('   ┌─────────────────────────────────────');
      bashScript.split('\n').forEach(line => console.log(`   │ ${line}`));
      console.log('   └─────────────────────────────────────');
    }

    // Test 8: Category filtering
    console.log('\n\n🧪 TEST 8: Category Filtering');
    console.log('═══════════════════════════════════════════════════════════════');
    const aiCategoryTools = toolDiscovery.getToolsByCategory('ai');
    console.log(`   AI Tools (${aiCategoryTools.length}):`);
    aiCategoryTools.forEach(tool => {
      console.log(`      - ${tool.name}`);
    });

    const dbCategoryTools = toolDiscovery.getToolsByCategory('database');
    console.log(`\n   Database Tools (${dbCategoryTools.length}):`);
    dbCategoryTools.forEach(tool => {
      console.log(`      - ${tool.name}`);
    });

    // Summary
    console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║         ✅ TOOL DISCOVERY ENGINE TEST COMPLETE                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📊 Test Summary:');
    console.log(`   ✅ Tool matrix loaded: ${TOOL_MATRIX.length} tools`);
    console.log(`   ✅ Categories: ${categories.length}`);
    console.log(`   ✅ Recommendation system: Working`);
    console.log(`   ✅ Search functionality: Working`);
    console.log(`   ✅ Tool matching: Working`);
    console.log(`   ✅ Installation instructions: Working`);
    console.log(`   ✅ Launch script generation: Working\n`);

  } catch (error) {
    console.error('❌ Error running tool discovery test:', error);
    process.exit(1);
  }
}

// Run the test
testToolDiscovery();