# Settings & Configuration

This document outlines the structure and management of user settings in RefForge.

## Settings File

User-specific settings are stored in a `settings.json` file located in the standard application configuration directory for your operating system.

-   **Windows:** `%APPDATA%\RefForge\settings.json`
-   **macOS:** `~/Library/Application Support/RefForge/settings.json`
-   **Linux:** `~/.config/RefForge/settings.json`

### Schema

The `settings.json` file follows this structure:

```json
{
  "version": 1,
  "db_path": "/path/to/your/refforge.db",
  "theme": "system"
}
```

-   `version` (number): The version of the settings schema. This is used for handling future migrations. The current version is `1`.
-   `db_path` (string | null): The absolute path to the user's SQLite database file (`refforge.db`). If `null`, the application will use a default database in the application's data directory.
-   `theme` (string): The application theme. Can be `"system"`, `"light"`, or `"dark"`.

## Database Management

### Backup

When you change the database path in the Preferences menu, you will be prompted to create a backup of the old database. Backups are stored in a timestamped format in the following directory:

-   **Windows:** `%APPDATA%\RefForge\backups\`
-   **macOS:** `~/Library/Application Support/RefForge/backups/`
-   **Linux:** `~/.config/RefForge/backups/`

The backup filename will look like `refforge.db_2023-10-27_10-30-00.bak`.

### Restore

To restore a database from a backup:
1.  Go to `Preferences > Database`.
2.  Click the "Choose..." button.
3.  Navigate to the backup directory and select the `.bak` file you wish to restore.
4.  It is recommended to rename the file extension from `.bak` to `.db`.
5.  Click "Apply" or "OK" to save the new database path.

## Local Testing

The project includes unit, integration, and end-to-end (e2e) tests for both the frontend and backend.

### Rust Tests

To run the Rust unit tests for the Tauri backend, navigate to the `src-tauri` directory and run:

```bash
cargo test
```

### Frontend Unit Tests

The frontend components are tested using Jest and React Testing Library. To run the unit tests, use the following npm script:

```bash
npm run test:unit
```

### Frontend E2E Tests

End-to-end tests are written with Playwright and run against a production build of the Next.js application.

To run the e2e tests locally:
1.  Ensure you have a production build of the web app:
    ```bash
    npm run build
    ```
2.  Run the Playwright tests. This will automatically start the server.
    ```bash
    npm run test:e2e
    ```
    Alternatively, for a CI-like environment:
    ```bash
    npm run test:e2e:ci
    ```
