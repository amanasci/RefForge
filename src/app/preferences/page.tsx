"use client";

import * as React from "react";
import {
  getSettings,
  setSettings,
  validateDb,
  backupDb,
  chooseDbPath,
  onSettingsUpdate,
  Settings,
} from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DatabaseTab } from "@/components/preferences/database-tab";
import { AppearanceTab } from "@/components/preferences/appearance-tab";

export default function PreferencesPage() {
  const [originalSettings, setOriginalSettings] = React.useState<Settings | null>(null);
  const [draftSettings, setDraftSettings] = React.useState<Settings | null>(null);
  const [isDirty, setIsDirty] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    getSettings().then((settings) => {
      setOriginalSettings(settings);
      setDraftSettings(settings);
      applyTheme(settings.theme);
    });

    const unlisten = onSettingsUpdate((settings) => {
        setOriginalSettings(settings);
        setDraftSettings(settings);
        applyTheme(settings.theme);
        toast({ title: "Settings updated", description: "Settings were updated from another source." });
    });

    return () => {
        unlisten.then(f => f());
    }
  }, [toast]);

  React.useEffect(() => {
    if (originalSettings && draftSettings) {
      setIsDirty(JSON.stringify(originalSettings) !== JSON.stringify(draftSettings));
    } else {
      setIsDirty(false);
    }
  }, [originalSettings, draftSettings]);

  const applyTheme = (theme: string) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  const handleApply = async () => {
    if (!draftSettings) return;

    if (
      originalSettings?.db_path &&
      draftSettings.db_path &&
      originalSettings.db_path !== draftSettings.db_path
    ) {
      const shouldBackup = window.confirm(
        "You have changed the database path. Would you like to create a backup of the old database before proceeding?"
      );
      if (shouldBackup) {
        const result = await backupDb(originalSettings.db_path);
        toast({
          title: result.ok ? "Backup Successful" : "Backup Failed",
          description: result.message,
        });
      }
    }

    await setSettings(draftSettings);
    setOriginalSettings(draftSettings);
    toast({ title: "Settings Saved", description: "Your preferences have been updated." });
    applyTheme(draftSettings.theme);
  };

  const handleOk = async () => {
    await handleApply();
  };

  const handleCancel = () => {
    if (originalSettings) {
        setDraftSettings(originalSettings);
        applyTheme(originalSettings.theme);
    }
  };

  const handleReset = async () => {
    const defaultSettings: Settings = {
      version: 1,
      db_path: null,
      theme: "system",
    };
    setDraftSettings(defaultSettings);
  };

  const handleChooseDbPath = async () => {
    const path = await chooseDbPath();
    if (path && draftSettings) {
      setDraftSettings({ ...draftSettings, db_path: path });
    }
  };

  const handleTestDb = async () => {
    if (draftSettings?.db_path) {
      const result = await validateDb(draftSettings.db_path);
      toast({
        title: result.ok ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.ok ? "default" : "destructive",
      });
    } else {
        toast({
            title: "No Database Path",
            description: "Please select a database file first.",
            variant: "destructive",
        })
    }
  };

  if (!draftSettings) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div className="flex flex-1 flex-col h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur-sm">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-headline font-bold text-primary truncate">
          Preferences
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <Tabs defaultValue="database" className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          <TabsContent value="database">
            <DatabaseTab
                draftSettings={draftSettings}
                onChooseDbFile={handleChooseDbPath}
                onTestDb={handleTestDb}
            />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceTab
                draftSettings={draftSettings}
                onThemeChange={(theme) => setDraftSettings({ ...draftSettings, theme })}
            />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="flex justify-end gap-2 p-4 border-t bg-background">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <div className="flex-grow" />
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleApply} disabled={!isDirty}>
          Apply
        </Button>
        <Button onClick={handleOk} disabled={!isDirty}>
          OK
        </Button>
      </footer>
    </div>
  );
}
