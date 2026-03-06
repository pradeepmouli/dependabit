import { describe, expect, it } from 'vitest';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { SkillsChecker } from './checker.js';

describe('SkillsChecker lock file support', () => {
  it('creates snapshot from skills-lock.json using fragment skill key', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'skills-lock-test-'));
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
  });

  it('throws when lock file has multiple skills and no key was provided', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'skills-lock-test-'));
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
  });

  it('selects lock file skill using lockSkillKey config', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'skills-lock-test-'));
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
  });
});
