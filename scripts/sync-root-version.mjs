import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const ROOT_PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');

const shouldSkipDir = (name) =>
  name === 'node_modules' || name === 'dist' || name === 'build' || name.startsWith('.');

const findPackageJsons = (dir) => {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      results.push(...findPackageJsons(path.join(dir, entry.name)));
      continue;
    }

    if (entry.isFile() && entry.name === 'package.json') {
      results.push(path.join(dir, entry.name));
    }
  }

  return results;
};

const parseVersion = (version) => {
  const [main, pre = ''] = version.split('-', 2);
  const [major, minor, patch] = main.split('.').map((value) => Number.parseInt(value, 10));
  const preIds = pre ? pre.split('.') : [];

  return {
    major: Number.isNaN(major) ? 0 : major,
    minor: Number.isNaN(minor) ? 0 : minor,
    patch: Number.isNaN(patch) ? 0 : patch,
    preIds
  };
};

const compareIdentifiers = (left, right) => {
  const leftNum = /^[0-9]+$/.test(left);
  const rightNum = /^[0-9]+$/.test(right);

  if (leftNum && rightNum) {
    const leftVal = Number.parseInt(left, 10);
    const rightVal = Number.parseInt(right, 10);
    return leftVal === rightVal ? 0 : leftVal > rightVal ? 1 : -1;
  }

  if (leftNum && !rightNum) return -1;
  if (!leftNum && rightNum) return 1;

  return left === right ? 0 : left > right ? 1 : -1;
};

const compareSemver = (left, right) => {
  const a = parseVersion(left);
  const b = parseVersion(right);

  if (a.major !== b.major) return a.major > b.major ? 1 : -1;
  if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1;
  if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1;

  const aHasPre = a.preIds.length > 0;
  const bHasPre = b.preIds.length > 0;

  if (!aHasPre && !bHasPre) return 0;
  if (!aHasPre && bHasPre) return 1;
  if (aHasPre && !bHasPre) return -1;

  const max = Math.max(a.preIds.length, b.preIds.length);
  for (let index = 0; index < max; index += 1) {
    const leftId = a.preIds[index];
    const rightId = b.preIds[index];

    if (leftId === undefined) return -1;
    if (rightId === undefined) return 1;

    const result = compareIdentifiers(leftId, rightId);
    if (result !== 0) return result;
  }

  return 0;
};

const readPackageVersion = (packageJsonPath) => {
  const content = readFileSync(packageJsonPath, 'utf8');
  const parsed = JSON.parse(content);
  return parsed.version;
};

const packageJsons = findPackageJsons(PACKAGES_DIR);
const versions = packageJsons.map(readPackageVersion).filter(Boolean);

if (versions.length === 0) {
  console.warn('sync-root-version: no package versions found.');
  process.exit(0);
}

const highestVersion = versions.reduce((current, candidate) =>
  compareSemver(candidate, current) > 0 ? candidate : current
);

const rootContent = readFileSync(ROOT_PACKAGE_JSON, 'utf8');
const rootPackage = JSON.parse(rootContent);

if (rootPackage.version !== highestVersion) {
  rootPackage.version = highestVersion;
  writeFileSync(ROOT_PACKAGE_JSON, `${JSON.stringify(rootPackage, null, 2)}\n`);
  console.log(`sync-root-version: set root version to ${highestVersion}`);
} else {
  console.log(`sync-root-version: root version already ${highestVersion}`);
}
