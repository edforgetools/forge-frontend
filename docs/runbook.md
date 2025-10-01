# Forge Frontend Runbook

This document provides step-by-step instructions for local development, quality assurance, and deployment processes.

## Local Development

### Prerequisites

- Node.js >= 18
- npm or yarn package manager
- Git

### Starting the Application

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd forge-frontend
   npm install
   ```

2. **Environment setup:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local to ensure VITE_API_BASE=http://localhost:8787
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:5173

4. **Run preflight checks:**
   ```bash
   bash scripts/preflight-local.sh
   ```

## Type Checking

### Manual Type Check

```bash
npx tsc --noEmit
```

### Continuous Type Checking

```bash
npx tsc --noEmit --watch
```

## Quality Assurance Steps

### 1. Preflight Checks

Run the automated preflight script:

```bash
bash scripts/preflight-local.sh
```

This script checks:

- Node.js version (>= 18)
- Environment file presence and configuration
- TypeScript compilation
- Development server accessibility
- Accessibility testing with axe-core

### 2. Manual QA Checklist

- [ ] All features work as expected
- [ ] No console errors
- [ ] Responsive design works on mobile/tablet
- [ ] Accessibility standards met
- [ ] Performance is acceptable
- [ ] Cross-browser compatibility

### 3. Automated Testing

```bash
npm test
```

### 4. Linting

```bash
npm run lint
```

### 5. Build Verification

```bash
npm run build
npm run preview
```

## Artifact Generation

### Bundle Analysis

```bash
node scripts/analyze-bundle.js
```

### Performance Metrics

```bash
npm run build
# Check dist/ folder for generated assets
```

### Accessibility Reports

```bash
npx @axe-core/cli http://localhost:5173 --output=artifacts/accessibility-report.json
```

### SEO Validation

```bash
node scripts/validate-jsonld.js
```

## Deployment Sign-off

### Pre-deployment Checklist

- [ ] All preflight checks pass
- [ ] TypeScript compilation successful
- [ ] Build completes without errors
- [ ] Performance budget maintained
- [ ] Accessibility standards met
- [ ] SEO metadata validated
- [ ] Cross-browser testing completed

### Deployment Process

1. Ensure all changes are committed and pushed
2. Run full QA checklist
3. Generate and review artifacts
4. Deploy to staging environment
5. Perform final validation
6. Deploy to production

### Post-deployment Verification

- [ ] Application loads correctly
- [ ] All features functional
- [ ] Performance metrics within acceptable range
- [ ] Error monitoring shows no critical issues

## Troubleshooting

### Common Issues

**Node version errors:**

```bash
nvm use 18  # or install Node 18+
```

**Environment configuration:**

```bash
# Ensure .env.local exists with:
VITE_API_BASE=http://localhost:8787
```

**TypeScript errors:**

```bash
npx tsc --noEmit  # Check for type errors
```

**Build failures:**

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Emergency Procedures

### Rollback Process

1. Identify the problematic commit
2. Revert to previous stable version
3. Deploy rollback
4. Verify functionality
5. Investigate root cause

### Critical Bug Response

1. Assess impact and severity
2. Implement hotfix if necessary
3. Deploy emergency patch
4. Monitor system stability
5. Document incident and resolution
