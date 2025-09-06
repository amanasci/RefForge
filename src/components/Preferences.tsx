"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Database, Palette, Settings as SettingsIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Settings, ValidationResult, BackupResult, settingsService, applyTheme, SettingsService } from '@/lib/settings';

interface PreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settingsServiceProp?: SettingsService; // For testing
}

interface StatusMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

export function Preferences({ open, onOpenChange, settingsServiceProp }: PreferencesProps) {
  const [originalSettings, setOriginalSettings] = useState<Settings | null>(null);
  const [draftSettings, setDraftSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [testingDb, setTestingDb] = useState(false);
  
  const service = settingsServiceProp || settingsService;

  // Load settings when dialog opens
  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settings = await service.getSettings();
      setOriginalSettings(settings);
      setDraftSettings({ ...settings });
      setStatusMessage(null);
      setValidationResult(null);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: `Failed to load settings: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChooseDbFile = async () => {
    try {
      const path = await service.chooseDbFile();
      if (path && draftSettings) {
        setDraftSettings({ ...draftSettings, database_path: path });
        setValidationResult(null); // Clear previous validation
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: `Failed to select database file: ${error}`,
      });
    }
  };

  const handleTestDb = async () => {
    if (!draftSettings?.database_path) return;
    
    setTestingDb(true);
    try {
      const result = await service.validateDb(draftSettings.database_path);
      setValidationResult(result);
      
      if (result.valid) {
        // Update last verified timestamp
        setDraftSettings({
          ...draftSettings,
          last_verified: new Date().toISOString(),
        });
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        message: `Validation failed: ${error}`,
      });
    } finally {
      setTestingDb(false);
    }
  };

  const handleApply = async () => {
    if (!draftSettings) return;
    
    setLoading(true);
    try {
      // If database path changed, offer to backup current database
      if (originalSettings && originalSettings.database_path !== draftSettings.database_path) {
        await handleDbChangeWithBackup();
      }
      
      await service.setSettings(draftSettings);
      setOriginalSettings({ ...draftSettings });
      
      // Apply theme immediately
      applyTheme(draftSettings.theme);
      
      setStatusMessage({
        type: 'success',
        message: 'Settings saved successfully!',
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: `Failed to save settings: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDbChangeWithBackup = async () => {
    if (!originalSettings || !draftSettings) return;
    
    if (originalSettings.backup_enabled && originalSettings.database_path) {
      try {
        const backupResult = await service.backupDb(originalSettings.database_path);
        if (!backupResult.success) {
          throw new Error(backupResult.message);
        }
        setStatusMessage({
          type: 'info',
          message: `Previous database backed up to: ${backupResult.backup_path}`,
        });
      } catch (error) {
        // Continue with save even if backup fails, but warn user
        setStatusMessage({
          type: 'error',
          message: `Warning: Failed to backup previous database: ${error}`,
        });
      }
    }
  };

  const handleOk = async () => {
    await handleApply();
    if (statusMessage?.type !== 'error') {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (originalSettings) {
      setDraftSettings({ ...originalSettings });
    }
    setStatusMessage(null);
    setValidationResult(null);
    onOpenChange(false);
  };

  const handleReset = () => {
    if (originalSettings) {
      setDraftSettings({ ...originalSettings });
      setStatusMessage(null);
      setValidationResult(null);
    }
  };

  if (!draftSettings) {
    return null;
  }

  const formatLastVerified = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Preferences
          </DialogTitle>
          <DialogDescription>
            Configure your RefForge settings and preferences.
          </DialogDescription>
        </DialogHeader>

        {statusMessage && (
          <Alert className={statusMessage.type === 'error' ? 'border-red-500' : statusMessage.type === 'success' ? 'border-green-500' : 'border-blue-500'}>
            {statusMessage.type === 'error' ? (
              <XCircle className="h-4 w-4" />
            ) : statusMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{statusMessage.message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="database" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Database Location</CardTitle>
                <CardDescription>
                  Choose the SQLite database file for storing your references.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="database-path">Database Path</Label>
                    <Input
                      id="database-path"
                      value={draftSettings.database_path}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, database_path: e.target.value })
                      }
                      placeholder="Path to your SQLite database file"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleChooseDbFile}
                    className="shrink-0"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Choose
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleTestDb}
                    disabled={!draftSettings.database_path || testingDb}
                    className="shrink-0"
                  >
                    {testingDb ? 'Testing...' : 'Test'}
                  </Button>
                </div>

                {validationResult && (
                  <Alert className={validationResult.valid ? 'border-green-500' : 'border-red-500'}>
                    {validationResult.valid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{validationResult.message}</AlertDescription>
                  </Alert>
                )}

                <div className="text-sm text-muted-foreground">
                  <strong>Last Verified:</strong> {formatLastVerified(draftSettings.last_verified)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Choose how RefForge looks and feels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={draftSettings.theme}
                    onValueChange={(value) =>
                      setDraftSettings({ ...draftSettings, theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup Settings</CardTitle>
                <CardDescription>
                  Configure automatic database backups.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="backup-enabled"
                    checked={draftSettings.backup_enabled}
                    onCheckedChange={(checked) =>
                      setDraftSettings({ ...draftSettings, backup_enabled: checked })
                    }
                  />
                  <Label htmlFor="backup-enabled">Enable automatic backups</Label>
                </div>

                <div>
                  <Label htmlFor="max-backups">Maximum Backups to Keep</Label>
                  <Input
                    id="max-backups"
                    type="number"
                    min="1"
                    max="100"
                    value={draftSettings.max_backups}
                    onChange={(e) =>
                      setDraftSettings({
                        ...draftSettings,
                        max_backups: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={loading}>
              {loading ? 'Saving...' : 'Apply'}
            </Button>
            <Button onClick={handleOk} disabled={loading}>
              OK
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}