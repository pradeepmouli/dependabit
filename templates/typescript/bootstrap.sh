#!/bin/bash

# Dependabit Bootstrap Script for TypeScript Projects
# Usage: ./bootstrap.sh [target-repository-path]

set -e

TARGET_DIR="${1:-.}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Bootstrapping Dependabit..."
echo "Target directory: $TARGET_DIR"
echo ""

# Check if target directory exists
if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ Error: Target directory '$TARGET_DIR' does not exist"
  exit 1
fi

# Check if it's a git repository
if [ ! -d "$TARGET_DIR/.git" ]; then
  echo "⚠️  Warning: Target directory is not a git repository"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Create directories
echo "📁 Creating directories..."
mkdir -p "$TARGET_DIR/.github/workflows"
mkdir -p "$TARGET_DIR/.dependabit"

# Copy workflow files
echo "📋 Copying workflow files..."
cp "$SCRIPT_DIR/.github/workflows/dependabit-generate.yml" "$TARGET_DIR/.github/workflows/"
cp "$SCRIPT_DIR/.github/workflows/dependabit-update.yml" "$TARGET_DIR/.github/workflows/"
cp "$SCRIPT_DIR/.github/workflows/dependabit-check.yml" "$TARGET_DIR/.github/workflows/"

# Copy config file (if it doesn't exist)
if [ -f "$TARGET_DIR/.dependabit/config.yml" ]; then
  echo "⚠️  Config file already exists, skipping..."
else
  echo "⚙️  Copying configuration file..."
  cp "$SCRIPT_DIR/.dependabit/config.yml" "$TARGET_DIR/.dependabit/"
fi

echo ""
echo "✅ Bootstrap complete!"
echo ""
echo "Next steps:"
echo "1. Commit the new files:"
echo "   cd $TARGET_DIR"
echo "   git add .github/workflows/dependabit-*.yml .dependabit/config.yml"
echo "   git commit -m 'chore: add dependabit workflows'"
echo "   git push"
echo ""
echo "2. Go to your repository on GitHub"
echo "3. Navigate to Actions > Dependabit - Generate Manifest"
echo "4. Click 'Run workflow' to create your initial manifest"
echo ""
echo "📚 For more information, see: templates/typescript/README.md"
