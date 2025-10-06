/**
 * IndexedDB persistence layer for session restore
 * Stores: uploaded video ref, selected frame timestamp, crop box, overlay transforms, export settings
 */

export interface SessionData {
  // Video/image data
  uploadedFile?: {
    name: string;
    type: string;
    size: number;
    lastModified: number;
  };
  mediaType?: "image" | "video";
  videoTimestamp?: number;

  // Canvas state
  canvasDimensions?: {
    width: number;
    height: number;
  };
  canvasScale?: number;
  selectedArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;

  // Crop data
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;

  // Overlay data
  overlays?: Array<{
    id: string;
    type: "logo" | "text";
    x: number;
    y: number;
    width: number;
    height: number;
    content: string;
    visible: boolean;
    locked: boolean;
  }>;

  // Export settings
  exportSettings?: {
    format: "image/jpeg" | "image/webp" | "image/png";
    quality: number;
  };

  // Compression settings
  compressionSettings?: {
    preset: "high" | "medium" | "low";
    quality: number;
    targetSizeMB: number;
    ssimThreshold: number;
  };

  // Metadata
  lastSaved: number;
  version: string;
}

const DB_NAME = "SnapthumbSession";
const DB_VERSION = 1;
const STORE_NAME = "session";
const SESSION_KEY = "current";

class SessionDB {
  private db: IDBDatabase | null = null;
  private isEnabled: boolean = true;

  async init(): Promise<void> {
    if (!this.isEnabled) return;

    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn("IndexedDB not available, session restore disabled");
        this.isEnabled = false;
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async saveSession(data: Partial<SessionData>): Promise<void> {
    if (!this.isEnabled || !this.db) return;

    const sessionData: SessionData = {
      ...data,
      lastSaved: Date.now(),
      version: "1.0.0",
    } as SessionData;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(sessionData, SESSION_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.warn("Failed to save session data");
        resolve(); // Don't reject, just log warning
      };
    });
  }

  async loadSession(): Promise<SessionData | null> {
    if (!this.isEnabled || !this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(SESSION_KEY);

      request.onsuccess = () => {
        const result = request.result as SessionData | undefined;
        if (result && this.isValidSession(result)) {
          resolve(result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.warn("Failed to load session data");
        resolve(null);
      };
    });
  }

  async clearSession(): Promise<void> {
    if (!this.isEnabled || !this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(SESSION_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.warn("Failed to clear session data");
        resolve();
      };
    });
  }

  private isValidSession(data: any): data is SessionData {
    return (
      data &&
      typeof data === "object" &&
      typeof data.lastSaved === "number" &&
      typeof data.version === "string"
    );
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isSessionRestoreEnabled(): boolean {
    return this.isEnabled;
  }
}

// Singleton instance
export const sessionDB = new SessionDB();

// Initialize on module load
sessionDB.init().catch(console.error);
