"use client";

import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save, open } from '@tauri-apps/plugin-dialog';
import type { Settings, Theme } from '@/types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const loadedSettings = await invoke<Settings>('get_settings');
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Fallback to default settings
      const defaultSettings: Settings = {
        version: 1,
        db_path: null,
        theme: 'system'
      };
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: Settings) => {
    try {
      await invoke('set_settings', { settings: newSettings });
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }, []);

  const updateTheme = useCallback(async (theme: Theme) => {
    if (!settings) return;
    
    const newSettings = { ...settings, theme };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const selectDatabasePath = useCallback(async (): Promise<string | null> => {
    try {
      const result = await save({
        filters: [{
          name: 'SQLite Database',
          extensions: ['db', 'sqlite', 'sqlite3']
        }],
        defaultPath: 'refforge.db',
        title: 'Select Database Location'
      });
      
      return result;
    } catch (error) {
      console.error('Failed to select database path:', error);
      return null;
    }
  }, []);

  const getDefaultDatabasePath = useCallback(async (): Promise<string | null> => {
    try {
      return await invoke<string>('get_default_db_path');
    } catch (error) {
      console.error('Failed to get default database path:', error);
      return null;
    }
  }, []);

  const updateDatabasePath = useCallback(async (dbPath: string | null) => {
    if (!settings) return;
    
    const newSettings = { ...settings, db_path: dbPath };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const useDefaultDatabasePath = useCallback(async () => {
    await updateDatabasePath(null);
  }, [updateDatabasePath]);

  const restartApp = useCallback(async () => {
    try {
      await invoke('restart_app');
    } catch (error) {
      console.error('Failed to restart app:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    updateTheme,
    selectDatabasePath,
    getDefaultDatabasePath,
    updateDatabasePath,
    useDefaultDatabasePath,
    restartApp,
    reload: loadSettings
  };
}