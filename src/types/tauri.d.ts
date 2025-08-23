// Type declarations for Tauri V2
declare global {
  interface Window {
    __TAURI_IPC__?: boolean;
    __TAURI__?: any;
    __TAURI_PLUGIN_FS__?: any;
  }
}

export {};