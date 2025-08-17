# Firebase Studio with Tauri

This is a Next.js starter project that has been configured to build as a desktop application using Tauri.

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
