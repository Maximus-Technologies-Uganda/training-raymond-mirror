# Workflow Review Notes

## CI Workflow (`.github/workflows/ci.yml`)
- The CI workflow installs dependencies with `npm ci`, but the project documentation explicitly instructs contributors to use `npm install`. Aligning the workflow with the documented process avoids lockfile drift between local and CI environments and prevents `npm ci` from failing when `package-lock.json` is out of sync.【F:AGENT.md†L13-L43】【F:.github/workflows/ci.yml†L15-L24】
- The workflow runs `npm run packet`, but `package.json` does not define a `packet` script. This step will fail every run, stopping the workflow before artifacts are generated.【F:.github/workflows/ci.yml†L26-L27】【F:package.json†L7-L24】

## Release Artifact Workflow (`.github/workflows/release-artifacts.yml`)
- Like the CI workflow, the release workflow uses `npm ci` even though the repo standard is `npm install`, creating the same risk of install failures and inconsistent environments.【F:AGENT.md†L13-L43】【F:.github/workflows/release-artifacts.yml†L19-L31】
- The workflow publishes assets with `actions/upload-release-asset@v1`, which still runs on the deprecated Node 12 runtime. GitHub has announced end-of-life for Node 12-based actions, so this step is likely to break when the runtime is disabled; migrating to a maintained alternative (e.g., `softprops/action-gh-release` or a custom upload step) will future-proof releases.【F:.github/workflows/release-artifacts.yml†L121-L129】

## Checks Workflow (`.github/workflows/checks.yml`)
- The lint step uses `--if-present`, which allows the job to succeed even if linting is accidentally removed from `package.json`. Consider dropping the flag so the workflow fails when linting is missing.【F:.github/workflows/checks.yml†L17-L20】
