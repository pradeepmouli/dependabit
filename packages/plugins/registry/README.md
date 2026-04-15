# @dependabit/plugins

> Plugin registry and loader for dependabit — registers, discovers, and instantiates extensible dependency access-method plugins.

Part of the [dependabit](https://github.com/pradeepmouli/dependabit) dependency automation toolkit.

## Install

```bash
pnpm add @dependabit/plugins
```

## Overview

This package is the extension point of the dependabit toolkit. It defines the `Plugin` interface and metadata schema that every checker (GitHub, HTTP, OpenAPI, arXiv, Context7, skills.sh) implements, plus a registry and dynamic loader used by the detector to resolve the right plugin for a given dependency source.

## Usage

```ts
import { PluginRegistry, loadPlugin } from '@dependabit/plugins';

const registry = new PluginRegistry();
const plugin = await loadPlugin('@dependabit/plugin-github');
registry.register(plugin);

const result = await registry.get('github')?.check('https://github.com/owner/repo');
```

## API

See the [full API reference](https://pradeepmouli.github.io/dependabit/api/) for details.

## License

MIT — see [LICENSE](../../../LICENSE).
