# Release Workflow for Review Packets

## Overview

This workflow automates the process of creating downloadable review packages that your mentor can easily download, extract, and review. The entire process is streamlined and requires minimal manual steps.

## Automated Release Process

### Step 1: Prepare Release

Make sure you're on the development branch with all changes committed:

```bash
# Make sure you're on development branch
git checkout development
git pull origin development

# Make sure everything is committed
git status
```

### Step 2: Run Release Preparation Script

```bash
# Make the script executable (first time only)
chmod +x scripts/create-release.sh

# Run the release script
./scripts/create-release.sh
```

This script will:
- ✅ Extract version from `package.json`
- ✅ Create `RELEASE_NOTES.md` with complete documentation
- ✅ Provide instructions for the next steps

### Step 3: Create and Push Release

Follow the instructions from the script:

```bash
# Add release notes to git
git add RELEASE_NOTES.md

# Commit the release notes
git commit -m "chore: prepare release v0.1.0"

# Create git tag
git tag -a v0.1.0 -m "Release v0.1.0"

# Push the tag to GitHub
git push origin v0.1.0
```

### Step 4: Publish on GitHub

1. Go to your repository on GitHub: https://github.com/your-username/training-raymond
2. Click **Releases** in the sidebar
3. Click **Create a new release**
4. Select the tag `v0.1.0` from the dropdown
5. Copy content from `RELEASE_NOTES.md` into the release description
6. Click **Publish release**

### Step 5: Verify Workflow

Once you publish the release:

1. GitHub Actions automatically triggers the release-artifacts workflow
2. It runs tests and linting to verify quality
3. It creates a review package ZIP file
4. It uploads the ZIP to the release
5. Your mentor can download the complete package

**Check progress:**
- Go to **Actions** tab in your repository
- Look for "Create Review Package" workflow
- Wait for it to complete (usually 2-3 minutes)

## What Mentors Receive

When your mentor downloads the review package, they get:

```
review-package/
├── src/                    # All 3 CLI implementations
├── tests/                  # All 14 tests
├── docs/
│   ├── review-packet-week1.md    # Detailed review assessment
│   ├── Week1-Journal-2Day-Accelerated.md
│   └── journals/                 # Daily work journals
├── package.json           # Dependencies
├── package-lock.json      # Exact versions
├── README.md              # Complete documentation
├── .eslintrc.json         # Code style configuration
├── install.sh             # Auto-install for Unix/Mac
├── install.bat            # Auto-install for Windows
└── QUICK_START.md         # Quick testing guide
```

## How Mentors Use the Package

1. **Download** from the release page
2. **Extract** the ZIP file anywhere
3. **Install** by running:
   ```bash
   # Linux/Mac
   ./install.sh
   
   # Windows
   install.bat
   ```
4. **Review** all documentation
5. **Test** the CLIs manually

## Continuous Updates

The public mirror (`training-raymond-mirror`) is automatically updated whenever you push to `development` branch:

```bash
# Push to development
git push origin development

# Mirror automatically syncs via GitHub Actions
# No manual action needed!
```

## Manual Testing (Optional)

To test the review package locally before sending to mentor:

```bash
# Create a test directory
mkdir test-review
cd test-review

# Download and extract the ZIP from the release
# Then run the installation
./install.sh

# Verify all tests pass
npm test

# Test each CLI
node src/hello/index.js --name Raymond --shout
node src/stopwatch/index.js start
node src/temperature/index.js --from C --to F 32
```

## Troubleshooting

### Workflow Failed?
1. Check **Actions** tab for error logs
2. Common issues:
   - Tests failing: Run `npm test` locally first
   - Linting errors: Run `npm run lint` and fix
   - Missing files: Ensure all files are committed

### Release Not Published?
1. Verify the tag was pushed: `git tag -l`
2. Check it appears on GitHub Releases page
3. Make sure you selected "Publish release" (not "Save draft")

### Package Not Created?
1. Wait for workflow to complete (check Actions tab)
2. Refresh the releases page
3. Download should be available in release assets

## Complete Workflow Example

```bash
# 1. Ensure everything is ready
git checkout development
git pull origin development
npm test        # Verify tests pass locally
npm run lint    # Verify linting passes

# 2. Prepare release
chmod +x scripts/create-release.sh
./scripts/create-release.sh

# 3. Commit and tag
git add RELEASE_NOTES.md
git commit -m "chore: prepare release v0.1.0"
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0

# 4. Go to GitHub and publish the release

# 5. Wait for actions to complete
# Monitor at: https://github.com/your-username/training-raymond/actions

# 6. Share release link with mentor
# https://github.com/your-username/training-raymond/releases/latest
```

## Key Benefits

✅ **One-Click Reviews** - Mentor downloads one ZIP file  
✅ **Self-Contained** - No missing dependencies or setup steps  
✅ **Quality Assured** - Tests & linting run automatically  
✅ **Professional** - Clear documentation and instructions  
✅ **Automated** - Public mirror stays in sync automatically  
✅ **Cross-Platform** - Works on Windows, Mac, Linux  

---

*Last updated: October 25, 2025*
