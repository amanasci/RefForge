# RefForge Settings System

This document describes the settings and preferences system in RefForge, including where settings are stored, the schema, versioning, and how to manage database backups.

## Settings Storage Location

RefForge stores its configuration in a platform-specific application configuration directory:

### Settings File Location by Platform

- **Linux**: `~/.config/RefForge/settings.json`
- **macOS**: `~/Library/Application Support/RefForge/settings.json`
- **Windows**: `%APPDATA%\RefForge\settings.json`

The settings directory is created automatically when the application first runs.

## Settings Schema

The settings file is stored as pretty-printed JSON with the following structure:

```json
{
  "version": 1,
  "database_path": "refforge.db",
  "theme": "system",
  "last_verified": "2024-01-01T12:00:00Z",
  "backup_enabled": true,
  "max_backups": 10
}
```

### Schema Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | integer | Schema version for migrations (currently 1) |
| `database_path` | string | Path to the SQLite database file |
| `theme` | string | UI theme: "system", "light", or "dark" |
| `last_verified` | string or null | ISO timestamp of last database validation |
| `backup_enabled` | boolean | Whether to automatically backup database on path changes |
| `max_backups` | integer | Maximum number of backups to keep (1-100) |

## Schema Versioning and Migration

The settings system includes version-based migration support:

- **Version 1** (current): Initial schema with all current fields
- **Future versions**: New fields will be added with sensible defaults
- **Migration process**: When loading settings, older versions are automatically migrated to the current schema

### Migration Strategy

1. Settings are loaded and the version field is checked
2. If the version is older than the current version, migration logic runs
3. Missing fields are added with default values
4. The version field is updated to the current version
5. Settings are saved with the new schema

## Database Management

### Database Path Configuration

- The `database_path` setting specifies the location of the SQLite database file
- Can be absolute or relative path
- Defaults to `refforge.db` in the current directory
- Use the Preferences dialog to change the database location with file picker

### Database Validation

The settings system includes database validation functionality:

- **Validation**: Tests if a database file exists and is accessible
- **SQLite Check**: Opens the database and runs a harmless `PRAGMA` query
- **Last Verified**: Tracks when the database was last successfully validated
- **UI Feedback**: Shows validation results in the Preferences dialog

### Backup System

RefForge automatically backs up your database when changing database paths:

#### Backup Location
Backups are stored in a platform-specific directory:
- **Linux**: `~/.config/RefForge/backups/`
- **macOS**: `~/Library/Application Support/RefForge/backups/`
- **Windows**: `%APPDATA%\RefForge\backups\`

#### Backup Naming
Backups use timestamped filenames:
```
original_filename_YYYYMMDD_HHMMSS.bak
```
Example: `refforge_20240315_143022.bak`

#### Backup Management
- Automatic backups are created when changing database paths (if `backup_enabled` is true)
- Manual backups can be triggered through the API
- The system keeps up to `max_backups` files (configurable, default: 10)
- Older backups are automatically removed when the limit is exceeded

## Theme System

RefForge supports three theme modes:

- **System**: Follows the operating system's dark/light mode preference
- **Light**: Always uses light theme
- **Dark**: Always uses dark theme

Theme changes are applied immediately when settings are saved.

## API Reference

### Rust Backend Functions

```rust
// Core settings functions
pub fn read_settings(path: Option<PathBuf>) -> Result<Settings, Box<dyn std::error::Error>>
pub fn write_settings(settings: &Settings) -> Result<(), Box<dyn std::error::Error>>
pub fn default_settings() -> Settings

// Database operations
pub fn validate_db(path: &str) -> ValidationResult
pub fn backup_db(path: &str) -> Result<BackupResult, Box<dyn std::error::Error>>

// Tauri commands
get_settings() -> Result<Settings, String>
set_settings(settings: Settings) -> Result<(), String>
validate_database(path: String) -> ValidationResult
backup_database(path: String) -> Result<BackupResult, String>
```

### Frontend TypeScript API

```typescript
// Settings operations
async function getSettings(): Promise<Settings>
async function setSettings(settings: Settings): Promise<void>

// Database operations
async function validateDb(path: string): Promise<ValidationResult>
async function backupDb(path: string): Promise<BackupResult>

// UI helpers
async function chooseDbFile(): Promise<string | null>
function applyTheme(theme: string): void
```

## Testing

### Running Tests Locally

#### Unit Tests (Jest)
```bash
npm run test:unit
```

#### End-to-End Tests (Playwright)
```bash
npm run test:e2e
```

#### Rust Tests
```bash
cd src-tauri
cargo test
```

### Test Coverage

#### Frontend Tests
- Settings library functions
- Preferences component behavior
- Theme application
- File dialog integration

#### Backend Tests
- Settings read/write operations
- Database validation
- Backup creation
- Error handling

#### E2E Tests
- Preferences dialog interaction
- Settings persistence
- Database path changes
- Theme switching

## Troubleshooting

### Common Issues

#### Settings Not Persisting
- Check file permissions in the settings directory
- Verify the settings directory exists and is writable
- Check for disk space issues

#### Database Validation Failing
- Ensure the database file exists and is not corrupted
- Check file permissions on the database file
- Try opening the database with a SQLite client

#### Backup Failures
- Verify backup directory permissions
- Check available disk space
- Ensure source database file is not locked

### Reset Settings to Defaults

To reset RefForge settings to defaults:

1. Close RefForge completely
2. Delete the settings.json file from the appropriate platform directory
3. Restart RefForge - it will recreate default settings

### Manual Backup/Restore

#### Creating Manual Backups
```bash
# Copy your database file to a safe location
cp /path/to/refforge.db /backup/location/refforge_backup.db
```

#### Restoring from Backup
1. Close RefForge
2. Copy your backup file to desired location
3. Open RefForge Preferences
4. Change database path to your backup file location
5. Click "Test" to verify the database

## Future Enhancements

Planned improvements to the settings system:

- **Cloud Sync**: Optional cloud storage for settings and database
- **Import/Export**: Settings and database export/import functionality
- **Database Encryption**: Optional database encryption with keychain integration
- **Multiple Profiles**: Support for multiple user profiles
- **Advanced Backup**: Incremental backups and backup scheduling