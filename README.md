# Snapthumb v1

A lightweight, client-side thumbnail creation tool that works entirely in your browser. Upload videos or images, extract frames, crop to 16:9, add overlays, and export thumbnails under 2MB.

## Features

- **Client-Only**: No server required, works offline
- **Video & Image Support**: Upload MP4, WebM, JPG, PNG files
- **Frame Extraction**: Grab perfect frames from videos
- **16:9 Cropping**: Automatic aspect ratio handling
- **Overlay System**: Add logos and text overlays
- **Export Control**: Quality slider ensures files stay under 2MB
- **Keyboard Accessible**: Full keyboard navigation and shortcuts
- **Graceful Degradation**: Handles large files without crashing

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Usage

1. **Upload**: Click the upload area or drag & drop a video/image file
2. **Crop**: Adjust the 16:9 crop area using mouse or keyboard
3. **Overlay**: Add logos and text overlays with positioning controls
4. **Export**: Choose format and quality, then download your thumbnail

## Keyboard Shortcuts

- **Arrow Keys**: Move selection/crop area
- **Shift + Arrow**: Move by 10px increments
- **Alt + Arrow**: Precision movement (0.1px)
- **Cmd/Ctrl + Z**: Undo
- **Cmd/Ctrl + Y**: Redo
- **Cmd/Ctrl + Enter**: Export thumbnail
- **Delete**: Remove selected overlay

## File Limits

- **Input Files**: Up to 200MB (graceful failure beyond this)
- **Export Size**: Automatically capped at 2MB
- **Supported Formats**: MP4, WebM, JPG, PNG, WebP

## Technical Details

- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Playwright E2E tests
- **Bundle Size**: <250KB gzipped
- **Performance**: <1.5s Time to Interactive

## Development

### Project Structure

```
src/
├── pages/           # Route components
├── components/      # UI components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
└── styles/         # Global styles
```

### Key Components

- `CanvasStage`: Main canvas for image manipulation
- `FrameGrabber`: Video frame extraction
- `Cropper`: 16:9 aspect ratio cropping
- `Overlay`: Logo and text overlay system
- `ExportBar`: Export controls and quality management

### Testing

```bash
# Run E2E tests
pnpm test

# Run tests in headed mode
pnpm test --headed

# Run specific test
pnpm test export-under-2mb
```

## Performance Targets

- ⚡ Time to Interactive: <1.5s
- 📦 Bundle Size: <250KB gzipped
- ♿ Accessibility: >90 Lighthouse score
- 📁 Export Size: ≤2MB

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT
