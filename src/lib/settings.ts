import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

// TypeScript types matching Rust Settings
export interface Settings {
  version: number;
  database_path: string;
  theme: string;
  last_verified?: string;
  backup_enabled: boolean;
  max_backups: number;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export interface BackupResult {
  success: boolean;
  backup_path?: string;
  message: string;
}

// Default settings
export const defaultSettings: Settings = {
  version: 1,
  database_path: 'refforge.db',
  theme: 'system',
  last_verified: undefined,
  backup_enabled: true,
  max_backups: 10,
};

// API wrapper functions
export async function getSettings(): Promise<Settings> {
  try {
    return await invoke('get_settings');
  } catch (error) {
    console.error('Failed to get settings:', error);
    return defaultSettings;
  }
}

export async function setSettings(settings: Settings): Promise<void> {
  return invoke('set_settings', { settings });
}

export async function validateDb(path: string): Promise<ValidationResult> {
  return invoke('validate_database', { path });
}

export async function backupDb(path: string): Promise<BackupResult> {
  return invoke('backup_database', { path });
}

// File dialog helper for database selection
export async function chooseDbFile(): Promise<string | null> {
  try {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'SQLite Database',
          extensions: ['db', 'sqlite', 'sqlite3'],
        },
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
    });

    return selected as string | null;
  } catch (error) {
    console.error('Failed to open file dialog:', error);
    return null;
  }
}

// Theme utilities
export function applyTheme(theme: string) {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // System theme
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

// Settings service abstraction for easier testing
export interface SettingsService {
  getSettings(): Promise<Settings>;
  setSettings(settings: Settings): Promise<void>;
  validateDb(path: string): Promise<ValidationResult>;
  backupDb(path: string): Promise<BackupResult>;
  chooseDbFile(): Promise<string | null>;
}

export class TauriSettingsService implements SettingsService {
  async getSettings(): Promise<Settings> {
    return getSettings();
  }

  async setSettings(settings: Settings): Promise<void> {
    return setSettings(settings);
  }

  async validateDb(path: string): Promise<ValidationResult> {
    return validateDb(path);
  }

  async backupDb(path: string): Promise<BackupResult> {
    return backupDb(path);
  }

  async chooseDbFile(): Promise<string | null> {
    return chooseDbFile();
  }
}

// Default service instance
export const settingsService = new TauriSettingsService();