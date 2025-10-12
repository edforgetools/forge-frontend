# Environment Variables and Secrets

This document outlines the required environment variables for deployment platforms.

## Required Secrets

### Core Application Secrets

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key for server-side operations
- `PUBLIC_BASE` - Base URL for the application (e.g., https://forge.app)
- `ADMIN` - Admin secret key for administrative operations

### Stripe Configuration

- `STRIPE_SECRET` - Stripe secret key for server-side operations
- `STRIPE_PRICE_PRO` - Stripe price ID for Pro tier subscription
- `STRIPE_PRICE_TEAM` - Stripe price ID for Team tier subscription
- `BILLING_WEBHOOK_SECRET` - Stripe webhook endpoint secret for billing events

### Client-Side Configuration (VITE\_ prefix for Vercel)

- `VITE_SUPABASE_URL` - Supabase project URL (build-time variable)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key for client-side operations
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key for client-side payments

### CI/CD Secrets

- `CODECOV_TOKEN` - Codecov token for coverage reporting
- `LHCI_GITHUB_APP_TOKEN` - Lighthouse CI GitHub App token for performance monitoring

## Deployment Platform Setup

### Render.com Configuration

1. **Navigate to your service settings**
2. **Go to Environment tab**
3. **Add the following environment variables:**

```bash
# Core Application
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PUBLIC_BASE=https://your-app.onrender.com
ADMIN=your-admin-secret-key

# Stripe
STRIPE_SECRET=sk_live_...
STRIPE_PRICE_PRO=price_1234567890
STRIPE_PRICE_TEAM=price_0987654321
BILLING_WEBHOOK_SECRET=whsec_...

# Build-time variables (VITE_ prefix)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# CI/CD (for build process)
CODECOV_TOKEN=your-codecov-token
LHCI_GITHUB_APP_TOKEN=your-lighthouse-ci-token
```

### Vercel Configuration

1. **Navigate to your project settings**
2. **Go to Environment Variables tab**
3. **Add the following environment variables:**

```bash
# Core Application
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PUBLIC_BASE=https://your-app.vercel.app
ADMIN=your-admin-secret-key

# Stripe
STRIPE_SECRET=sk_live_...
STRIPE_PRICE_PRO=price_1234567890
STRIPE_PRICE_TEAM=price_0987654321
BILLING_WEBHOOK_SECRET=whsec_...

# Build-time variables (VITE_ prefix for client-side)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_PUBLIC_BASE=https://your-app.vercel.app
```

## GitHub Secrets Setup

For CI/CD pipelines, add these secrets to your GitHub repository:

1. **Go to repository Settings → Secrets and variables → Actions**
2. **Add the following repository secrets:**

```bash
# CI/CD Secrets
CODECOV_TOKEN=your-codecov-token
LHCI_GITHUB_APP_TOKEN=your-lighthouse-ci-token
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID=your-render-service-id

# Optional: Integration test secrets
INTEGRATION_API_URL=https://api.your-integration.com
LAYER_API_URL=https://api.your-layer.com
LAYER_API_KEY=your-layer-api-key
```

## Security Best Practices

### Secret Management

- ✅ Use environment-specific secrets (development/staging/production)
- ✅ Rotate secrets regularly
- ✅ Use least-privilege access principles
- ✅ Never commit secrets to version control
- ✅ Use secret scanning tools

### Access Control

- ✅ Limit secret access to necessary team members
- ✅ Use service accounts where possible
- ✅ Monitor secret usage and access logs
- ✅ Implement secret expiration policies

### Validation

- ✅ Validate environment variables at startup
- ✅ Use type-safe configuration loading
- ✅ Implement fallback values for non-sensitive config
- ✅ Log configuration errors (without exposing secrets)

## Environment Variable Validation

The application validates required environment variables at startup:

```typescript
// Example validation in src/env.ts
const requiredEnvVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_STRIPE_PUBLISHABLE_KEY",
  "VITE_PUBLIC_BASE",
];

const requiredServerEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
  "STRIPE_SECRET",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_TEAM",
  "BILLING_WEBHOOK_SECRET",
  "PUBLIC_BASE",
  "ADMIN",
];

for (const envVar of [...requiredEnvVars, ...requiredServerEnvVars]) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

## Troubleshooting

### Common Issues

1. **Build failures**: Check that all required environment variables are set
2. **Runtime errors**: Verify environment variable names and values
3. **CI/CD failures**: Ensure GitHub secrets are properly configured
4. **Deployment issues**: Check platform-specific environment variable requirements

### Validation Commands

```bash
# Check environment variables locally
pnpm run verify

# Validate secrets in CI
echo "Validating environment variables..."
node -e "
  const clientRequired = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_STRIPE_PUBLISHABLE_KEY', 'VITE_PUBLIC_BASE'];
  const serverRequired = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'STRIPE_SECRET', 'STRIPE_PRICE_PRO', 'STRIPE_PRICE_TEAM', 'BILLING_WEBHOOK_SECRET', 'PUBLIC_BASE', 'ADMIN'];
  const allRequired = [...clientRequired, ...serverRequired];
  const missing = allRequired.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    process.exit(1);
  }
  console.log('All required environment variables present');
"
```
