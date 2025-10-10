// Performance optimization utilities for better LCP and Core Web Vitals

/**
 * Preload critical resources for faster LCP
 */
export function preloadCriticalResources() {
  // Preload the main bundle
  const mainScript = document.createElement("link");
  mainScript.rel = "modulepreload";
  mainScript.href = "/src/main.tsx";
  document.head.appendChild(mainScript);

  // Preload the App component
  const appScript = document.createElement("link");
  appScript.rel = "modulepreload";
  appScript.href = "/src/App.tsx";
  document.head.appendChild(appScript);

  // Preload the Home page component
  const homeScript = document.createElement("link");
  homeScript.rel = "modulepreload";
  homeScript.href = "/src/pages/Home.tsx";
  document.head.appendChild(homeScript);
}

/**
 * Optimize images for better LCP
 */
export function optimizeImageForLCP(img: HTMLImageElement) {
  // Set loading priority for above-the-fold images
  img.loading = "eager";

  // Add fetchpriority hint for critical images
  img.setAttribute("fetchpriority", "high");

  // Ensure proper sizing to prevent layout shift
  if (!img.hasAttribute("width") || !img.hasAttribute("height")) {
    img.style.aspectRatio = "16/9";
  }
}

/**
 * Measure and report Core Web Vitals
 */
export function measureCoreWebVitals() {
  // Measure LCP
  if ("PerformanceObserver" in window) {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;

      console.log("LCP:", lastEntry.startTime);

      // Report to analytics if needed
      if (window.gtag) {
        window.gtag("event", "web_vitals", {
          name: "LCP",
          value: Math.round(lastEntry.startTime),
          event_category: "Web Vitals",
          event_label: "Largest Contentful Paint",
        });
      }
    });

    try {
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch {
      // LCP not supported in this browser
    }

    // Measure FID
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEntry & {
          processingStart: number;
        };
        console.log("FID:", fidEntry.processingStart - fidEntry.startTime);

        if (window.gtag) {
          window.gtag("event", "web_vitals", {
            name: "FID",
            value: Math.round(fidEntry.processingStart - fidEntry.startTime),
            event_category: "Web Vitals",
            event_label: "First Input Delay",
          });
        }
      });
    });

    try {
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch {
      // FID not supported in this browser
    }

    // Measure CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const clsEntry = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
        }
      });

      console.log("CLS:", clsValue);

      if (window.gtag) {
        window.gtag("event", "web_vitals", {
          name: "CLS",
          value: Math.round(clsValue * 1000),
          event_category: "Web Vitals",
          event_label: "Cumulative Layout Shift",
        });
      }
    });

    try {
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch {
      // CLS not supported in this browser
    }
  }
}

/**
 * Optimize critical rendering path
 */
export function optimizeCriticalRenderingPath() {
  // Preload critical resources
  preloadCriticalResources();

  // Optimize all images on the page
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    if (img.getBoundingClientRect().top < window.innerHeight) {
      optimizeImageForLCP(img);
    }
  });

  // Start measuring Core Web Vitals
  measureCoreWebVitals();
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if element is in viewport for lazy loading
 */
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Intersection Observer for lazy loading
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Global type declarations
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
