# Authorization System

This document describes the Bearer token authorization system implemented in the Forge frontend application.

## Overview

The application now supports Bearer token authentication with the following features:

- **Authorization**: Accept `Authorization: Bearer <key>` headers
- **Tier-based access**: Valid keys get `pro` tier, invalid/missing keys get `free` tier
- **Rate limit bypass**: Pro tier users bypass rate limits
- **Payload size limits**: Pro tier gets 50MB limit, free tier gets 10MB limit
- **Response headers**: API returns `X-Forge-Tier: pro|free` header

## Environment Configuration

Add your API keys to the environment variables:

```bash
# Comma-separated list of valid API keys
VITE_FORGE_API_KEYS="key1,key2,key3"
```

## Usage

### Frontend Integration

The authorization system is automatically integrated into the API request flow:

1. **API Key Manager**: Users can enter their Bearer token in the Settings panel
2. **Automatic validation**: Keys are validated against the configured list
3. **Tier detection**: The system automatically detects if a key is valid (pro) or invalid (free)
4. **Request headers**: Valid keys are automatically included in API requests

### API Request Flow

1. User enters API key in the Settings panel
2. Key is stored in localStorage as `forge_api_key`
3. All API requests automatically include `Authorization: Bearer <key>` header
4. Backend validates the key and returns appropriate tier in `X-Forge-Tier` header
5. Frontend updates rate limits and payload size limits based on tier

### Tier-based Features

#### Free Tier

- 10MB payload size limit
- Standard rate limits
- Basic features

#### Pro Tier

- 50MB payload size limit
- Rate limit bypass
- Priority processing
- All pro features

## Implementation Details

### Key Files

- `src/lib/auth-utils.ts` - Authorization utilities and validation
- `src/components/ApiKeyManager.tsx` - UI component for key management
- `src/state/rateLimitStore.ts` - Rate limit state management with tier support
- `src/lib/forge-layer-sdk.ts` - API client with authorization headers
- `src/lib/wire-generate.ts` - Payload size validation based on tier

### API Key Validation

```typescript
import { validateApiKey } from "@/lib/auth-utils";

const authHeader = "Bearer your-api-key";
const { isValid, tier, key } = validateApiKey(authHeader);
// isValid: boolean
// tier: "free" | "pro"
// key: string | undefined
```

### Tier Management

```typescript
import { useRateLimitStore } from "@/state/rateLimitStore";

const { tier, isPro, updateTier } = useRateLimitStore();
// tier: "free" | "pro"
// isPro: boolean
// updateTier(): void - refreshes tier from localStorage
```

## Security Considerations

- API keys are stored in localStorage (client-side)
- Keys are validated against a predefined list in environment variables
- No sensitive data is exposed in the frontend code
- All API communication uses HTTPS

## Testing

To test the authorization system:

1. Set up environment variables with test API keys
2. Use the API Key Manager in Settings to enter a test key
3. Verify that pro features are enabled for valid keys
4. Check that free tier limits apply for invalid/missing keys
5. Monitor network requests to ensure proper headers are sent
