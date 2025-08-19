import {
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  readTextFile,
  writeTextFile,
  exists,
  mkdir,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
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

// V2-compatible logging function
async function logToFile(message: string) {
  if (typeof window === "undefined" || !window.__TAURI_IPC__) return;
  try {
    // Ensure log directory exists
    if (!(await exists("", { baseDir: BaseDirectory.AppLog }))) {
      await mkdir("", { baseDir: BaseDirectory.AppLog, recursive: true });
    }
    await writeTextFile(
      LOG_FILE_NAME,
      `${new Date().toISOString()}: ${message}\n`,
      { append: true, baseDir: BaseDirectory.AppLog }
    );
  } catch (e) {
    console.error("Failed to log to file:", e);
  }
}

// V2-compatible data reading function
async function readDataFile(): Promise<AppData | null> {
  if (typeof window === "undefined" || !window.__TAURI_IPC__) return null;

  await logToFile("Attempting to read data file.");
  try {
    if (await exists(DATA_FILE_NAME, { baseDir: BaseDirectory.AppData })) {
      const contents = await readTextFile(DATA_FILE_NAME, {
        baseDir: BaseDirectory.AppData,
      });
      await logToFile("Data file read successfully.");
      return JSON.parse(contents);
    } else {
      await logToFile("Data file does not exist.");
      return null;
    }
  } catch (error: any) {
    await logToFile(`Error reading data file: ${error.message}`);
    console.error("Failed to read data file:", error);
    return null;
  }
}

// V2-compatible data writing function
async function writeDataFile(data: AppData): Promise<void> {
  if (typeof window === "undefined" || !window.__TAURI_IPC__) return;
  await logToFile("Attempting to write data file.");
  try {
    // Ensure app data directory exists
    if (!(await exists("", { baseDir: BaseDirectory.AppData }))) {
      await mkdir("", { baseDir: BaseDirectory.AppData, recursive: true });
    }
    await writeTextFile(
      DATA_FILE_NAME,
      JSON.stringify(data, null, 2),
      { baseDir: BaseDirectory.AppData }
    );
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

    async function loadData() {
      await logToFile("useTauriStorage mounted. Loading data...");
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
        console.log("Not in Tauri environment, using mock data for development.");
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
