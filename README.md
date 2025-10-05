<div align="center">
  <img src="docs/logo_bkg.svg" alt="RefForge Logo" width="200" height="200">
  <h1>RefForge</h1>
</div>

RefForge is a sleek and powerful reference manager built with Next.js and Tauri, designed to help you organize, and cite your research materials with ease.

## TODO

A non-exhaustive list of things todo. Not in any specific priority order.

- [x] Feature 1: Add a new reference
- [x] Feature 2: Edit a reference
- [x] Feature 3: Delete a reference
- [x] Feature 4: Search for a reference
- [x] Feature 5: Export references
- [x] Feature 6: Import Reference from arxiv
- [x] Feature 7: Export Database
- [ ] Feature 8: Import from a .bib file
- [ ] Feature 9: Vector DB (maybe)
- [ ] Feature 10: Sync Function (drive or maybe something else)
- [x] Feature 11: Add notes
- [ ] Feature 12: Advanced filtering

## Prerequisites

Before you begin, ensure you have the following installed on your system:

-   [Node.js](https://nodejs.org/) (which includes npm)
-   [Rust](https://www.rust-lang.org/tools/install)

### System Dependencies

Tauri requires certain system dependencies to build the application.

#### Linux (Debian/Ubuntu)

```bash
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.0-dev build-essential
```

#### macOS

```bash
xcode-select --install
```

#### Windows

You will need to install the [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/). Make sure to select "Desktop development with C++" during installation.

For more detailed instructions, please refer to the [official Tauri documentation](https://tauri.app/v1/guides/getting-started/prerequisites/).

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

## Development

To run the application in development mode, which will open a native desktop window with hot-reloading for the web content, use the following command:

```bash
npm run tauri dev
```

This will:
1.  Start the Next.js development server.
2.  Compile and run the Rust backend.
3.  Open a window that displays your Next.js application.

## Building for Production

To build a production-ready, standalone desktop application, run:

```bash
npm run tauri build
```

This will create an optimized, bundled application in `src-tauri/target/release/bundle/`. The output format will depend on your operating system (e.g., `.deb` or `.AppImage` on Linux, `.dmg` on macOS, `.msi` on Windows).

## Creating Releases

RefForge uses GitHub Actions to automatically build and publish releases with artifacts for all supported platforms (Linux, macOS, Windows).

### Automated Release Process

When you push a tag starting with `v` (e.g., `v0.3.0`), the release workflow automatically:
1. Creates a draft release on GitHub
2. Builds the application for all platforms:
   - Linux: `.deb`, `.AppImage`, `.rpm`
   - macOS: `.dmg` and `.app.tar.gz` for both Intel and ARM64
   - Windows: `.msi` and `-setup.exe` for both x64 and ARM64
3. Uploads all artifacts to the release
4. Publishes the release (removes draft status)

To create a new release:

```bash
# 1. Update version in package.json and src-tauri/tauri.conf.json
# 2. Commit the changes
git add package.json src-tauri/tauri.conf.json
git commit -m "Bump version to v0.3.0"

# 3. Create and push the tag
git tag v0.3.0
git push origin v0.3.0

# 4. The workflow will automatically run and create the release
```

### Testing the Release Workflow

Before creating a real release, you can test the workflow:

```bash
# Trigger the test workflow (via GitHub Actions UI)
# Go to: https://github.com/amanasci/RefForge/actions/workflows/test-release.yml
# Click "Run workflow" and enter a test tag name
```

See [docs/release-workflow-testing.md](docs/release-workflow-testing.md) for detailed testing instructions and troubleshooting.
