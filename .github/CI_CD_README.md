# CI/CD Pipeline Documentation

This document provides comprehensive information about the CI/CD setup for the Forge Frontend project.

## Overview

The CI/CD pipeline consists of multiple workflows that ensure code quality, security, and reliable deployments:

- **Layer CI**: Backend integration and unit tests
- **Frontend CI**: Frontend testing, performance, and quality checks
- **Deploy**: Automated deployment to Render and Vercel
- **Artifact Publisher**: Comprehensive reporting and artifact management

## Workflows

### 1. Layer CI (`layer-ci.yml`)

**Triggers**: Push/PR to `main` or `develop`

**Jobs**:

- **Unit & Integration Tests**: Runs unit tests with coverage
- **Layer Integration**: Backend integration tests

**Key Features**:

- TypeScript type checking
- ESLint and Prettier validation
- Unit test coverage reporting
- Integration test execution
- Artifact upload for test results

### 2. Frontend CI (`frontend-ci.yml`)

**Triggers**: Push/PR to `main` or `develop`

**Jobs**:

- **Vitest**: Unit tests with coverage
- **Playwright**: End-to-end and accessibility tests
- **Lighthouse**: Performance, accessibility, and SEO audits
- **Size Limit**: Bundle size regression checks
- **Integration Tests**: Full integration testing
- **Security Audit**: Dependency vulnerability scanning

**Key Features**:

- Multi-browser testing (Chrome, Firefox, Safari)
- Performance budgets with Lighthouse CI
- Bundle size monitoring
- Accessibility compliance testing
- Security vulnerability scanning
- Comprehensive artifact collection

### 3. Deploy (`deploy.yml`)

**Triggers**: Push to `main` (production) or PR (preview)

**Jobs**:

- **Deploy to Render**: Production deployment
- **Deploy to Vercel**: Production and preview deployments
- **Notify Deployment**: Slack notifications

**Key Features**:

- Automated production deployments
- Preview deployments for PRs
- Multi-platform deployment support
- Deployment status notifications

### 4. Artifact Publisher (`artifact-publisher.yml`)

**Triggers**: Completion of Layer CI or Frontend CI workflows

**Features**:

- Comprehensive report generation
- GitHub Pages deployment
- PR comment integration
- Long-term artifact storage

## Environment Variables

### Required Secrets

#### Stripe Configuration

- `STRIPE_PUBLISHABLE_KEY`: Client-side Stripe key
- `STRIPE_SECRET_KEY`: Server-side Stripe key
- `BILLING_WEBHOOK_SECRET`: Stripe webhook verification

#### Supabase Configuration

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Client-side Supabase key
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side Supabase key

#### Application Configuration

- `PUBLIC_BASE`: Application base URL
- `ADMIN_SECRET`: Admin operations secret

#### CI/CD Secrets

- `CODECOV_TOKEN`: Coverage reporting
- `LHCI_GITHUB_APP_TOKEN`: Lighthouse CI integration
- `RENDER_SERVICE_ID`: Render deployment
- `RENDER_API_KEY`: Render API access
- `VERCEL_TOKEN`: Vercel deployment
- `VERCEL_ORG_ID`: Vercel organization
- `VERCEL_PROJECT_ID`: Vercel project
- `SLACK_WEBHOOK`: Deployment notifications

## Branch Protection

The `main` branch is protected with the following rules:

### Required Status Checks

1. Layer CI - Unit & Integration Tests
2. Layer CI - Layer Integration Tests
3. Frontend CI - Unit Tests (Vitest)
4. Frontend CI - E2E Tests (Playwright)
5. Frontend CI - Lighthouse CI
6. Frontend CI - Size Limit Check
7. Frontend CI - Integration Tests
8. Frontend CI - Security Audit

### Additional Rules

- Require branches to be up to date
- Require linear history
- Require pull request reviews (1 approval minimum)
- Require review from code owners
- Dismiss stale reviews
- Require conversation resolution

## Setup Instructions

### 1. Repository Secrets

Add the following secrets to your GitHub repository:

```bash
# Go to Settings → Secrets and variables → Actions
# Add each secret with the appropriate value
```

### 2. Branch Protection Setup

Run the setup workflow manually or use GitHub CLI:

```bash
gh workflow run setup-branch-protection.yml
```

### 3. Deployment Platform Configuration

#### Render.com

1. Connect your GitHub repository
2. Use the provided `render.yaml` configuration
3. Set environment variables in the Render dashboard

#### Vercel

1. Import your GitHub repository
2. Use the provided `vercel.json` configuration
3. Set environment variables in the Vercel dashboard

### 4. Third-party Integrations

#### Codecov

1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Add the `CODECOV_TOKEN` secret

#### Lighthouse CI

1. Install the Lighthouse CI GitHub App
2. Configure your repository
3. Add the `LHCI_GITHUB_APP_TOKEN` secret

## Monitoring and Alerts

### Build Status

- GitHub Actions dashboard provides real-time status
- Failed builds trigger notifications
- PR comments include build reports

### Performance Monitoring

- Lighthouse CI tracks performance metrics
- Size-limit prevents bundle regressions
- Coverage reports ensure test quality

### Deployment Monitoring

- Slack notifications for deployment status
- GitHub Pages for build artifacts
- Vercel/Render dashboards for deployment health

## Troubleshooting

### Common Issues

#### Build Failures

1. Check environment variables are set correctly
2. Verify all required secrets are configured
3. Review build logs for specific error messages

#### Test Failures

1. Ensure all dependencies are up to date
2. Check for flaky tests in the test suite
3. Verify test environment configuration

#### Deployment Issues

1. Check platform-specific logs (Vercel/Render)
2. Verify environment variables in deployment platforms
3. Ensure branch protection rules are not blocking deployment

### Debug Commands

```bash
# Run tests locally
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:e2e
pnpm test:a11y

# Check bundle size
pnpm size-limit

# Run Lighthouse
pnpm lighthouse

# Full CI pipeline locally
pnpm ci:full
```

## Best Practices

### Code Quality

- Always run tests before pushing
- Maintain high test coverage
- Follow linting and formatting rules
- Use meaningful commit messages

### Security

- Regularly update dependencies
- Use secure environment variable management
- Implement proper secret rotation
- Monitor for security vulnerabilities

### Performance

- Monitor bundle size changes
- Optimize for Core Web Vitals
- Use performance budgets
- Regular Lighthouse audits

### Deployment

- Use feature branches for development
- Test in preview environments
- Monitor deployment health
- Implement rollback procedures

## Support

For issues with the CI/CD pipeline:

1. Check the GitHub Actions logs
2. Review this documentation
3. Consult the troubleshooting section
4. Contact the DevOps team if needed

## Updates

This CI/CD setup is regularly updated to:

- Improve performance and reliability
- Add new testing capabilities
- Enhance security measures
- Support new deployment features

Last updated: $(date)
