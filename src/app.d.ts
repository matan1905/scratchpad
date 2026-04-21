/// <reference types="svelte" />
/// <reference types="vite/client" />

declare global {
  interface Window {
    launchQueue?: {
      setConsumer: (consumer: (launchParams: { files: FileSystemFileHandle[] }) => void) => void;
    };
  }
  interface FileSystemFileHandle {
    queryPermission?: (opts?: { mode?: 'read' | 'readwrite' }) => Promise<PermissionState>;
    requestPermission?: (opts?: { mode?: 'read' | 'readwrite' }) => Promise<PermissionState>;
  }
}

export {};
