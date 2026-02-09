# Dependabit Bootstrap Templates

This directory contains ready-to-use templates for bootstrapping Dependabit onto various types of projects.

## Available Templates

### [TypeScript](./typescript/)

Complete setup for TypeScript projects including:
- GitHub Actions workflows (generate, update, check)
- Example configuration file
- Automated bootstrap script
- Comprehensive documentation

**Quick Start:**
```bash
cd typescript
./bootstrap.sh /path/to/your/typescript-repo
```

## Coming Soon

- **JavaScript/Node.js** - For pure JavaScript projects
- **Python** - For Python repositories
- **Go** - For Go projects
- **Rust** - For Rust projects
- **Monorepo** - For multi-package repositories

## Creating Your Own Template

Each template should include:

1. **Workflow Files** - GitHub Actions workflows for:
   - Generate: Initial manifest creation
   - Update: Auto-update on push
   - Check: Scheduled monitoring

2. **Configuration** - Example `.dependabit/config.yml` with sensible defaults

3. **Documentation** - README with:
   - What's included
   - Setup instructions
   - Customization options
   - Troubleshooting

4. **Bootstrap Script** (optional) - Shell script to automate setup

## Template Structure

```
templates/
└── language-or-framework/
    ├── .github/
    │   └── workflows/
    │       ├── dependabit-generate.yml
    │       ├── dependabit-update.yml
    │       └── dependabit-check.yml
    ├── .dependabit/
    │   └── config.yml
    ├── bootstrap.sh
    └── README.md
```

## Contributing

To add a new template:

1. Create a new directory under `templates/`
2. Add all required files (workflows, config, docs)
3. Test the template thoroughly
4. Submit a pull request

## Support

- [Main Documentation](../README.md)
- [GitHub Issues](https://github.com/pradeepmouli/dependabit/issues)
- [GitHub Discussions](https://github.com/pradeepmouli/dependabit/discussions)
