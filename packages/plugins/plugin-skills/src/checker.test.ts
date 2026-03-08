import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { SkillsChecker } from './checker.js';

describe('SkillsChecker lock file support', () => {
  it('creates snapshot from skills-lock.json using fragment skill key', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'skills-lock-test-'));
    try {
      const lockPath = join(dir, 'skills-lock.json');

      await writeFile(
        lockPath,
        JSON.stringify(
          {
            version: 1,
            skills: {
              'dependabit-bootstrap': {
                source: 'pradeepmouli/dependabit',
                sourceType: 'github',
                computedHash: '8b5fdca8597133c183160d7893de084bd62fc5690b2bf284fe9ce68218da7b9a'
              }
            }
          },
          null,
          2
        )
      );

      const checker = new SkillsChecker();
      const snapshot = await checker.fetch({ url: `${lockPath}#dependabit-bootstrap` });

      expect(snapshot.version).toBe('8b5fdca8');
      expect(snapshot.stateHash).toBe(
        '8b5fdca8597133c183160d7893de084bd62fc5690b2bf284fe9ce68218da7b9a'
      );
      expect(snapshot.metadata.owner).toBe('pradeepmouli');
      expect(snapshot.metadata.repo).toBe('dependabit');
      expect(snapshot.metadata.skillName).toBe('dependabit-bootstrap');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('throws when lock file has multiple skills and no key was provided', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'skills-lock-test-'));
    try {
      const lockPath = join(dir, 'skills-lock.json');

      await writeFile(
        lockPath,
        JSON.stringify(
          {
            version: 1,
            skills: {
              alpha: {
                source: 'org/repo-a',
                sourceType: 'github',
                computedHash: 'a'.repeat(64)
              },
              beta: {
                source: 'org/repo-b',
                sourceType: 'github',
                computedHash: 'b'.repeat(64)
              }
            }
          },
          null,
          2
        )
      );

      const checker = new SkillsChecker();

      await expect(checker.fetch({ url: lockPath })).rejects.toThrow('Multiple skills found in');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('selects lock file skill using lockSkillKey config', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'skills-lock-test-'));
    try {
      const lockPath = join(dir, 'skills-lock.json');

      await writeFile(
        lockPath,
        JSON.stringify(
          {
            version: 1,
            skills: {
              alpha: {
                source: 'org/repo-a',
                sourceType: 'github',
                computedHash: 'a'.repeat(64)
              },
              beta: {
                source: 'org/repo-b',
                sourceType: 'github',
                computedHash: 'b'.repeat(64)
              }
            }
          },
          null,
          2
        )
      );

      const checker = new SkillsChecker();
      const snapshot = await checker.fetch({
        url: lockPath,
        lockSkillKey: 'beta'
      });

      expect(snapshot.version).toBe('bbbbbbbb');
      expect(snapshot.metadata.repo).toBe('repo-b');
      expect(snapshot.metadata.skillName).toBe('beta');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('falls back to sha256(source) when computedHash is malformed', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'skills-lock-test-'));
    try {
      const lockPath = join(dir, 'skills-lock.json');

      await writeFile(
        lockPath,
        JSON.stringify(
          {
            version: 1,
            skills: {
              alpha: {
                source: 'org/repo-a',
                sourceType: 'github',
                computedHash: 'not-a-hash'
              }
            }
          },
          null,
          2
        )
      );

      const checker = new SkillsChecker();
      const snapshot = await checker.fetch({ url: lockPath });

      const expectedHash = crypto.createHash('sha256').update('org/repo-a').digest('hex');
      expect(snapshot.stateHash).toBe(expectedHash);
      expect(snapshot.version).toBe(expectedHash.substring(0, 8));
      expect(snapshot.metadata.treeSha).toBe(expectedHash);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('falls back to sha256(source) when computedHash is absent', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'skills-lock-test-'));
    try {
      const lockPath = join(dir, 'skills-lock.json');

      await writeFile(
        lockPath,
        JSON.stringify(
          {
            version: 1,
            skills: {
              alpha: {
                source: 'org/repo-a',
                sourceType: 'github'
              }
            }
          },
          null,
          2
        )
      );

      const checker = new SkillsChecker();
      const snapshot = await checker.fetch({ url: lockPath });

      const expectedHash = crypto.createHash('sha256').update('org/repo-a').digest('hex');
      expect(snapshot.stateHash).toBe(expectedHash);
      expect(snapshot.version).toBe(expectedHash.substring(0, 8));
      expect(snapshot.metadata.treeSha).toBe(expectedHash);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('accepts a file:// URL as the lock file path', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'skills-lock-test-'));
    try {
      const lockPath = join(dir, 'skills-lock.json');

      await writeFile(
        lockPath,
        JSON.stringify(
          {
            version: 1,
            skills: {
              'dependabit-bootstrap': {
                source: 'pradeepmouli/dependabit',
                sourceType: 'github',
                computedHash: '8b5fdca8597133c183160d7893de084bd62fc5690b2bf284fe9ce68218da7b9a'
              }
            }
          },
          null,
          2
        )
      );

      const checker = new SkillsChecker();
      const fileUrl = pathToFileURL(lockPath).toString();
      const snapshot = await checker.fetch({ url: fileUrl });

      expect(snapshot.version).toBe('8b5fdca8');
      expect(snapshot.stateHash).toBe(
        '8b5fdca8597133c183160d7893de084bd62fc5690b2bf284fe9ce68218da7b9a'
      );
      expect(snapshot.metadata.owner).toBe('pradeepmouli');
      expect(snapshot.metadata.repo).toBe('dependabit');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('accepts a file:// URL with a fragment skill key', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'skills-lock-test-'));
    try {
      const lockPath = join(dir, 'skills-lock.json');

      await writeFile(
        lockPath,
        JSON.stringify(
          {
            version: 1,
            skills: {
              alpha: {
                source: 'org/repo-a',
                sourceType: 'github',
                computedHash: 'a'.repeat(64)
              },
              beta: {
                source: 'org/repo-b',
                sourceType: 'github',
                computedHash: 'b'.repeat(64)
              }
            }
          },
          null,
          2
        )
      );

      const checker = new SkillsChecker();
      const fileUrl = `${pathToFileURL(lockPath).toString()}#beta`;
      const snapshot = await checker.fetch({ url: fileUrl });

      expect(snapshot.version).toBe('bbbbbbbb');
      expect(snapshot.metadata.repo).toBe('repo-b');
      expect(snapshot.metadata.skillName).toBe('beta');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('throws a clear error for a malformed file:// URL', async () => {
    const checker = new SkillsChecker();
    await expect(checker.fetch({ url: 'file://skills-lock.json' })).rejects.toThrow(
      "Failed to normalize skills lock path 'file://skills-lock.json' as file URL"
    );
  });
});
