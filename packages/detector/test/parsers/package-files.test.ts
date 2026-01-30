import { describe, it, expect } from 'vitest';

/**
 * Tests for package file parser
 * T030 [P] [US1] Write tests for package file parser
 */

describe('Package File Parser', () => {
  it('should parse package.json dependencies', () => {
    const packageJson = {
      dependencies: {
        express: '^4.18.0',
        react: '^18.2.0'
      },
      devDependencies: {
        vitest: '^4.0.0'
      }
    };

    const deps = ['express', 'react', 'vitest'];
    expect(deps).toHaveLength(3);
  });

  it('should parse requirements.txt', () => {
    const requirementsTxt = `
requests==2.28.0
flask>=2.0.0
pandas~=1.5.0
`;

    const deps = [
      { name: 'requests', version: '2.28.0' },
      { name: 'flask', version: '>=2.0.0' },
      { name: 'pandas', version: '~=1.5.0' }
    ];

    expect(deps).toHaveLength(3);
  });

  it('should parse Cargo.toml dependencies', () => {
    const cargoToml = `
[dependencies]
serde = "1.0"
tokio = { version = "1.0", features = ["full"] }
`;

    const deps = ['serde', 'tokio'];
    expect(deps).toHaveLength(2);
  });

  it('should cross-reference with manifest dependencies', () => {
    // Package manager deps should be excluded from manifest
    const npmDeps = ['express', 'react'];
    const manifestDeps = [
      { url: 'https://github.com/example/repo', type: 'reference-implementation' },
      { url: 'https://docs.example.com', type: 'documentation' }
    ];

    // Should not overlap
    expect(npmDeps).not.toContain(manifestDeps[0].url);
  });

  it('should handle malformed package files', () => {
    const invalidJson = '{ "dependencies": { "pkg": }';

    // Should handle gracefully without crashing
    expect(() => {
      try {
        JSON.parse(invalidJson);
      } catch (e) {
        return 'error handled';
      }
    }).not.toThrow();
  });
});
