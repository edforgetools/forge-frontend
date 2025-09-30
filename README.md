# Forge Frontend

A React-based frontend application for video editing and content creation tools.

## V1 Checklist

### Core Pages

- [ ] **Home page** (`/`) - All components render, no console errors
- [ ] **Free YouTube Thumbnail Tool** (`/free-youtube-thumbnail-tool`) - SEO content, tool interface functional
- [ ] **Free Podcast Caption Generator** (`/free-podcast-caption-generator`) - SEO content, caption generation works
- [ ] **Free AI Audiogram Generator** (`/free-ai-audiogram-generator`) - SEO content, audiogram tool functional
- [ ] **Clip Short Video Automatically** (`/clip-short-video-automatically`) - SEO content, clipper tool functional

### Key Features

- [ ] **Caption Generation** - Upload .txt files, generate multi-platform captions, error handling
- [ ] **Thumbnail Tool** - Image upload, text overlay, undo/redo, keyboard shortcuts, export
- [ ] **Export & Watermarks** - Free plan watermarks, pro plan removal, export limits
- [ ] **Share Buttons** - TikTok, YouTube Shorts, Instagram integration
- [ ] **Logging** - All events logged to `/api/log` (page views, exports, errors)

### Quality Assurance

- [ ] **Performance** - Pages load <3s, no memory leaks, smooth animations
- [ ] **Responsive** - Mobile (375px), tablet (768px), desktop (1920px)
- [ ] **Browser Support** - Chrome, Firefox, Safari, Edge
- [ ] **Accessibility** - Keyboard navigation, screen reader support, color contrast

### Documentation

- [ ] [Deployment Guide](DEPLOYMENT.md) - Vercel frontend, Render backend setup
- [ ] [QA Checklist](scripts/qa-checklist.md) - Detailed testing procedures
- [ ] [Metrics Documentation](METRICS.md) - AARRR framework event tracking

## Backlog

### Blog Scaffolding

- [x] **MDX Pipeline** - Configured Vite with @mdx-js/rollup for MDX support
- [x] **Blog Components** - BlogLayout, BlogList, BlogPost components ready
- [x] **Stub Posts** - Two sample MDX posts created and rendering
- [x] **Type Safety** - TypeScript types for MDX files and blog data
- [x] **Build Success** - No build warnings, compiles cleanly

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- Backend API server running on port 8787

### Environment Setup

1. Copy the environment example file:

   ```bash
   cp .env.local.example .env.local
   ```

2. The `.env.local` file contains:

   ```
   VITE_API_BASE=http://localhost:8787
   ```

3. Adjust the `VITE_API_BASE` URL if your backend is running on a different port or host.

### Running the Application

#### Development Mode

Start the frontend development server:

```bash
yarn dev
```

This will:

- Start the Vite development server (typically on http://localhost:5173)
- Display the detected API base URL in the console
- Enable hot module replacement for development

#### Running Both Frontend and Backend

To run both the frontend and backend applications:

1. **Start the Backend API** (in a separate terminal):

   ```bash
   # Navigate to your backend project directory
   cd /path/to/your/backend
   # Start the backend server (adjust command as needed)
   yarn dev
   # or
   npm run dev
   ```

2. **Start the Frontend** (in another terminal):
   ```bash
   cd /Users/edbrooks/forge-frontend
   yarn dev
   ```

The frontend will automatically connect to the backend API running on `http://localhost:8787`.

### Available Scripts

- `yarn dev` - Start development server with API base detection
- `yarn build` - Build for production
- `yarn build:prod` - Build for production with production optimizations
- `yarn preview` - Preview production build
- `yarn test` - Run tests
- `yarn type-check` - Run TypeScript type checking

### API Configuration

The application uses environment variables to configure the API endpoint:

- `VITE_API_BASE` - The base URL for the backend API
- Default: `http://localhost:8787` (for local development)
- The API base URL is displayed in the console when starting the dev server

### Project Structure

```
src/
├── app/           # Main application components
├── components/    # Reusable UI components
├── features/      # Feature-specific modules
├── lib/           # Utility libraries
├── pages/         # Page components
├── presets/       # Configuration presets
└── tools/         # Tool-specific implementations
```

### Development Notes

- The application uses Vite as the build tool
- TypeScript is configured for type safety
- Environment variables must be prefixed with `VITE_` to be accessible in the browser
- The API base URL is automatically detected and logged on startup
