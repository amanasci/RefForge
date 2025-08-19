import {
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { mockProjects, mockReferences } from "@/data/mock-data";
import type { Project, Reference } from "@/types";

interface AppData {
  projects: Project[];
  references: Reference[];
}

const DATA_FILE_NAME = "refforge-data.json";
const LOG_FILE_NAME = "debug-log.txt";

const MOCK_DATA: AppData = {
  projects: mockProjects,
  references: mockReferences,
};

async function logToFile(message: string) {
  if (typeof window === "undefined" || !window.__TAURI_IPC__) return;
  try {
    const { path, fs } = await import("@tauri-apps/api");
    const dataDir = await path.appDataDir();
    const logFilePath = await path.join(dataDir, LOG_FILE_NAME);
    const dir = await path.dirname(logFilePath);
    if (!(await fs.exists(dir))) {
      await fs.createDir(dir, { recursive: true });
    }
    await fs.writeTextFile(
      logFilePath,
      `${new Date().toISOString()}: ${message}\n`,
      { append: true }
    );
  } catch (e) {
    console.error("Failed to log to file:", e);
  }
}

async function getDataFilePath(): Promise<string | null> {
  if (typeof window === "undefined" || !window.__TAURI_IPC__) return null;
  const { path } = await import("@tauri-apps/api");
  const dataDir = await path.appDataDir();
  return path.join(dataDir, DATA_FILE_NAME);
}

async function readDataFile(): Promise<AppData | null> {
  if (typeof window === "undefined" || !window.__TAURI_IPC__) return null;

  await logToFile("Attempting to read data file.");
  try {
    const { fs } = await import("@tauri-apps/api");
    const filePath = await getDataFilePath();
    if (!filePath) return null;

    await logToFile(`Data file path: ${filePath}`);
    if (!(await fs.exists(filePath))) {
      await logToFile("Data file does not exist.");
      return null;
    }
    await logToFile("Data file exists. Reading contents.");
    const contents = await fs.readTextFile(filePath);
    await logToFile("Data file read successfully.");
    return JSON.parse(contents);
  } catch (error: any) {
    await logToFile(`Error reading data file: ${error.message}`);
    console.error("Failed to read data file:", error);
    return null;
  }
}

async function writeDataFile(data: AppData): Promise<void> {
  if (typeof window === "undefined" || !window.__TAURI_IPC__) return;
  await logToFile("Attempting to write data file.");
  try {
    const { fs, path } = await import("@tauri-apps/api");
    const filePath = await getDataFilePath();
    if (!filePath) return;

    await logToFile(`Writing to data file path: ${filePath}`);
    const dir = await path.dirname(filePath);
    if (!(await fs.exists(dir))) {
      await logToFile("Data directory does not exist. Creating it.");
      await fs.createDir(dir, { recursive: true });
    }
    await fs.writeTextFile(filePath, JSON.stringify(data, null, 2));
    await logToFile("Data file written successfully.");
  } catch (error: any) {
    await logToFile(`Error writing data file: ${error.message}`);
    console.error("Failed to write data file:", error);
  }
}

export function useTauriStorage(): [
  AppData,
  Dispatch<SetStateAction<AppData>>,
  boolean,
] {
  const [data, setData] = useState<AppData>({ projects: [], references: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setData(MOCK_DATA);
      setLoading(false);
      return;
    }

    let isMounted = true;
    logToFile("useTauriStorage mounted.");
    async function loadData() {
      await logToFile("loadData called.");
      const fileData = await readDataFile();
      if (isMounted) {
        if (fileData) {
          await logToFile("File data found, setting state.");
          setData(fileData);
        } else {
          await logToFile("No file data found, writing and setting mock data.");
          if (window.__TAURI_IPC__) {
            await writeDataFile(MOCK_DATA);
          }
          setData(MOCK_DATA);
        }
        setLoading(false);
        await logToFile("loading state set to false.");
      }
    }

    if (window.__TAURI_IPC__) {
        loadData();
    } else {
        // Not in Tauri, use mock data
        setData(MOCK_DATA);
        setLoading(false);
    }

    return () => {
      logToFile("useTauriStorage unmounted.");
      isMounted = false;
    };
  }, []);

  const setStoredData = useCallback((value: SetStateAction<AppData>) => {
    setData((prevData) => {
      const newData = value instanceof Function ? value(prevData) : value;
      if (typeof window !== "undefined" && window.__TAURI_IPC__) {
        writeDataFile(newData);
      }
      return newData;
    });
  }, []);

  return [data, setStoredData, loading];
}
