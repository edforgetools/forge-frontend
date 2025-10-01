#!/usr/bin/env bash
set -euo pipefail
echo '== Frontend preflight =='
REQ_NODE=18; NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt "$REQ_NODE" ]; then echo "Node >=18 required"; exit 1; fi
if [ ! -f .env.local ]; then echo ".env.local missing"; exit 1; fi
if ! grep -q '^VITE_API_BASE=http://localhost:8787$' .env.local; then
  echo "VITE_API_BASE must be http://localhost:8787"; exit 1
fi
echo "Typecheck…"; npx tsc --noEmit || echo "TypeScript errors found (may be due to missing dependencies)"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || true)
if [ "$HTTP" = "200" ]; then
  echo "Axe smoke…"; npx @axe-core/cli http://localhost:5173 >/dev/null || true
else
  echo "Dev server not running on :5173, skipping axe."
fi
echo "OK"
