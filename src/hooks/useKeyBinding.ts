/**
 * React hook for managing key bindings with the global key registry
 */

import { useEffect, useRef } from "react";
import { registerKey, unregisterKey, KeyBinding } from "@/lib/keys";

export interface UseKeyBindingOptions {
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
  /** Dependencies array for the handler function */
  deps?: React.DependencyList;
}

/**
 * Hook to register a key binding that automatically cleans up on unmount
 */
export function useKeyBinding(options: UseKeyBindingOptions): void {
  const {
    key,
    handler,
    description,
    preventDefault = true,
    stopPropagation = false,
    element,
    enabled = true,
    deps = [],
  } = options;

  // Generate a unique ID based on the key and description
  const bindingId = useRef<string | undefined>(undefined);

  // Create a stable reference to the handler
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    // Generate unique ID for this binding
    const id = `${key}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)}`;
    bindingId.current = id;

    const binding: KeyBinding = {
      id,
      key,
      handler: (event) => handlerRef.current(event),
      description,
      preventDefault,
      stopPropagation,
      element,
      enabled,
    };

    registerKey(binding);

    return () => {
      if (bindingId.current) {
        unregisterKey(bindingId.current);
      }
    };
  }, [
    key,
    description,
    preventDefault,
    stopPropagation,
    element,
    enabled,
    ...deps,
  ]);
}

/**
 * Hook to register multiple key bindings at once
 */
export function useKeyBindings(bindings: UseKeyBindingOptions[]): void {
  useEffect(() => {
    const registeredIds: string[] = [];

    bindings.forEach((options, index) => {
      const {
        key,
        handler,
        description,
        preventDefault = true,
        stopPropagation = false,
        element,
        enabled = true,
      } = options;

      const id = `batch-${index}-${key}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 11)}`;
      registeredIds.push(id);

      const binding: KeyBinding = {
        id,
        key,
        handler,
        description,
        preventDefault,
        stopPropagation,
        element,
        enabled,
      };

      registerKey(binding);
    });

    return () => {
      registeredIds.forEach((id) => unregisterKey(id));
    };
  }, [bindings]);
}

/**
 * Hook for registering key bindings with automatic dependency tracking
 * This version recreates bindings when dependencies change
 */
export function useKeyBindingWithDeps(
  key: string,
  handler: (event: KeyboardEvent) => void,
  deps: React.DependencyList = [],
  options: Partial<Omit<UseKeyBindingOptions, "key" | "handler" | "deps">> = {}
): void {
  useKeyBinding({
    key,
    handler,
    deps,
    ...options,
  });
}
