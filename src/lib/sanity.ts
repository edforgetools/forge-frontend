/**
 * Global portal/root validator
 *
 * Validates that exactly one #root and one #portal-root exist at boot time.
 * Logs warnings and shows non-blocking banners for validation issues.
 *
 * @example
 * ```typescript
 * import { runPortalRootValidation } from '@/lib/sanity';
 *
 * // Run validation manually
 * runPortalRootValidation();
 * ```
 */

interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

interface ValidationIssue {
  type: "missing" | "duplicate" | "unexpected";
  element: "root" | "portal-root";
  count: number;
  message: string;
}

/**
 * Validates the DOM structure for required root elements
 */
export function validateRootElements(): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Check #root element
  const rootElements = document.querySelectorAll("#root");
  if (rootElements.length === 0) {
    issues.push({
      type: "missing",
      element: "root",
      count: 0,
      message: "Missing required #root element",
    });
  } else if (rootElements.length > 1) {
    issues.push({
      type: "duplicate",
      element: "root",
      count: rootElements.length,
      message: `Found ${rootElements.length} #root elements (expected exactly 1)`,
    });
  }

  // Check #portal-root element
  const portalRootElements = document.querySelectorAll("#portal-root");
  if (portalRootElements.length === 0) {
    issues.push({
      type: "missing",
      element: "portal-root",
      count: 0,
      message: "Missing required #portal-root element",
    });
  } else if (portalRootElements.length > 1) {
    issues.push({
      type: "duplicate",
      element: "portal-root",
      count: portalRootElements.length,
      message: `Found ${portalRootElements.length} #portal-root elements (expected exactly 1)`,
    });
  }

  return {
    isValid: issues.length === 0,
    issues: issues.map((issue) => issue.message),
  };
}

/**
 * Logs validation issues to console with appropriate severity
 */
export function logValidationIssues(result: ValidationResult): void {
  if (result.isValid) {
    return;
  }

  console.group("⚠️ Portal/Root Validation Issues");
  result.issues.forEach((issue) => {
    console.warn(`• ${issue}`);
  });
  console.groupEnd();

  // Log additional context for debugging
}

/**
 * Creates a non-blocking banner to display validation issues
 */
export function createValidationBanner(
  result: ValidationResult
): HTMLElement | null {
  if (result.isValid) {
    return null;
  }

  const banner = document.createElement("div");
  banner.className = "portal-validation-banner";
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--z-toast);
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #1f2937;
    padding: 12px 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    border-bottom: 2px solid #d97706;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    animation: slideDown 0.3s ease-out;
  `;

  // Add CSS animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .portal-validation-banner {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    .portal-validation-banner:hover {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }
  `;
  document.head.appendChild(style);

  const issuesList = result.issues.map((issue) => `• ${issue}`).join("\n");
  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 16px;">⚠️</span>
      <div>
        <strong>Portal/Root Validation Issues Detected</strong>
        <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">
          ${issuesList.replace(/\n/g, "<br>")}
        </div>
      </div>
      <button style="
        margin-left: auto;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        padding: 4px 8px;
        color: inherit;
        font-size: 12px;
        cursor: pointer;
      " onclick="this.parentElement.parentElement.remove()">Dismiss</button>
    </div>
  `;

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (banner.parentElement) {
      banner.style.animation = "slideDown 0.3s ease-out reverse";
      setTimeout(() => banner.remove(), 300);
    }
  }, 10000);

  return banner;
}

/**
 * Main validation function that runs at boot time
 */
export function runPortalRootValidation(): void {
  const result = validateRootElements();

  // Always log the results
  logValidationIssues(result);

  // Show banner for issues (non-blocking)
  if (!result.isValid) {
    const banner = createValidationBanner(result);
    if (banner) {
      document.body.appendChild(banner);

      // Adjust body padding to account for banner
      document.body.style.paddingTop = "60px";

      // Remove padding when banner is dismissed
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            const removedNodes = Array.from(mutation.removedNodes);
            if (
              removedNodes.some(
                (node) =>
                  node instanceof HTMLElement &&
                  node.classList.contains("portal-validation-banner")
              )
            ) {
              document.body.style.paddingTop = "";
              observer.disconnect();
            }
          }
        });
      });

      observer.observe(document.body, { childList: true });
    }
  }
}

/**
 * Development-only validation that runs more frequently
 */
export function enableDevelopmentValidation(): void {
  if (!import.meta.env.DEV) {
    return;
  }

  // Run validation on DOM mutations (for hot reloading scenarios)
  const observer = new MutationObserver((mutations) => {
    const hasStructuralChanges = mutations.some(
      (mutation) =>
        mutation.type === "childList" &&
        Array.from(mutation.addedNodes).some(
          (node) =>
            node instanceof HTMLElement &&
            (node.id === "root" || node.id === "portal-root")
        )
    );

    if (hasStructuralChanges) {
      runPortalRootValidation();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Utility function to get current root element counts
 */
export function getRootElementCounts(): { root: number; portalRoot: number } {
  return {
    root: document.querySelectorAll("#root").length,
    portalRoot: document.querySelectorAll("#portal-root").length,
  };
}

/**
 * Utility function to check if validation would pass without running full validation
 */
export function isValidationPassing(): boolean {
  const counts = getRootElementCounts();
  return counts.root === 1 && counts.portalRoot === 1;
}
