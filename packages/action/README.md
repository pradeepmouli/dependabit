# @dependabit/action

GitHub Action entry points for dependency tracking.

## Overview

This package provides the main entry points for the dependabit GitHub Actions, orchestrating all other packages to provide a complete dependency tracking solution.

## Features

- Generate action: Create initial manifest
- Update action: Automatically update manifest on push
- Check action: Monitor dependencies for changes
- Validate action: Validate manifest files

## Installation

This package is distributed as a GitHub Action. See the main repository README for usage instructions.

## Actions

### Generate

Analyzes repository and generates `.dependabit/manifest.json`.

### Update

Automatically updates manifest when code changes are pushed.

### Check

Periodically checks dependencies for changes and creates issues.

### Validate

Validates manifest file structure and content.

## License

MIT
