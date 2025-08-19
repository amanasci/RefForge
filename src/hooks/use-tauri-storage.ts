import { useState, useEffect, useCallback } from 'react';
import { fs, path } from '@tauri-apps/api';
import { mockProjects, mockReferences } from '@/data/mock-data';
import type { Project, Reference } from '@/types';

interface AppData {
  projects: Project[];
  references: Reference[];
}

const DATA_FILE_NAME = 'refforge-data.json';
const LOG_FILE_NAME = 'debug-log.txt';

const MOCK_DATA: AppData = {
  projects: mockProjects,
  references: mockReferences,
};

async function logToFile(message: string) {
  try {
    const dataDir = await path.appDataDir();
    const logFilePath = await path.join(dataDir, LOG_FILE_NAME);
    const dir = await path.dirname(logFilePath);
    if (!await fs.exists(dir)) {
      await fs.createDir(dir, { recursive: true });
    }
    await fs.writeTextFile(logFilePath, `${new Date().toISOString()}: ${message}\n`, { append: true });
  } catch (e) {
    console.error("Failed to log to file:", e);
  }
}

async function getDataFilePath(): Promise<string> {
  const dataDir = await path.appDataDir();
  return path.join(dataDir, DATA_FILE_NAME);
}

async function readDataFile(): Promise<AppData | null> {
  await logToFile('Attempting to read data file.');
  try {
    const filePath = await getDataFilePath();
    await logToFile(`Data file path: ${filePath}`);
    if (!await fs.exists(filePath)) {
      await logToFile('Data file does not exist.');
      return null;
    }
    await logToFile('Data file exists. Reading contents.');
    const contents = await fs.readTextFile(filePath);
    await logToFile('Data file read successfully.');
    return JSON.parse(contents);
  } catch (error: any) {
    await logToFile(`Error reading data file: ${error.message}`);
    console.error("Failed to read data file:", error);
    return null;
  }
}

async function writeDataFile(data: AppData): Promise<void> {
  await logToFile('Attempting to write data file.');
  try {
    const filePath = await getDataFilePath();
    await logToFile(`Writing to data file path: ${filePath}`);
    const dir = await path.dirname(filePath);
    if (!await fs.exists(dir)) {
      await logToFile('Data directory does not exist. Creating it.');
      await fs.createDir(dir, { recursive: true });
    }
    await fs.writeTextFile(filePath, JSON.stringify(data, null, 2));
    await logToFile('Data file written successfully.');
  } catch (error: any) {
    await logToFile(`Error writing data file: ${error.message}`);
    console.error("Failed to write data file:", error);
  }
}

export function useTauriStorage(): [AppData, (data: AppData) => void, boolean] {
  const [data, setData] = useState<AppData>(MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    logToFile('useTauriStorage mounted.');
    async function loadData() {
      await logToFile('loadData called.');
      const fileData = await readDataFile();
      if (isMounted) {
        if (fileData) {
          await logToFile('File data found, setting state.');
          setData(fileData);
        } else {
          await logToFile('No file data found, writing mock data.');
          await writeDataFile(MOCK_DATA);
        }
        setLoading(false);
        await logToFile('loading state set to false.');
      }
    }
    loadData();
    return () => {
      logToFile('useTauriStorage unmounted.');
      isMounted = false;
    };
  }, []);

  const setStoredData = useCallback((newData: AppData) => {
    logToFile('setStoredData called.');
    setData(newData);
    writeDataFile(newData);
  }, []);

  return [data, setStoredData, loading];
}
