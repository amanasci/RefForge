// Type declarations for Tauri V2
declare global {
  interface Window {
    __TAURI_IPC__?: boolean;
  }
}

export {};