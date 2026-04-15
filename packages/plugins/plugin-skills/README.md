# @dependabit/plugin-skills

> Skills.sh checker plugin for dependabit — tracks AI agent skill package versions as monitored dependencies.

Part of the [dependabit](https://github.com/pradeepmouli/dependabit) dependency automation toolkit.

## Install

```bash
pnpm add @dependabit/plugin-skills
```

## Overview

This plugin teaches dependabit how to resolve and fingerprint skills hosted on skills.sh. It fetches skill manifests, produces a snapshot of the current version set, and reports change detections back to the dependabit detector so downstream automation can react to upstream skill updates.

## Usage

```ts
import { createSkillsChecker } from '@dependabit/plugin-skills';

const checker = createSkillsChecker({
  // SkillsConfig options
});

const snapshot = await checker.snapshot();
const diff = await checker.detectChanges(previousSnapshot);
```

Exports: `SkillsChecker`, `createSkillsChecker`, and the types `SkillsConfig`, `SkillInfo`, `SkillSnapshot`, `SkillChangeDetection`.

## API

See the [full API reference](https://pradeepmouli.github.io/dependabit/api/) for details.

## License

MIT — see [LICENSE](../../../LICENSE).
