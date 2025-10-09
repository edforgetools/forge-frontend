/**
 * DOM utilities for modal management and scroll locking
 */

// Extended HTMLElement interface for storing original attributes
interface ExtendedBodyElement extends HTMLElement {
  __originalRootAriaHidden?: string | null;
  __originalRootInert?: string | null;
}

// Extended HTMLStyleElement interface for msOverflowStyle
interface ExtendedHTMLStyleElement extends CSSStyleDeclaration {
  msOverflowStyle?: string;
}

/**
 * Locks/unlocks the body scroll and sets the modal state
 * @param modalOpen - Whether a modal is currently open
 */
export function lockBody(modalOpen: boolean): void {
  const body = document.body as ExtendedBodyElement;
  const root = document.getElementById("root");

  if (modalOpen) {
    // Store original attributes for restoration
    const originalRootAriaHidden = root?.getAttribute("aria-hidden");
    const originalRootInert = root?.getAttribute("inert");

    // Set modal state on body
    body.setAttribute("data-modal-open", "true");

    // Apply accessibility attributes to root
    if (root) {
      root.setAttribute("aria-hidden", "true");
      root.setAttribute("inert", "true");
    }

    // Store original values for cleanup
    body.__originalRootAriaHidden = originalRootAriaHidden;
    body.__originalRootInert = originalRootInert;
  } else {
    // Remove modal state
    body.removeAttribute("data-modal-open");

    // Restore original root attributes
    if (root) {
      const originalRootAriaHidden = body.__originalRootAriaHidden;
      const originalRootInert = body.__originalRootInert;

      if (originalRootAriaHidden === null) {
        root.removeAttribute("aria-hidden");
      } else if (originalRootAriaHidden !== undefined) {
        root.setAttribute("aria-hidden", originalRootAriaHidden);
      }

      if (originalRootInert === null) {
        root.removeAttribute("inert");
      } else if (originalRootInert !== undefined) {
        root.setAttribute("inert", originalRootInert);
      }
    }

    // Clean up stored values
    delete body.__originalRootAriaHidden;
    delete body.__originalRootInert;
  }
}

/**
 * Ensures the portal root exists in the DOM
 * @returns The portal root element
 */
export function ensurePortalRoot(): HTMLElement {
  let portalRoot = document.getElementById("portal-root");

  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.id = "portal-root";
    document.body.appendChild(portalRoot);
  }

  return portalRoot;
}

/**
 * Gets the portal root element for modal rendering
 * @returns The portal root element
 */
export function getPortalRoot(): HTMLElement | null {
  return document.getElementById("portal-root");
}

/**
 * Computes and sets the scrollbar width compensation CSS variable
 * This prevents layout shift when scrollbar disappears during modal open
 */
export function computeScrollbarWidth(): void {
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  (outer.style as ExtendedHTMLStyleElement).msOverflowStyle = "scrollbar";
  document.body.appendChild(outer);

  const inner = document.createElement("div");
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);

  document.documentElement.style.setProperty(
    "--scrollbar-comp",
    `${scrollbarWidth}px`
  );
}
