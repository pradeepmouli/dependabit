# Dependabit Setup Guide

This guide describes how to set up and maintain the dependabit project.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0

## Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/pradeepmouli/dependabit.git
   cd dependabit
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build all packages:
   ```bash
   pnpm run build
   ```

## Local Development

### Running Development Mode

Start all packages in development mode:
```bash
pnpm run dev
```

### Testing

Run tests across all packages:
```bash
pnpm test
```

Run tests with coverage:
```bash
pnpm run test:coverage
```

Run tests in watch mode:
```bash
pnpm run test:watch
```

### Linting and Formatting

Check code quality:
```bash
pnpm run lint
```

Fix linting issues:
```bash
pnpm run lint:fix
```

Format code:
```bash
pnpm run format
```

Check formatting:
```bash
pnpm run format:check
```

### Type Checking

Run TypeScript type checking:
```bash
pnpm run type-check
```

## Package Management

### Adding a New Package

1. Create a new directory under `packages/`:
   ```bash
   mkdir packages/my-package
   ```

2. Initialize with package.json following the existing structure (see other packages as examples)

3. Add to the monorepo by ensuring it's in the workspace (already configured via `packages/*`)

### Building Packages

Build all packages:
```bash
pnpm run build
```

Build a specific package:
```bash
cd packages/my-package
pnpm run build
```

## Cleaning

Clean build artifacts:
```bash
pnpm run clean
```

Clean everything including node_modules:
```bash
pnpm run clean:all
```

Fresh reinstall:
```bash
pnpm run fresh
```

## Git Hooks

This project uses simple-git-hooks and lint-staged to run checks before commits. Hooks are automatically installed when you run `pnpm install`.

## Troubleshooting

### Build Errors

1. Try cleaning and rebuilding:
   ```bash
   pnpm run clean
   pnpm run build
   ```

2. If issues persist, do a fresh install:
   ```bash
   pnpm run fresh
   ```

### Test Failures

Ensure all packages are built:
```bash
pnpm run build
```

Then run tests:
```bash
pnpm test
```

### Linting Issues

Auto-fix issues where possible:
```bash
pnpm run lint:fix
pnpm run format
```
