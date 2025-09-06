import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { listen } from '@tauri-apps/api/event';

export interface Settings {
  version: number;
  db_path: string | null;
  theme: string;
}

export interface ValidationResult {
  ok: boolean;
  message: string;
}

export interface BackupResult {
  ok: boolean;
  message: string;
  path?: string;
}

export const getSettings = async (): Promise<Settings> => {
  return await invoke('get_settings');
};

export const setSettings = async (settings: Settings): Promise<void> => {
  await invoke('set_settings', { settings });
};

export const validateDb = async (path: string): Promise<ValidationResult> => {
  return await invoke('validate_db', { path });
};

export const backupDb = async (path: string): Promise<BackupResult> => {
  return await invoke('backup_db', { path });
};

export const chooseDbFile = async (): Promise<string | null> => {
  const result = await open({
    filters: [{ name: 'SQLite Databases', extensions: ['db', 'sqlite', 'sqlite3'] }],
    multiple: false,
  });
  if (typeof result === 'string') {
    return result;
  }
  return null;
};

export const onSettingsUpdate = async (callback: (settings: Settings) => void) => {
  return await listen<Settings>('settings-updated', (event) => {
    callback(event.payload);
  });
};
