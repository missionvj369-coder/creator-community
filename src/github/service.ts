// GitHub Integration Service
// Handles OAuth, repository creation, and code push operations

export interface GitHubConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatarUrl: string;
  htmlUrl: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  private: boolean;
  createdAt: string;
  updatedAt: string;
  defaultBranch: string;
  language: string | null;
}

export interface CreateRepoOptions {
  name: string;
  description: string;
  private: boolean;
  autoInit: boolean;
  gitignoreTemplate?: string;
  licenseTemplate?: string;
}

export interface PushOptions {
  owner: string;
  repo: string;
  branch: string;
  files: Array<{
    path: string;
    content: string;
    message: string;
  }>;
}

export class GitHubService {
  private config: GitHubConfig;
  private accessToken: string | null = null;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state: state || this.generateState(),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCode(code: string): Promise<string> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`OAuth error: ${data.error_description || data.error}`);
    }

    this.accessToken = data.access_token;
    return data.access_token;
  }

  /**
   * Set access token directly (for testing or manual auth)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get authenticated user information
   */
  async getAuthenticatedUser(): Promise<GitHubUser> {
    this.ensureAuthenticated();

    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'LCI-GitHub-Integration/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new repository
   */
  async createRepository(options: CreateRepoOptions): Promise<GitHubRepository> {
    this.ensureAuthenticated();

    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'LCI-GitHub-Integration/1.0',
      },
      body: JSON.stringify({
        name: options.name,
        description: options.description,
        private: options.private,
        auto_init: options.autoInit,
        gitignore_template: options.gitignoreTemplate,
        license_template: options.licenseTemplate,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create repository: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create repository for authenticated user
   */
  async createUserRepo(options: CreateRepoOptions): Promise<GitHubRepository> {
    return this.createRepository(options);
  }

  /**
   * Create repository in organization
   */
  async createOrgRepo(
    org: string,
    options: CreateRepoOptions
  ): Promise<GitHubRepository> {
    this.ensureAuthenticated();

    const response = await fetch(`https://api.github.com/orgs/${org}/repos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'LCI-GitHub-Integration/1.0',
      },
      body: JSON.stringify({
        name: options.name,
        description: options.description,
        private: options.private,
        auto_init: options.autoInit,
        gitignore_template: options.gitignoreTemplate,
        license_template: options.licenseTemplate,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create org repository: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Push multiple files to repository
   * Uses Git Trees API for batch operations
   */
  async pushFiles(options: PushOptions): Promise<void> {
    this.ensureAuthenticated();

    const { owner, repo, branch, files } = options;

    // Get the current repository info to find the default branch SHA
    const repoInfo = await this.getRepository(owner, repo);
    const defaultBranch = repoInfo.defaultBranch;

    // Get the latest commit on the branch
    const branchRef = await this.getBranch(owner, repo, branch || defaultBranch);
    const baseTreeSha = branchRef.object.sha;

    // Create tree with all files
    const tree = await this.createTree(owner, repo, {
      base_tree: baseTreeSha,
      tree: files.map(file => ({
        path: file.path,
        content: file.content,
        mode: '100644',
        type: 'blob',
      })),
    });

    // Create commit
    const commitMessage = files.map(f => f.message).join('\n');
    const commit = await this.createCommit(owner, repo, {
      message: commitMessage,
      tree: tree.sha,
      parents: [branchRef.object.sha],
    });

    // Update branch reference
    await this.updateRef(owner, repo, {
      ref: `refs/heads/${branch || defaultBranch}`,
      sha: commit.sha,
    });
  }

  /**
   * Push a single file to repository
   */
  async pushFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch?: string
  ): Promise<void> {
    this.ensureAuthenticated();

    // Get the current file SHA if it exists (needed for updates)
    let sha: string | undefined;
    try {
      const fileInfo = await this.getFileContents(owner, repo, path, branch);
      sha = fileInfo.sha;
    } catch (error) {
      // File doesn't exist yet, that's fine
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'LCI-GitHub-Integration/1.0',
        },
        body: JSON.stringify({
          message,
          content: Buffer.from(content).toString('base64'),
          sha,
          branch: branch || 'main',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to push file: ${error.message || response.statusText}`);
    }
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    this.ensureAuthenticated();

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LCI-GitHub-Integration/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch repository: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List user's repositories
   */
  async listRepositories(perPage: number = 30, page: number = 1): Promise<GitHubRepository[]> {
    this.ensureAuthenticated();

    const response = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LCI-GitHub-Integration/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list repositories: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a repository
   */
  async deleteRepository(owner: string, repo: string): Promise<void> {
    this.ensureAuthenticated();

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LCI-GitHub-Integration/1.0',
        },
      }
    );

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to delete repository: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.accessToken = null;
  }

  // Private helper methods

  private ensureAuthenticated(): void {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Call exchangeCode() or setAccessToken() first.');
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private async getBranch(owner: string, repo: string, branch: string): Promise<{
    object: { sha: string };
  }> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LCI-GitHub-Integration/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get branch: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  private async createTree(
    owner: string,
    repo: string,
    options: { base_tree?: string; tree: Array<{ path: string; content: string; mode: string; type: string }> }
  ): Promise<{ sha: string }> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'LCI-GitHub-Integration/1.0',
        },
        body: JSON.stringify(options),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create tree: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  private async createCommit(
    owner: string,
    repo: string,
    options: { message: string; tree: string; parents: string[] }
  ): Promise<{ sha: string }> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'LCI-GitHub-Integration/1.0',
        },
        body: JSON.stringify(options),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create commit: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  private async updateRef(
    owner: string,
    repo: string,
    options: { ref: string; sha: string }
  ): Promise<void> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/${encodeURIComponent(options.ref)}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'LCI-GitHub-Integration/1.0',
        },
        body: JSON.stringify({ sha: options.sha }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update ref: ${response.status} ${response.statusText}`);
    }
  }

  private async getFileContents(
    owner: string,
    repo: string,
    path: string,
    branch?: string
  ): Promise<{ sha: string }> {
    const params = branch ? `?ref=${branch}` : '';
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}${params}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LCI-GitHub-Integration/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get file: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { sha: data.sha };
  }
}