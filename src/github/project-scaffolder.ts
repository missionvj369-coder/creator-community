// GitHub Project Scaffolder
// Creates repositories from project templates and pushes generated code

import { GitHubService, CreateRepoOptions, PushOptions } from './service';

export interface ProjectTemplate {
  name: string;
  description: string;
  files: TemplateFile[];
  gitignoreTemplate?: string;
  licenseTemplate?: string;
}

export interface TemplateFile {
  path: string;
  content: string;
  message: string;
}

export interface ScaffoldOptions {
  projectName: string;
  description: string;
  template: ProjectTemplate;
  private: boolean;
  owner?: string; // If not provided, uses authenticated user
}

export class ProjectScaffolder {
  private github: GitHubService;

  constructor(github: GitHubService) {
    this.github = github;
  }

  /**
   * Scaffold a new project from template
   */
  async scaffoldProject(options: ScaffoldOptions): Promise<{
    repo: { fullName: string; htmlUrl: string };
    filesPushed: number;
  }> {
    // Create repository
    const repo = await this.github.createRepository({
      name: this.sanitizeRepoName(options.projectName),
      description: options.description,
      private: options.private,
      autoInit: false, // We'll push files manually
      gitignoreTemplate: options.template.gitignoreTemplate,
      licenseTemplate: options.template.licenseTemplate,
    });

    // Push template files
    const pushOptions: PushOptions = {
      owner: options.owner || (await this.github.getAuthenticatedUser()).login,
      repo: repo.name,
      branch: 'main',
      files: options.template.files.map(file => ({
        path: file.path,
        content: file.content,
        message: file.message,
      })),
    };

    await this.github.pushFiles(pushOptions);

    return {
      repo: {
        fullName: repo.fullName,
        htmlUrl: repo.htmlUrl,
      },
      filesPushed: options.template.files.length,
    };
  }

  /**
   * Create a project from generated code
   */
  async createProjectFromCode(
    projectName: string,
    description: string,
    files: Array<{ path: string; content: string }>,
    isPrivate: boolean
  ): Promise<{
    repo: { fullName: string; htmlUrl: string };
    filesPushed: number;
  }> {
    // Create repository
    const repo = await this.github.createRepository({
      name: this.sanitizeRepoName(projectName),
      description,
      private: isPrivate,
      autoInit: false,
    });

    // Push generated files
    const pushOptions: PushOptions = {
      owner: (await this.github.getAuthenticatedUser()).login,
      repo: repo.name,
      branch: 'main',
      files: files.map(file => ({
        path: file.path,
        content: file.content,
        message: `Add ${file.path}`,
      })),
    };

    await this.github.pushFiles(pushOptions);

    return {
      repo: {
        fullName: repo.fullName,
        htmlUrl: repo.htmlUrl,
      },
      filesPushed: files.length,
    };
  }

  /**
   * Add files to existing repository
   */
  async addFilesToRepo(
    owner: string,
    repo: string,
    files: Array<{ path: string; content: string; message: string }>
  ): Promise<number> {
    for (const file of files) {
      await this.github.pushFile(
        owner,
        repo,
        file.path,
        file.content,
        file.message
      );
    }

    return files.length;
  }

  /**
   * Update existing file in repository
   */
  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch?: string
  ): Promise<void> {
    await this.github.pushFile(owner, repo, path, content, message, branch);
  }

  // Pre-defined templates

  /**
   * Basic Node.js project template
   */
  static nodeJsTemplate(projectName: string): ProjectTemplate {
    return {
      name: 'Node.js Project',
      description: 'Basic Node.js project with TypeScript',
      gitignoreTemplate: 'Node',
      licenseTemplate: 'mit',
      files: [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: projectName.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            description: projectName,
            main: 'dist/index.js',
            scripts: {
              build: 'tsc',
              start: 'node dist/index.js',
              dev: 'tsx src/index.ts',
            },
            dependencies: {},
            devDependencies: {
              typescript: '^5.3.0',
              tsx: '^4.7.0',
              '@types/node': '^20.0.0',
            },
          }, null, 2),
          message: 'Add package.json',
        },
        {
          path: 'tsconfig.json',
          content: JSON.stringify({
            compilerOptions: {
              target: 'ES2020',
              module: 'commonjs',
              lib: ['ES2020'],
              outDir: './dist',
              rootDir: './src',
              strict: true,
              esModuleInterop: true,
              skipLibCheck: true,
              forceConsistentCasingInFileNames: true,
              resolveJsonModule: true,
            },
            include: ['src/**/*'],
            exclude: ['node_modules', 'dist'],
          }, null, 2),
          message: 'Add TypeScript configuration',
        },
        {
          path: 'src/index.ts',
          content: `// ${projectName}
// Created with Living Creation Intelligence

function main() {
  console.log('Hello from ${projectName}!');
}

main();
`,
          message: 'Add main entry point',
        },
        {
          path: 'README.md',
          content: `# ${projectName}

## Description
${projectName}

## Setup
\`\`\`bash
npm install
npm run dev
\`\`\`

## License
MIT
`,
          message: 'Add README',
        },
      ],
    };
  }

  /**
   * Basic Python project template
   */
  static pythonTemplate(projectName: string): ProjectTemplate {
    const moduleName = projectName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    return {
      name: 'Python Project',
      description: 'Basic Python project',
      gitignoreTemplate: 'Python',
      licenseTemplate: 'mit',
      files: [
        {
          path: 'requirements.txt',
          content: '# Add your dependencies here\n',
          message: 'Add requirements.txt',
        },
        {
          path: `${moduleName}/__init__.py`,
          content: `"""${projectName} - Created with Living Creation Intelligence"""\n`,
          message: 'Add package init',
        },
        {
          path: `${moduleName}/main.py`,
          content: `#!/usr/bin/env python3
"""${projectName} - Main entry point"""

def main():
    print("Hello from ${projectName}!")

if __name__ == "__main__":
    main()
`,
          message: 'Add main module',
        },
        {
          path: 'README.md',
          content: `# ${projectName}

## Description
${projectName}

## Setup
\`\`\`bash
pip install -r requirements.txt
python -m ${moduleName}.main
\`\`\`

## License
MIT
`,
          message: 'Add README',
        },
      ],
    };
  }

  /**
   * Basic web app template (HTML/CSS/JS)
   */
  static webAppTemplate(projectName: string): ProjectTemplate {
    return {
      name: 'Web App',
      description: 'Basic web application',
      gitignoreTemplate: 'Node',
      licenseTemplate: 'mit',
      files: [
        {
          path: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <h1>Welcome to ${projectName}</h1>
    <p>Created with Living Creation Intelligence</p>
  </div>
  <script src="app.js"></script>
</body>
</html>
`,
          message: 'Add HTML entry point',
        },
        {
          path: 'styles.css',
          content: `/* ${projectName} Styles */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f5f5f5;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}
`,
          message: 'Add styles',
        },
        {
          path: 'app.js',
          content: `// ${projectName}
// Created with Living Creation Intelligence

console.log('${projectName} initialized!');

// Add your JavaScript code here
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
});
`,
          message: 'Add JavaScript',
        },
        {
          path: 'README.md',
          content: `# ${projectName}

## Description
${projectName}

## Setup
\`\`\`bash
# Open index.html in your browser
\`\`\`

## License
MIT
`,
          message: 'Add README',
        },
      ],
    };
  }

  // Private helpers

  private sanitizeRepoName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 100);
  }
}