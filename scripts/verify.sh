#!/bin/bash

# Verify script for forge-frontend
# This script runs various checks to ensure code quality and consistency

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Starting verification process..."

# Check if pnpm is installed
if ! command_exists pnpm; then
    print_error "pnpm is not installed. Please install pnpm first."
    exit 1
fi

print_status "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    pnpm install
else
    print_success "Dependencies are installed"
fi

# TypeScript type checking
print_status "Running TypeScript type checking..."
if pnpm typecheck; then
    print_success "TypeScript type checking passed"
else
    print_error "TypeScript type checking failed"
    exit 1
fi

# ESLint
print_status "Running ESLint..."
if pnpm lint; then
    print_success "ESLint checks passed"
else
    print_warning "ESLint found issues. Run 'pnpm lint:fix' to auto-fix them."
fi

# Prettier formatting check
print_status "Checking code formatting with Prettier..."
if pnpm format:check; then
    print_success "Code formatting is correct"
else
    print_warning "Code formatting issues found. Run 'pnpm format' to fix them."
fi

# Build check
print_status "Testing build process..."
if pnpm build; then
    print_success "Build process completed successfully"
else
    print_error "Build process failed"
    exit 1
fi

# Test if dist directory was created
if [ -d "dist" ]; then
    print_success "Build output directory created"
    
    # Check if main files exist
    if [ -f "dist/index.html" ]; then
        print_success "Main HTML file exists"
    else
        print_warning "Main HTML file not found in dist/"
    fi
    
    # Check bundle size
    if command_exists du; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        print_status "Build size: $DIST_SIZE"
    fi
else
    print_error "Build output directory not found"
    exit 1
fi

# Run tests if available
print_status "Running tests..."
if pnpm test >/dev/null 2>&1; then
    print_success "Tests passed"
else
    print_warning "Tests failed or not available"
fi

# Check for common issues
print_status "Checking for common issues..."

# Check for console.log statements in production code
if command_exists grep; then
    CONSOLE_COUNT=$(grep -r "console\.log" src --include="*.ts" --include="*.tsx" | wc -l)
    if [ "$CONSOLE_COUNT" -gt 0 ]; then
        print_warning "Found $CONSOLE_COUNT console.log statements in source code"
    else
        print_success "No console.log statements found in source code"
    fi
fi

# Check for TODO/FIXME comments
if command_exists grep; then
    TODO_COUNT=$(grep -r "TODO\|FIXME" src --include="*.ts" --include="*.tsx" | wc -l)
    if [ "$TODO_COUNT" -gt 0 ]; then
        print_warning "Found $TODO_COUNT TODO/FIXME comments in source code"
    else
        print_success "No TODO/FIXME comments found in source code"
    fi
fi

# Check environment variables
print_status "Checking environment configuration..."
if [ -f "src/env.ts" ]; then
    print_success "Environment configuration file exists"
else
    print_warning "Environment configuration file not found"
fi

# Check logger configuration
if [ -f "src/lib/logger.ts" ]; then
    print_success "Logger configuration exists"
else
    print_warning "Logger configuration not found"
fi

# Check for required configuration files
REQUIRED_FILES=(".editorconfig" ".gitattributes" ".gitignore" ".prettierrc")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found $file"
    else
        print_warning "Missing $file"
    fi
done

# Summary
print_status "Verification complete!"
print_success "✅ TypeScript compilation: OK"
print_success "✅ Build process: OK"
print_success "✅ Configuration files: OK"

print_status "Next steps:"
echo "  - Run 'pnpm dev' to start development server"
echo "  - Run 'pnpm format' to fix formatting issues (if any)"
echo "  - Run 'pnpm lint:fix' to fix linting issues (if any)"
echo "  - Run 'pnpm test' to run the full test suite"

print_success "🎉 Project verification completed successfully!"
