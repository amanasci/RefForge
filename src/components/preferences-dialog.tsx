"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from '@/components/theme-provider';
import { Folder, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Theme } from '@/types';

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreferencesDialog({ open, onOpenChange }: PreferencesDialogProps) {
  const { settings, selectDatabasePath, getDefaultDatabasePath, updateDatabasePath, useDefaultDatabasePath, restartApp } = useSettings();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [localTheme, setLocalTheme] = useState<Theme>(theme);
  const [localDbPath, setLocalDbPath] = useState<string>('');
  const [defaultDbPath, setDefaultDbPath] = useState<string>('');
  const [isApplying, setIsApplying] = useState(false);
  const [needsRestart, setNeedsRestart] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalTheme(theme);
      
      // Load default database path
      getDefaultDatabasePath().then((path) => {
        if (path) {
          setDefaultDbPath(path);
        }
      });

      // Set current database path
      if (settings?.db_path) {
        setLocalDbPath(settings.db_path);
      } else {
        getDefaultDatabasePath().then((path) => {
          if (path) {
            setLocalDbPath(path);
          }
        });
      }
      
      setNeedsRestart(false);
    }
  }, [open, theme, settings, getDefaultDatabasePath]);

  const handleBrowseDatabasePath = async () => {
    try {
      const selectedPath = await selectDatabasePath();
      if (selectedPath) {
        setLocalDbPath(selectedPath);
        setNeedsRestart(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to select database path. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUseDefaultPath = async () => {
    try {
      const defaultPath = await getDefaultDatabasePath();
      if (defaultPath) {
        setLocalDbPath(defaultPath);
        setNeedsRestart(settings?.db_path !== null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get default database path.',
        variant: 'destructive',
      });
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    
    try {
      // Apply theme change immediately
      if (localTheme !== theme) {
        await setTheme(localTheme);
        toast({
          title: 'Theme Updated',
          description: `Theme changed to ${localTheme}.`,
        });
      }

      // Handle database path change
      const currentDbPath = settings?.db_path || defaultDbPath;
      const newDbPath = localDbPath === defaultDbPath ? null : localDbPath;
      
      if (newDbPath !== settings?.db_path) {
        await updateDatabasePath(newDbPath);
        
        if (needsRestart) {
          // Show confirmation dialog for restart
          const confirmed = window.confirm(
            'Database location has been changed. The application will restart to connect to the new database. Continue?'
          );
          
          if (confirmed) {
            try {
              await restartApp();
            } catch (error) {
              toast({
                title: 'Restart Required',
                description: 'Please restart the application manually to use the new database location.',
                variant: 'destructive',
              });
            }
          }
        } else {
          toast({
            title: 'Database Path Updated',
            description: 'Database path has been updated.',
          });
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to apply settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancel = () => {
    setLocalTheme(theme);
    setNeedsRestart(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Preferences</DialogTitle>
          <DialogDescription>
            Configure application settings and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Theme Settings */}
          <div className="space-y-3">
            <Label htmlFor="theme" className="text-sm font-medium">
              Theme
            </Label>
            <Select value={localTheme} onValueChange={(value: Theme) => setLocalTheme(value)}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose your preferred theme. System will match your OS preference.
            </p>
          </div>

          {/* Database Path Settings */}
          <div className="space-y-3">
            <Label htmlFor="database-path" className="text-sm font-medium">
              Database Location
            </Label>
            <div className="flex gap-2">
              <Input
                id="database-path"
                value={localDbPath}
                readOnly
                placeholder="Database file path"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleBrowseDatabasePath}
                className="px-3"
              >
                <Folder className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseDefaultPath}
                className="px-3"
                title="Use Default Path"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Choose where to store your reference database. The application will restart after changing this setting.
            </p>
            
            {needsRestart && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Application restart required to apply database location change.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isApplying}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isApplying}>
            {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}