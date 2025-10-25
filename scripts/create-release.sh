#!/bin/bash

# Get current version
VERSION=$(node -p "require('./package.json').version")

echo "Creating release for version: $VERSION"
echo ""

# Create release notes
cat > RELEASE_NOTES.md << EOF
# Release v$VERSION

## What's Included
- ✅ 3 Command Line Tools (Hello, Stopwatch, Temperature)
- ✅ 14 Unit Tests (100% passing)
- ✅ Complete documentation and journals
- ✅ Review packet for mentor evaluation
- ✅ ESLint configuration (clean code)

## Quick Start for Reviewers
1. Download the review package from this release
2. Extract the ZIP file
3. Run installation script:
   - **Linux/Mac:** \`./install.sh\`
   - **Windows:** \`install.bat\`
4. Test the CLIs as documented in QUICK_START.md

## For Mentors
- **Review Packet:** Check \`docs/review-packet-week1.md\` in the package
- **All PRs:** Check the development branch for PR history
- **CI Status:** All checks passing
- **Public Mirror:** [training-raymond-mirror](https://github.com/Maximus-Technologies-Uganda/training-raymond-mirror)

## Technical Details
- **Node.js:** LTS version
- **Testing:** Vitest framework
- **Linting:** ESLint with custom config
- **Coverage:** 14/14 tests passing
- **Timeline:** Completed in 2 days (accelerated)

## Files Structure
\`\`\`
review-package/
├── src/                    # Source code (3 CLIs)
├── tests/                  # Test suite (14 tests)
├── docs/                   # Documentation & journals
├── package.json           # Dependencies
├── install.sh             # Unix installation
├── install.bat            # Windows installation
└── QUICK_START.md         # Quick start guide
\`\`\`
EOF

echo "✅ Release notes created: RELEASE_NOTES.md"
echo ""
echo "📋 Next steps:"
echo "1. git add RELEASE_NOTES.md"
echo "2. git commit -m 'chore: prepare release v$VERSION'"
echo "3. git tag -a 'v$VERSION' -m 'Release v$VERSION'"
echo "4. git push origin 'v$VERSION'"
echo "5. Go to GitHub to publish the release with RELEASE_NOTES.md content"
echo ""
echo "Once published, GitHub Actions will automatically create the review package!"
