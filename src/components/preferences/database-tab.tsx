import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from '@/lib/settings';

interface DatabaseTabProps {
  draftSettings: Settings;
  onChooseDbFile: () => void;
  onTestDb: () => void;
}

export function DatabaseTab({ draftSettings, onChooseDbFile, onTestDb }: DatabaseTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Settings</CardTitle>
        <CardDescription>
          Choose the location of your SQLite database file.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="db-path">Database Path</Label>
          <div className="flex gap-2">
            <Input
              id="db-path"
              readOnly
              value={draftSettings.db_path || "Not set"}
            />
            <Button variant="outline" onClick={onChooseDbFile}>
              Choose...
            </Button>
          </div>
        </div>
        <Button onClick={onTestDb}>Test Connection</Button>
      </CardContent>
    </Card>
  );
}
