#!/bin/bash

# Setup script for local development environment

echo "Setting up Forge Frontend development environment..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# Environment variables for local development
# API Base URL - Update this to your production API URL
VITE_API_BASE=https://your-api-server.onrender.com

# Example for local development:
# VITE_API_BASE=http://localhost:8787
EOF
    echo "✅ Created .env.local file"
    echo "⚠️  Please update VITE_API_BASE with your actual API URL"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update VITE_API_BASE in .env.local with your API URL"
echo "2. Run 'npm run dev' to start development server"
echo "3. Run 'npm run build:prod' to test production build"
