# Branch Protection Configuration

This document outlines the required branch protection rules for the `main` branch.

## Required Checks

The following CI checks must pass before merging to `main`:

### Frontend CI Pipeline

- [ ] Build
- [ ] Typecheck
- [ ] Unit Tests
- [ ] Playwright Tests
- [ ] Lighthouse CI
- [ ] Size Limit Check
- [ ] Frontend CI Status

### Layer CI Pipeline

- [ ] Build
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] Playwright Tests
- [ ] Layer CI Status

## Branch Protection Rules

### Required Status Checks

1. **Frontend CI - Build**
2. **Frontend CI - Typecheck**
3. **Frontend CI - Unit Tests**
4. **Frontend CI - Playwright Tests**
5. **Frontend CI - Lighthouse CI**
6. **Frontend CI - Size Limit Check**
7. **Frontend CI Status**
8. **Layer CI - Build**
9. **Layer CI - Unit Tests**
10. **Layer CI - Integration Tests**
11. **Layer CI - Playwright Tests**
12. **Layer CI Status**

### Additional Protection Rules

- [ ] Require branches to be up to date before merging
- [ ] Require linear history
- [ ] Restrict pushes that create files larger than 100MB
- [ ] Require pull request reviews before merging
- [ ] Require review from code owners
- [ ] Dismiss stale reviews when new commits are pushed
- [ ] Require conversation resolution before merging

## Setting Up Branch Protection

### Via GitHub CLI

```bash
# Set up branch protection for main branch
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Frontend CI - Build","Frontend CI - Typecheck","Frontend CI - Unit Tests","Frontend CI - Playwright Tests","Frontend CI - Lighthouse CI","Frontend CI - Size Limit Check","Frontend CI Status","Layer CI - Build","Layer CI - Unit Tests","Layer CI - Integration Tests","Layer CI - Playwright Tests","Layer CI Status"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"require_last_push_approval":true}' \
  --field restrictions='{"users":[],"teams":[]}' \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

### Via GitHub Web Interface

1. Go to repository Settings → Branches
2. Click "Add rule" or edit existing rule for `main`
3. Configure the following:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1 required)
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require review from code owners
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require linear history
   - ✅ Include administrators
   - ✅ Allow force pushes: ❌
   - ✅ Allow deletions: ❌

## Emergency Bypass

In case of emergencies, administrators can temporarily disable branch protection:

```bash
# Temporarily disable protection (emergency only)
gh api repos/:owner/:repo/branches/main/protection \
  --method DELETE

# Re-enable protection after emergency
# (Re-run the protection setup command above)
```

## Monitoring

Monitor branch protection compliance through:

- GitHub repository insights
- CI/CD pipeline status
- Pull request review metrics
- Code coverage reports
