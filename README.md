# dependabit

![Dependabit logo](docs/assets/dependabit-logo.svg)

Dependabit is a Dependabot-inspired toolkit for tracking resources, related projects, and the knowledge that keeps them healthy. It is built for teams that want dependable updates, clear auditability, and a repeatable workflow across multiple packages.

## Table of Contents

- [Why dependabit](#why-dependabit)
- [Key capabilities](#key-capabilities)
- [How it works](#how-it-works)
- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Project layout](#project-layout)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Why dependabit

- **Stay current** with dependency insights that are tailored to resources and cross-project ecosystems.
- **Reduce risk** through automated checks and a consistent review workflow.
- **Move faster** with a shared workspace and tooling that scales to multiple packages.

## Key capabilities

- Workspace-ready tooling built on pnpm.
- Automated linting, formatting, and testing hooks.
- Documentation-first workflow for repeatable maintenance.
- Structured workspace guides and examples to keep onboarding simple.

## How it works

Dependabit uses a pnpm workspace to group packages, scripts, and shared configuration. It keeps dependencies discoverable and aligns contributors on repeatable update and review steps.

## Quick start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0

### Install

```bash
git clone https://github.com/pradeepmouli/dependabit.git
cd dependabit
pnpm install
```

### Develop

```bash
pnpm run dev
```

## Scripts

```bash
pnpm run lint
pnpm run format
pnpm test
```

## Project layout

```
dependabit/
├── docs/                 # Guides and references
├── packages/             # Workspace packages
├── src/                  # Shared application code
├── package.json
└── README.md
```

## Documentation

- [Workspace Guide](docs/WORKSPACE.md) - Managing packages
- [Development Workflow](docs/DEVELOPMENT.md) - Development process
- [Testing Guide](docs/TESTING.md) - Testing setup
- [Examples](docs/EXAMPLES.md) - Usage examples

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE) for details.
