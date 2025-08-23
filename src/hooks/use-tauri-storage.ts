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

// Enhanced Tauri environment detection
function isTauriEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  
  // Check multiple possible indicators for Tauri v2
  const hasIPC = !!(window as any).__TAURI_IPC__;
  const hasTauri = !!(window as any).__TAURI__;
  const hasFS = !!(window as any).__TAURI_PLUGIN_FS__;
  const hasUserAgent = typeof navigator !== "undefined" && navigator.userAgent.includes("Tauri");
  
  const isTauri = hasIPC || hasTauri || hasFS || hasUserAgent;
  
  console.log(`[RefForge] Environment detection: ${JSON.stringify({
    hasIPC,
    hasTauri, 
    hasFS,
    hasUserAgent,
    result: isTauri
  })}`);
  
  return isTauri;
}

// V2-compatible logging function with enhanced error handling
async function logToFile(message: string) {
  const logMessage = `${new Date().toISOString()}: ${message}`;
  console.log(`[RefForge] ${logMessage}`); // Always log to console for debugging
  
  if (!isTauriEnvironment()) {
    console.log("[RefForge] Not in Tauri environment, skipping file logging");
    return;
  }
  
  try {
    // Ensure log directory exists
    if (!(await exists("", { baseDir: BaseDirectory.AppLog }))) {
      console.log("[RefForge] Creating AppLog directory...");
      await mkdir("", { baseDir: BaseDirectory.AppLog, recursive: true });
      console.log("[RefForge] AppLog directory created successfully");
    }
    
    await writeTextFile(
      LOG_FILE_NAME,
      `${logMessage}\n`,
      { append: true, baseDir: BaseDirectory.AppLog }
    );
    console.log("[RefForge] Log written to file successfully");
  } catch (e) {
    console.error("[RefForge] Failed to log to file:", e);
    console.error("[RefForge] Error details:", {
      name: e instanceof Error ? e.name : 'Unknown',
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined
    });
  }
}

// V2-compatible data reading function with enhanced error handling
async function readDataFile(): Promise<AppData | null> {
  await logToFile("Attempting to read data file...");
  
  if (!isTauriEnvironment()) {
    await logToFile("Not in Tauri environment, cannot read data file");
    return null;
  }

  try {
    const fileExists = await exists(DATA_FILE_NAME, { baseDir: BaseDirectory.AppData });
    await logToFile(`Data file exists: ${fileExists}`);
    
    if (fileExists) {
      const contents = await readTextFile(DATA_FILE_NAME, {
        baseDir: BaseDirectory.AppData,
      });
      await logToFile(`Data file read successfully, length: ${contents.length} chars`);
      const parsedData = JSON.parse(contents);
      await logToFile(`Data parsed successfully: ${parsedData.projects?.length || 0} projects, ${parsedData.references?.length || 0} references`);
      return parsedData;
    } else {
      await logToFile("Data file does not exist, will need to create it");
      return null;
    }
  } catch (error: any) {
    const errorMessage = `Error reading data file: ${error.message}`;
    await logToFile(errorMessage);
    console.error("[RefForge] Failed to read data file:", error);
    console.error("[RefForge] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return null;
  }
}

// V2-compatible data writing function with enhanced error handling
async function writeDataFile(data: AppData): Promise<void> {
  await logToFile("Attempting to write data file...");
  
  if (!isTauriEnvironment()) {
    await logToFile("Not in Tauri environment, cannot write data file");
    return;
  }
  
  try {
    // Ensure app data directory exists
    const dirExists = await exists("", { baseDir: BaseDirectory.AppData });
    await logToFile(`AppData directory exists: ${dirExists}`);
    
    if (!dirExists) {
      await logToFile("Creating AppData directory...");
      await mkdir("", { baseDir: BaseDirectory.AppData, recursive: true });
      await logToFile("AppData directory created successfully");
    }
    
    const jsonData = JSON.stringify(data, null, 2);
    await logToFile(`Writing data file, size: ${jsonData.length} chars`);
    
    await writeTextFile(
      DATA_FILE_NAME,
      jsonData,
      { baseDir: BaseDirectory.AppData }
    );
    
    await logToFile(`Data file written successfully: ${data.projects?.length || 0} projects, ${data.references?.length || 0} references`);
  } catch (error: any) {
    const errorMessage = `Error writing data file: ${error.message}`;
    await logToFile(errorMessage);
    console.error("[RefForge] Failed to write data file:", error);
    console.error("[RefForge] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
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
      console.log("[RefForge] Server-side rendering, using mock data");
      setData(MOCK_DATA);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const tauriEnv = isTauriEnvironment();
    
    console.log("[RefForge] Environment detection:", {
      isTauri: tauriEnv,
      hasIPC: !!(window as any).__TAURI_IPC__,
      hasTauri: !!(window as any).__TAURI__,
      hasFS: !!(window as any).__TAURI_PLUGIN_FS__,
      userAgent: navigator.userAgent.includes("Tauri")
    });

    async function loadData() {
      try {
        await logToFile("useTauriStorage mounted. Loading data...");
        
        // Additional diagnostic information
        await logToFile(`Current environment: Node.js=${typeof process !== 'undefined'}, Browser=${typeof window !== 'undefined'}, Tauri=${tauriEnv}`);
        await logToFile(`Working directory info: ${typeof __dirname !== 'undefined' ? 'Available' : 'Not available'}`);
        
        const fileData = await readDataFile();
        
        if (!isMounted) {
          await logToFile("Component unmounted during load, aborting");
          return;
        }
        
        if (fileData) {
          await logToFile("File data found, setting state from file");
          console.log("[RefForge] Successfully loaded data from file:", {
            projects: fileData.projects?.length || 0,
            references: fileData.references?.length || 0
          });
          setData(fileData);
        } else {
          await logToFile("No file data found, initializing with mock data and writing to file");
          console.log("[RefForge] Initializing with mock data");
          // Always try to write the initial data if we're in Tauri
          if (tauriEnv) {
            await writeDataFile(MOCK_DATA);
            await logToFile("Initial mock data written to file system");
          }
          setData(MOCK_DATA);
        }
        
        setLoading(false);
        await logToFile("Data loading completed, loading state set to false");
      } catch (error: any) {
        console.error("[RefForge] Error in loadData:", error);
        await logToFile(`Error in loadData: ${error.message}`);
        await logToFile(`Error stack: ${error.stack || 'No stack trace available'}`);
        
        // Fallback to mock data on error
        if (isMounted) {
          console.log("[RefForge] Falling back to mock data due to error");
          setData(MOCK_DATA);
          setLoading(false);
        }
      }
    }

    if (tauriEnv) {
      console.log("[RefForge] Tauri environment detected, loading data from filesystem");
      loadData();
    } else {
      console.log("[RefForge] Not in Tauri environment, using mock data for development");
      setData(MOCK_DATA);
      setLoading(false);
    }

    return () => {
      console.log("[RefForge] useTauriStorage cleanup");
      logToFile("useTauriStorage unmounted.");
      isMounted = false;
    };
  }, []);

  const setStoredData = useCallback((value: SetStateAction<AppData>) => {
    setData((prevData) => {
      const newData = value instanceof Function ? value(prevData) : value;
      
      // Always try to persist changes if we're in Tauri
      if (isTauriEnvironment()) {
        console.log("[RefForge] Persisting data changes to filesystem");
        writeDataFile(newData).catch((error) => {
          console.error("[RefForge] Failed to persist data changes:", error);
        });
      } else {
        console.log("[RefForge] Not in Tauri environment, skipping filesystem persistence");
      }
      
      return newData;
    });
  }, []);

  return [data, setStoredData, loading];
}
