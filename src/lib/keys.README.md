# Global Key Listener Registry

A singleton-based keyboard shortcut management system that provides centralized key binding registration with automatic HMR cleanup.

## Features

- **Singleton Pattern**: Single global registry prevents duplicate listeners
- **HMR Safe**: Automatic cleanup on Hot Module Replacement to prevent memory leaks
- **TypeScript Support**: Full type safety with comprehensive interfaces
- **Flexible Key Matching**: Support for complex key combinations (ctrl+s, cmd+shift+z, etc.)
- **Scoped Bindings**: Bind keys to specific elements or globally
- **React Integration**: Custom hooks for easy React component integration
- **Dynamic Management**: Enable/disable bindings at runtime

## Basic Usage

### Direct Registry Usage

```typescript
import { registerKey, unregisterKey } from "@/lib/keys";

// Register a simple key binding
registerKey({
  id: "save-shortcut",
  key: "ctrl+s",
  handler: (event) => {
    console.log("Save triggered!");
    // Your save logic here
  },
  description: "Save current document",
});

// Register a more complex binding
registerKey({
  id: "toggle-theme",
  key: "cmd+shift+t",
  handler: (event) => {
    console.log("Toggle theme!");
    // Your theme toggle logic here
  },
  description: "Toggle dark/light theme",
  preventDefault: true,
  stopPropagation: true,
});

// Clean up when done
unregisterKey("save-shortcut");
```

### React Hook Usage

```typescript
import { useKeyBinding, useKeyBindings } from "@/hooks/useKeyBinding";

function MyComponent() {
  // Single key binding
  useKeyBinding({
    key: "escape",
    handler: () => {
      console.log("Escape pressed!");
      // Handle escape action
    },
    description: "Close modal",
  });

  // Multiple key bindings at once
  useKeyBindings([
    {
      key: "ctrl+z",
      handler: () => console.log("Undo"),
      description: "Undo last action",
    },
    {
      key: "ctrl+shift+z",
      handler: () => console.log("Redo"),
      description: "Redo last undone action",
    },
  ]);

  return <div>Component with key bindings</div>;
}
```

## API Reference

### KeyBinding Interface

```typescript
interface KeyBinding {
  /** Unique identifier for the binding */
  id: string;
  /** Key combination string (e.g., "ctrl+s", "cmd+shift+z", "escape") */
  key: string;
  /** Callback function to execute when key is pressed */
  handler: (event: KeyboardEvent) => void;
  /** Optional description for debugging/help */
  description?: string;
  /** Whether to prevent default browser behavior (default: true) */
  preventDefault?: boolean;
  /** Whether to stop propagation to other handlers (default: false) */
  stopPropagation?: boolean;
  /** Optional element to scope the binding to (defaults to document) */
  element?: HTMLElement;
  /** Whether the binding is currently active (default: true) */
  enabled?: boolean;
}
```

### Registry Methods

```typescript
import { keyRegistry } from '@/lib/keys';

// Register a new binding
keyRegistry.register(binding: KeyBinding): void

// Unregister a binding by ID
keyRegistry.unregister(id: string): boolean

// Enable/disable a binding
keyRegistry.setEnabled(id: string, enabled: boolean): boolean

// Update an existing binding
keyRegistry.update(id: string, updates: Partial<Omit<KeyBinding, 'id'>>): boolean

// Get all registered bindings
keyRegistry.getAllBindings(): KeyBinding[]

// Get a specific binding
keyRegistry.getBinding(id: string): KeyBinding | undefined

// Clear all bindings
keyRegistry.clear(): void

// Get debug information
keyRegistry.getDebugInfo(): { bindings: KeyBinding[]; isInitialized: boolean }
```

### Convenience Functions

```typescript
import {
  registerKey,
  unregisterKey,
  enableKey,
  disableKey,
  updateKey,
  getAllKeys,
  getKey,
  clearKeys,
} from "@/lib/keys";

// These are shortcuts for the registry methods
registerKey(binding);
unregisterKey(id);
enableKey(id);
disableKey(id);
updateKey(id, updates);
getAllKeys();
getKey(id);
clearKeys();
```

### React Hooks

```typescript
import { useKeyBinding, useKeyBindings } from '@/hooks/useKeyBinding';

// Single binding with automatic cleanup
useKeyBinding(options: UseKeyBindingOptions): void

// Multiple bindings with automatic cleanup
useKeyBindings(bindings: UseKeyBindingOptions[]): void

// Binding with dependency tracking
useKeyBindingWithDeps(
  key: string,
  handler: (event: KeyboardEvent) => void,
  deps: React.DependencyList = [],
  options: Partial<Omit<UseKeyBindingOptions, 'key' | 'handler' | 'deps'>> = {}
): void
```

## Key Combination Format

The key string supports the following format:

- Simple keys: `"a"`, `"Enter"`, `"Escape"`, `"Space"`
- Modifier combinations: `"ctrl+s"`, `"cmd+z"`, `"alt+tab"`
- Multiple modifiers: `"ctrl+shift+z"`, `"cmd+alt+shift+s"`
- Case insensitive: `"Ctrl+S"` is the same as `"ctrl+s"`

Supported modifiers:

- `ctrl` - Control key
- `alt` - Alt/Option key
- `shift` - Shift key
- `cmd` / `meta` / `command` - Command key (Mac) / Windows key

## Advanced Usage

### Scoped Bindings

```typescript
// Only trigger when a specific element has focus
const textarea = document.querySelector("textarea");
registerKey({
  id: "format-text",
  key: "ctrl+shift+f",
  handler: () => console.log("Format text!"),
  element: textarea, // Only works when textarea is focused
});
```

### Dynamic Binding Management

```typescript
class KeyboardManager {
  private bindings = new Map<string, KeyBinding>();

  addBinding(id: string, binding: Omit<KeyBinding, "id">) {
    const fullBinding: KeyBinding = { id, ...binding };
    this.bindings.set(id, fullBinding);
    registerKey(fullBinding);
  }

  removeBinding(id: string) {
    if (this.bindings.has(id)) {
      unregisterKey(id);
      this.bindings.delete(id);
    }
  }

  enableBinding(id: string) {
    keyRegistry.setEnabled(id, true);
  }

  disableBinding(id: string) {
    keyRegistry.setEnabled(id, false);
  }
}
```

### Conditional Bindings

```typescript
// Only register when certain conditions are met
function setupConditionalShortcuts(isEditing: boolean) {
  if (isEditing) {
    registerKey({
      id: "save-document",
      key: "ctrl+s",
      handler: () => console.log("Save document"),
      enabled: isEditing,
    });
  }
}
```

## HMR Integration

The registry automatically handles Hot Module Replacement:

```typescript
// In development, the registry will:
// 1. Clean up old bindings on HMR
// 2. Prevent memory leaks from duplicate listeners
// 3. Re-register bindings after module reload

// No additional setup required - it's handled automatically
```

## Debugging

```typescript
import { keyRegistry } from "@/lib/keys";

// Get debug information
const debugInfo = keyRegistry.getDebugInfo();
console.log("Active bindings:", debugInfo.bindings);

// List all bindings
debugInfo.bindings.forEach((binding) => {
  console.log(
    `${binding.id}: ${binding.key} (${binding.description || "No description"})`
  );
});
```

## Migration from Direct Event Listeners

### Before (direct event listeners)

```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      // Save logic
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, []);
```

### After (using key registry)

```typescript
useKeyBinding({
  key: "ctrl+s",
  handler: () => {
    // Save logic
  },
  description: "Save document",
});
```

## Best Practices

1. **Use descriptive IDs**: Make binding IDs unique and descriptive
2. **Add descriptions**: Help with debugging and user documentation
3. **Scope appropriately**: Use element scoping when bindings should only work in specific contexts
4. **Clean up**: Let React hooks handle cleanup automatically, or manually unregister when needed
5. **Test thoroughly**: Ensure bindings work as expected and don't conflict with browser defaults
6. **Consider accessibility**: Don't override essential browser shortcuts without good reason
