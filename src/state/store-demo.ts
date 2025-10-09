/**
 * Demo script showing duplicate store detection functionality
 *
 * This file demonstrates how the store system prevents duplicate instances
 * and provides warnings when duplicate creation is attempted.
 */

import { getStore, hasStore, getStoreStats, resetStore } from "./store";

// Demo function to show duplicate store detection
export function demonstrateDuplicateDetection() {
  console.log("🔍 SNAP Store Duplicate Detection Demo");
  console.log("=====================================");

  // Initial state
  console.log("\n1. Initial state:");
  console.log("Store exists:", hasStore());
  console.log("Stats:", getStoreStats());

  // First store creation
  console.log("\n2. Creating first store instance:");
  const store1 = getStore();
  console.log("Store created:", store1.isInitialized);
  console.log("Created at:", new Date(store1.createdAt).toISOString());

  // Attempt to create duplicate
  console.log("\n3. Attempting to create duplicate store:");
  const store2 = getStore();
  console.log("Same instance?", store1 === store2);
  console.log("Store exists:", hasStore());

  // Check window object
  console.log("\n4. Checking window object:");
  console.log(
    "Window store exists:",
    typeof window !== "undefined" && !!window.__SNAP_STORE__
  );
  console.log(
    "Same as internal store?",
    typeof window !== "undefined" && window.__SNAP_STORE__ === store1
  );

  // Get final stats
  console.log("\n5. Final stats:");
  const stats = getStoreStats();
  console.log("Stats:", stats);
  console.log("Store age:", stats.age ? `${stats.age}ms` : "N/A");

  // Reset for clean state
  console.log("\n6. Resetting store:");
  resetStore();
  console.log("Store exists after reset:", hasStore());

  console.log("\n✅ Demo completed!");
}

// Auto-run demo if this file is executed directly
if (
  typeof window !== "undefined" &&
  window.location?.pathname?.includes("demo")
) {
  demonstrateDuplicateDetection();
}
