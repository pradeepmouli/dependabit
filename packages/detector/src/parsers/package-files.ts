/**
 * Package File Parser
 * T038 [P] [US1] Implement package file parser
 */

import { readFile } from 'node:fs/promises';

export interface PackageDependency {
  name: string;
  version: string | undefined;
  type: 'dependency' | 'devDependency' | 'peerDependency';
}

/**
 * Parse package manager files and extract dependencies
 * Used to cross-reference and exclude package manager dependencies from manifest
 */
export class PackageFileParser {
  /**
   * Parse a package file and extract dependencies
   */
  async parseFile(filePath: string): Promise<PackageDependency[]> {
    const content = await readFile(filePath, 'utf-8');
    const fileName = filePath.toLowerCase();

    if (fileName.endsWith('package.json')) {
      return this.parsePackageJson(content);
    }

    if (fileName.endsWith('requirements.txt') || fileName.includes('requirements')) {
      return this.parseRequirementsTxt(content);
    }

    if (fileName.endsWith('cargo.toml')) {
      return this.parseCargoToml(content);
    }

    if (fileName.endsWith('gemfile') || fileName.endsWith('.gemfile')) {
      return this.parseGemfile(content);
    }

    if (fileName.endsWith('composer.json')) {
      return this.parseComposerJson(content);
    }

    return [];
  }

  /**
   * Parse package.json (Node.js)
   */
  private parsePackageJson(content: string): PackageDependency[] {
    try {
      const pkg = JSON.parse(content);
      const deps: PackageDependency[] = [];

      if (pkg.dependencies) {
        for (const [name, version] of Object.entries(pkg.dependencies)) {
          deps.push({
            name,
            version: version as string,
            type: 'dependency'
          });
        }
      }

      if (pkg.devDependencies) {
        for (const [name, version] of Object.entries(pkg.devDependencies)) {
          deps.push({
            name,
            version: version as string,
            type: 'devDependency'
          });
        }
      }

      if (pkg.peerDependencies) {
        for (const [name, version] of Object.entries(pkg.peerDependencies)) {
          deps.push({
            name,
            version: version as string,
            type: 'peerDependency'
          });
        }
      }

      return deps;
    } catch {
      return [];
    }
  }

  /**
   * Parse requirements.txt (Python)
   */
  private parseRequirementsTxt(content: string): PackageDependency[] {
    const deps: PackageDependency[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Parse package name and version
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)([=<>~!]+.*)?$/);
      if (match && match[1]) {
        deps.push({
          name: match[1],
          version: match[2]?.trim() || undefined,
          type: 'dependency'
        });
      }
    }

    return deps;
  }

  /**
   * Parse Cargo.toml (Rust)
   */
  private parseCargoToml(content: string): PackageDependency[] {
    const deps: PackageDependency[] = [];
    const lines = content.split('\n');
    let inDependencies = false;
    let inDevDependencies = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Check for section headers
      if (trimmed === '[dependencies]') {
        inDependencies = true;
        inDevDependencies = false;
        continue;
      }
      if (trimmed === '[dev-dependencies]') {
        inDependencies = false;
        inDevDependencies = true;
        continue;
      }
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        inDependencies = false;
        inDevDependencies = false;
        continue;
      }

      // Parse dependencies
      if (inDependencies || inDevDependencies) {
        const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.+)$/);
        if (match && match[1] && match[2]) {
          const name = match[1];
          const versionPart = match[2];

          // Extract version from string or object
          let version: string | undefined;
          if (versionPart.startsWith('"')) {
            version = versionPart.replace(/"/g, '').trim();
          } else if (versionPart.includes('version')) {
            const versionMatch = versionPart.match(/version\s*=\s*"([^"]+)"/);
            if (versionMatch) {
              version = versionMatch[1];
            }
          }

          deps.push({
            name,
            version,
            type: inDevDependencies ? 'devDependency' : 'dependency'
          });
        }
      }
    }

    return deps;
  }

  /**
   * Parse Gemfile (Ruby)
   */
  private parseGemfile(content: string): PackageDependency[] {
    const deps: PackageDependency[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      const trimmed = line.trim();

      // Match gem declarations
      const match = trimmed.match(/^gem\s+['"]([^'"]+)['"](?:,\s*['"]([^'"]+)['"])?/);
      if (match && match[1]) {
        deps.push({
          name: match[1],
          version: match[2] || undefined,
          type: 'dependency'
        });
      }
    }

    return deps;
  }

  /**
   * Parse composer.json (PHP)
   */
  private parseComposerJson(content: string): PackageDependency[] {
    try {
      const composer = JSON.parse(content);
      const deps: PackageDependency[] = [];

      if (composer.require) {
        for (const [name, version] of Object.entries(composer.require)) {
          deps.push({
            name,
            version: version as string,
            type: 'dependency'
          });
        }
      }

      if (composer['require-dev']) {
        for (const [name, version] of Object.entries(composer['require-dev'])) {
          deps.push({
            name,
            version: version as string,
            type: 'devDependency'
          });
        }
      }

      return deps;
    } catch {
      return [];
    }
  }

  /**
   * Check if a URL corresponds to a package manager dependency
   */
  isPackageManagerUrl(url: string, dependencies: PackageDependency[]): boolean {
    const depNames = dependencies.map((d) => d.name.toLowerCase());

    // Check if URL contains any of the dependency names
    const urlLower = url.toLowerCase();
    return depNames.some((name) => urlLower.includes(name));
  }
}
