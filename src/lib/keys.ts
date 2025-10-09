/**
 * Global Key Listener Registry
 *
 * Singleton that registers bindings once. On HMR, clean up before re-bind.
 * Provides centralized keyboard shortcut management with automatic cleanup.
 */

export interface KeyBinding {
  /** Unique identifier for the binding */
  id: string;
  /** Key combination string (e.g., "ctrl+s", "cmd+shift+z", "escape") */
  key: string;
  /** Callback function to execute when key is pressed */
  handler: (event: KeyboardEvent) => void;
  /** Optional description for debugging/help */
  description?: string;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  /** Whether to stop propagation to other handlers */
  stopPropagation?: boolean;
  /** Optional element to scope the binding to (defaults to document) */
  element?: HTMLElement;
  /** Whether the binding is currently active */
  enabled?: boolean;
}

export interface KeyMatcher {
  /** Key name (e.g., "s", "Enter", "Escape") */
  key: string;
  /** Whether Ctrl key is required */
  ctrlKey?: boolean;
  /** Whether Alt key is required */
  altKey?: boolean;
  /** Whether Shift key is required */
  shiftKey?: boolean;
  /** Whether Meta key (Cmd on Mac) is required */
  metaKey?: boolean;
}

class KeyRegistry {
  private bindings = new Map<string, KeyBinding>();
  private listeners = new Map<string, (event: KeyboardEvent) => void>();
  private isInitialized = false;
  private documentListener?: (event: KeyboardEvent) => void;

  constructor() {
    // Handle HMR cleanup - ensure cleanup before rebind
    if (import.meta.hot) {
      import.meta.hot.accept(() => {
        console.log("🔄 Key Registry: HMR accept, cleaning up before rebind");
        this.cleanup();
      });

      import.meta.hot.dispose(() => {
        console.log("🔄 Key Registry: HMR dispose, cleaning up all bindings");
        this.cleanup();
      });
    }
  }

  /**
   * Initialize the global key listener if not already initialized
   */
  private initialize(): void {
    if (this.isInitialized) return;

    this.documentListener = (event: KeyboardEvent) => {
      // Check each binding to see if it matches
      for (const binding of this.bindings.values()) {
        if (!binding.enabled) continue;

        const element = binding.element || document;

        // Skip if event didn't originate from the scoped element or its children
        if (element !== document && !element.contains(event.target as Node)) {
          continue;
        }

        if (this.matchesBinding(event, binding)) {
          if (binding.preventDefault) {
            event.preventDefault();
          }
          if (binding.stopPropagation) {
            event.stopPropagation();
          }
          binding.handler(event);
        }
      }
    };

    document.addEventListener("keydown", this.documentListener);
    this.isInitialized = true;
  }

  /**
   * Check if a keyboard event matches a key binding
   */
  private matchesBinding(event: KeyboardEvent, binding: KeyBinding): boolean {
    const matcher = this.parseKeyString(binding.key);
    if (!matcher) return false;

    return (
      event.key === matcher.key &&
      !!event.ctrlKey === !!matcher.ctrlKey &&
      !!event.altKey === !!matcher.altKey &&
      !!event.shiftKey === !!matcher.shiftKey &&
      !!event.metaKey === !!matcher.metaKey
    );
  }

  /**
   * Parse a key string into a KeyMatcher object
   * Supports formats like: "ctrl+s", "cmd+shift+z", "escape", "Enter"
   */
  private parseKeyString(keyString: string): KeyMatcher | null {
    const parts = keyString
      .toLowerCase()
      .split("+")
      .map((part) => part.trim());
    const key = parts[parts.length - 1]!;

    const matcher: KeyMatcher = { key };

    for (let i = 0; i < parts.length - 1; i++) {
      const modifier = parts[i];
      switch (modifier) {
        case "ctrl":
          matcher.ctrlKey = true;
          break;
        case "alt":
          matcher.altKey = true;
          break;
        case "shift":
          matcher.shiftKey = true;
          break;
        case "cmd":
        case "meta":
        case "command":
          matcher.metaKey = true;
          break;
        default:
          // Invalid modifier
          return null;
      }
    }

    return matcher;
  }

  /**
   * Register a new key binding
   * Ensures clean state before registration to prevent duplicates
   */
  register(binding: KeyBinding): void {
    // Ensure clean state before registering (important for HMR)
    this.ensureCleanState();

    if (this.bindings.has(binding.id)) {
      console.warn(
        `Key binding with id "${binding.id}" already exists. Overwriting.`
      );
      this.unregister(binding.id);
    }

    // Set defaults
    const normalizedBinding: KeyBinding = {
      enabled: true,
      preventDefault: true,
      stopPropagation: false,
      ...binding,
    };

    this.bindings.set(binding.id, normalizedBinding);
    this.initialize();
  }

  /**
   * Unregister a key binding by ID
   */
  unregister(id: string): boolean {
    return this.bindings.delete(id);
  }

  /**
   * Enable or disable a key binding
   */
  setEnabled(id: string, enabled: boolean): boolean {
    const binding = this.bindings.get(id);
    if (binding) {
      binding.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Update an existing key binding
   */
  update(id: string, updates: Partial<Omit<KeyBinding, "id">>): boolean {
    const binding = this.bindings.get(id);
    if (binding) {
      Object.assign(binding, updates);
      return true;
    }
    return false;
  }

  /**
   * Get all registered bindings
   */
  getAllBindings(): KeyBinding[] {
    return Array.from(this.bindings.values());
  }

  /**
   * Get a specific binding by ID
   */
  getBinding(id: string): KeyBinding | undefined {
    return this.bindings.get(id);
  }

  /**
   * Clear all bindings
   */
  clear(): void {
    this.bindings.clear();
  }

  /**
   * Cleanup all listeners and bindings (used for HMR)
   * Ensures no duplicate listeners after HMR
   */
  cleanup(): void {
    console.log("🧹 Key Registry: Cleaning up all listeners and bindings");

    // Remove document listener if it exists
    if (this.documentListener) {
      document.removeEventListener("keydown", this.documentListener);
      this.documentListener = undefined;
    }

    // Clear all bindings and listeners
    this.bindings.clear();
    this.listeners.clear();
    this.isInitialized = false;

    console.log("✅ Key Registry: Cleanup completed");
  }

  /**
   * Ensure cleanup before rebind (for HMR scenarios)
   * This method is called to guarantee clean state before re-registering bindings
   */
  ensureCleanState(): void {
    if (this.isInitialized || this.bindings.size > 0) {
      console.log("🧹 Key Registry: Ensuring clean state before rebind");
      this.cleanup();
    }
  }

  /**
   * Get debug information about registered bindings
   */
  getDebugInfo(): { bindings: KeyBinding[]; isInitialized: boolean } {
    return {
      bindings: this.getAllBindings(),
      isInitialized: this.isInitialized,
    };
  }
}

// Export singleton instance
export const keyRegistry = new KeyRegistry();

// Export convenience functions
export const registerKey = (binding: KeyBinding) =>
  keyRegistry.register(binding);
export const unregisterKey = (id: string) => keyRegistry.unregister(id);
export const enableKey = (id: string) => keyRegistry.setEnabled(id, true);
export const disableKey = (id: string) => keyRegistry.setEnabled(id, false);
export const updateKey = (
  id: string,
  updates: Partial<Omit<KeyBinding, "id">>
) => keyRegistry.update(id, updates);
export const getAllKeys = () => keyRegistry.getAllBindings();
export const getKey = (id: string) => keyRegistry.getBinding(id);
export const clearKeys = () => keyRegistry.clear();
export const ensureCleanState = () => keyRegistry.ensureCleanState();

// Export the registry instance for advanced usage
export { KeyRegistry };
