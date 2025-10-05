# Release Workflow Testing Guide

This guide explains how to test the release workflow to ensure artifacts are properly uploaded to GitHub releases.

## Quick Test (Recommended)

The easiest way to test the release workflow is to use the test workflow:

1. Go to the [Actions tab](https://github.com/amanasci/RefForge/actions/workflows/test-release.yml) in the GitHub repository
2. Click "Run workflow"
3. Enter a test tag name (e.g., `test-v0.0.1`)
4. Click "Run workflow"
5. Wait for the workflow to complete (~10 minutes)
6. Check the "verify-artifacts" job output to see if artifacts were uploaded
7. Go to [Releases](https://github.com/amanasci/RefForge/releases) to see the test release with artifacts

### Cleanup After Testing

After testing, clean up the test release:

1. Go to [Releases](https://github.com/amanasci/RefForge/releases)
2. Find the test release (should be marked as "Pre-release" and "Draft")
3. Click "Delete" to remove the release
4. Delete the test tag:
   ```bash
   git push origin :refs/tags/test-v0.0.1
   ```

## Full Platform Test

To test artifact creation for all platforms (macOS, Windows, Linux), create a real tag:

1. Make sure all changes are committed and pushed
2. Create and push a tag:
   ```bash
   git tag test-v0.0.2
   git push origin test-v0.0.2
   ```
3. The release workflow will automatically trigger
4. Wait for all jobs to complete (~20-30 minutes)
5. Check the [release](https://github.com/amanasci/RefForge/releases) for uploaded artifacts

### Expected Artifacts

The workflow should upload the following artifacts for a complete release:

**Linux (ubuntu-22.04):**
- `RefForge_<version>_amd64.deb` - Debian package
- `RefForge_<version>_amd64.AppImage` - AppImage
- `RefForge-<version>-1.x86_64.rpm` - RPM package

**macOS (macos-latest):**
- `RefForge_<version>_aarch64.dmg` - ARM64 DMG
- `RefForge_<version>_x64.dmg` - Intel DMG
- `RefForge_aarch64.app.tar.gz` - ARM64 app bundle
- `RefForge_x64.app.tar.gz` - Intel app bundle

**Windows (windows-latest):**
- `RefForge_<version>_x64_en-US.msi` - x64 MSI installer
- `RefForge_<version>_x64-setup.exe` - x64 setup executable
- `RefForge_<version>_arm64_en-US.msi` - ARM64 MSI installer
- `RefForge_<version>_arm64-setup.exe` - ARM64 setup executable

## Troubleshooting

### No artifacts uploaded

If no artifacts are uploaded:
1. Check the job logs for errors
2. Verify the `tauri-apps/tauri-action@v0` step completed successfully
3. Check if the release was created as a draft
4. Verify the `releaseId` is being passed correctly to the action

### Build failures

If builds fail:
1. Check platform-specific dependency installation
2. Verify Rust and Node.js versions are correct
3. Check Tauri configuration in `src-tauri/tauri.conf.json`

### Artifacts missing for specific platforms

If only some platforms have artifacts:
1. Check the matrix job logs for the missing platform
2. Verify platform-specific build steps completed
3. Check if the Tauri action supports the target platform

## How the Workflow Works

The release workflow has three main jobs:

1. **create-release**: Creates a draft release on GitHub
2. **publish-tauri**: Builds the app for all platforms and uploads artifacts
   - Uses the official `tauri-apps/tauri-action@v0`
   - The action automatically uploads artifacts to the release
3. **publish-release**: Publishes the draft release (removes draft status)

The key improvement is using the official Tauri action which:
- Handles building the app correctly for each platform
- Automatically finds and uploads all artifacts
- Is maintained by the Tauri team and kept up to date

## What Changed

The previous workflow used a custom build and upload script that:
- Built with `npm run tauri build`
- Had a complex JavaScript script to find and upload artifacts
- Was prone to failure due to hardcoded paths and assumptions

The new workflow:
- Uses `tauri-apps/tauri-action@v0` for building and uploading
- Simplifies the workflow by ~200 lines
- Is more reliable and easier to maintain
