import { createServer } from "http";
import crypto from "crypto";

const PORT = 3001;

// Cache to simulate caching behavior
const cache = new Map();

// Recursively sort object keys for consistent hashing
function sortKeys(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = sortKeys(obj[key]);
    });
  return sorted;
}

// Generate deterministic hash based on payload
function generateDeterminismHash(payload) {
  const sortedPayload = sortKeys(payload);
  const payloadString = JSON.stringify(sortedPayload);
  return crypto
    .createHash("sha256")
    .update(payloadString)
    .digest("hex")
    .substring(0, 16);
}

// Simulate processing delay (50-100ms for first call, 0-20ms for cached)
function simulateProcessingDelay(isCached) {
  const delay = isCached ? Math.random() * 20 : 50 + Math.random() * 50;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Parse JSON body
async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Health endpoint
    if (req.method === "GET" && req.url === "/health") {
      sendJson(res, 200, { status: "ok", service: "mock-forge-layer" });
      return;
    }

    // Version endpoint
    if (req.method === "GET" && req.url === "/version") {
      sendJson(res, 200, {
        version: "1.0.0-mock",
        service: "mock-forge-layer",
      });
      return;
    }

    // Cache stats endpoint
    if (req.method === "GET" && req.url === "/cache/stats") {
      const stats = {
        cacheSize: cache.size,
        entries: Array.from(cache.entries()).map(([key, value]) => ({
          key: key.substring(0, 50) + "...",
          determinismHash: value.determinismHash,
          timestamp: value.timestamp,
        })),
      };
      sendJson(res, 200, stats);
      return;
    }

    // Clear cache endpoint
    if (req.method === "DELETE" && req.url === "/cache") {
      cache.clear();
      sendJson(res, 200, { message: "Cache cleared" });
      return;
    }

    // Thumb endpoint with caching and determinism
    if (req.method === "POST" && req.url === "/forge/thumb") {
      const payload = await parseJsonBody(req);

      // Generate cache key based on payload (using same sorting as hash generation)
      const sortedPayload = sortKeys(payload);
      const cacheKey = JSON.stringify(sortedPayload);
      const isCached = cache.has(cacheKey);

      // Generate deterministic hash
      const determinismHash = generateDeterminismHash(payload);

      // Simulate processing delay (cached calls are faster)
      await simulateProcessingDelay(isCached);

      // Store in cache if not already cached
      if (!isCached) {
        cache.set(cacheKey, {
          determinismHash,
          timestamp: Date.now(),
          data: `mock-thumbnail-data-${determinismHash}`,
        });
      }

      const cachedResult = cache.get(cacheKey);

      // Return response
      const response = {
        determinismHash: cachedResult.determinismHash,
        data: cachedResult.data,
        cached: isCached,
        timestamp: cachedResult.timestamp,
        processingTime: isCached ? "fast" : "normal",
      };

      sendJson(res, 200, response);

      console.log(
        `Thumb request - Cached: ${isCached}, Hash: ${determinismHash}`
      );
      return;
    }

    // 404 for other routes
    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    console.error("Error processing request:", error);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Mock Forge Layer API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Thumb endpoint: http://localhost:${PORT}/forge/thumb`);
  console.log(`Cache stats: http://localhost:${PORT}/cache/stats`);
});
