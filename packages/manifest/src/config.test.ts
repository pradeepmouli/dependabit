import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import {
  readConfig,
  parseConfig,
  stringifyConfig,
  getEffectiveMonitoringRules,
  shouldIgnoreUrl
} from '../src/config.js';
import type { DependabitConfig } from '../src/schema.js';

const TEST_DIR = '/tmp/dependabit-config-tests';

describe('Config Operations Tests', () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('readConfig and parseConfig', () => {
    it('should parse valid YAML config', async () => {
      const yaml = `
version: "1"
llm:
  provider: github-copilot
  model: gpt-4
  maxTokens: 4000
  temperature: 0.3
schedule:
  interval: daily
  time: "02:00"
  timezone: UTC
`;

      const config = parseConfig(yaml);
      expect(config.version).toBe('1');
      expect(config.llm?.provider).toBe('github-copilot');
      expect(config.schedule.interval).toBe('daily');
    });

    it('should read config from file', async () => {
      const yaml = `
version: "1"
schedule:
  interval: weekly
  day: monday
`;

      const path = join(TEST_DIR, 'config.yml');
      await writeFile(path, yaml, 'utf-8');

      const config = await readConfig(path);
      expect(config.version).toBe('1');
      expect(config.schedule.interval).toBe('weekly');
    });

    it('should apply defaults for missing fields', () => {
      const yaml = `
version: "1"
`;

      const config = parseConfig(yaml);
      expect(config.schedule.interval).toBe('daily');
      expect(config.schedule.timezone).toBe('UTC');
    });

    it('should validate config structure', () => {
      const invalidYaml = `
version: "2"
`;

      expect(() => parseConfig(invalidYaml)).toThrow();
    });
  });

  describe('stringifyConfig', () => {
    it('should convert config to YAML', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: {
          interval: 'daily',
          timezone: 'UTC'
        }
      };

      const yaml = stringifyConfig(config);
      expect(yaml).toContain('version:');
      expect(yaml).toContain('daily');
    });

    it('should validate before stringifying', () => {
      const invalid = {
        version: '2'
      } as any;

      expect(() => stringifyConfig(invalid)).toThrow();
    });
  });

  describe('getEffectiveMonitoringRules', () => {
    it('should return global defaults when no override', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: {
          interval: 'daily',
          timezone: 'UTC'
        },
        monitoring: {
          enabled: true,
          autoUpdate: true,
          falsePositiveThreshold: 0.1
        }
      };

      const rules = getEffectiveMonitoringRules(
        config,
        'https://github.com/microsoft/TypeScript'
      );

      expect(rules.enabled).toBe(true);
      expect(rules.checkFrequency).toBe('daily');
      expect(rules.ignoreChanges).toBe(false);
    });

    it('should apply dependency-specific overrides', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: {
          interval: 'daily',
          timezone: 'UTC'
        },
        dependencies: [
          {
            url: 'https://github.com/microsoft/TypeScript',
            schedule: {
              interval: 'hourly',
              timezone: 'UTC'
            },
            monitoring: {
              enabled: true,
              checkFrequency: 'hourly',
              ignoreChanges: false
            }
          }
        ]
      };

      const rules = getEffectiveMonitoringRules(
        config,
        'https://github.com/microsoft/TypeScript'
      );

      expect(rules.checkFrequency).toBe('hourly');
    });

    it('should merge global and override settings', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: {
          interval: 'daily',
          timezone: 'UTC'
        },
        monitoring: {
          enabled: true,
          autoUpdate: true,
          falsePositiveThreshold: 0.1
        },
        dependencies: [
          {
            url: 'https://github.com/microsoft/TypeScript',
            monitoring: {
              enabled: true,
              checkFrequency: 'hourly',
              ignoreChanges: true
            }
          }
        ]
      };

      const rules = getEffectiveMonitoringRules(
        config,
        'https://github.com/microsoft/TypeScript'
      );

      expect(rules.enabled).toBe(true);
      expect(rules.checkFrequency).toBe('hourly');
      expect(rules.ignoreChanges).toBe(true);
    });
  });

  describe('shouldIgnoreUrl', () => {
    it('should return false when no ignore rules', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: {
          interval: 'daily',
          timezone: 'UTC'
        }
      };

      expect(shouldIgnoreUrl(config, 'https://github.com/test/repo')).toBe(false);
    });

    it('should match exact URLs', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: {
          interval: 'daily',
          timezone: 'UTC'
        },
        ignore: {
          urls: ['https://example.com/deprecated']
        }
      };

      expect(shouldIgnoreUrl(config, 'https://example.com/deprecated')).toBe(true);
      expect(shouldIgnoreUrl(config, 'https://example.com/current')).toBe(false);
    });

    it('should match regex patterns', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: {
          interval: 'daily',
          timezone: 'UTC'
        },
        ignore: {
          patterns: ['.*\\.example\\.com.*', '.*deprecated.*']
        }
      };

      expect(shouldIgnoreUrl(config, 'https://subdomain.example.com/path')).toBe(true);
      expect(shouldIgnoreUrl(config, 'https://github.com/deprecated-repo')).toBe(true);
      expect(shouldIgnoreUrl(config, 'https://github.com/active-repo')).toBe(false);
    });

    it('should match either URLs or patterns', () => {
      const config: DependabitConfig = {
        version: '1',
        schedule: {
          interval: 'daily',
          timezone: 'UTC'
        },
        ignore: {
          urls: ['https://exact-match.com'],
          patterns: ['.*pattern.*']
        }
      };

      expect(shouldIgnoreUrl(config, 'https://exact-match.com')).toBe(true);
      expect(shouldIgnoreUrl(config, 'https://some-pattern-match.com')).toBe(true);
    });
  });
});
