# Snapthumb MVP

A modern thumbnail creation tool built with React, TypeScript, and Canvas API. Upload videos or images, capture frames, crop to 16:9, add overlays, and export optimized thumbnails under 2MB.

## 🚀 Features

- **Video & Image Support**: Upload MP4, WebM, JPG, PNG, WebP files
- **Frame Extraction**: Extract frames from videos at any timestamp
- **Smart Cropping**: Auto-crop to perfect 16:9 aspect ratio
- **Overlay System**: Add text and logo overlays with drag & drop
- **Export Optimization**: Automatic quality adjustment to stay under 2MB
- **Keyboard Shortcuts**: Full keyboard accessibility
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠 Tech Stack

- **React 19** - Modern React with concurrent features
- **TypeScript** - Strict type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Framer Motion** - Smooth animations and transitions
- **Canvas API** - Client-side image processing
- **Playwright** - End-to-end testing

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck

# Run tests
npm run test
```

## 🎯 Usage

### Basic Workflow

1. **Upload Media**: Click the upload area to select a video or image
2. **Frame Selection**: For videos, use the timeline scrubber to select the perfect frame
3. **Crop**: Use the 16:9 cropper to frame your thumbnail
4. **Add Overlays**: Add text or logo overlays with drag & drop positioning
5. **Export**: Choose format and quality, then export your optimized thumbnail

### Keyboard Shortcuts

- **Arrow Keys**: Move selected overlay (1px steps)
- **Shift + Arrow**: Move overlay in 10px steps
- **Alt + Arrow**: Precision movement (0.1px steps)
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Y**: Redo
- **Delete**: Remove selected overlay
- **Ctrl/Cmd + Enter**: Export thumbnail

## 🏗 Project Structure

```
src/
├── components/          # React components
│   ├── CanvasStage.tsx  # Main canvas with overlay rendering
│   ├── FrameGrabber.tsx # File upload and video scrubbing
│   ├── Cropper.tsx      # 16:9 crop controls
│   ├── Overlay.tsx      # Overlay management
│   └── ExportBar.tsx    # Export controls and validation
├── hooks/               # Custom React hooks
│   ├── useCanvas.ts     # Canvas state management
│   └── useOverlay.ts    # Overlay state and history
├── lib/                 # Core utilities
│   ├── image.ts         # Image processing and export
│   ├── video.ts         # Video frame extraction
│   └── download.ts      # File download utilities
├── pages/               # Application pages
│   ├── index.tsx        # Landing page
│   └── app.tsx          # Main editor
└── styles/
    └── globals.css      # Global styles and Tailwind
```

## 🔧 Configuration

### Environment Variables

No environment variables required for basic functionality.

### Build Configuration

- **Bundle Size**: Optimized to stay under 250KB gzip
- **Performance**: TTI < 1.5s on modern devices
- **Accessibility**: WCAG 2.1 AA compliant

## 🧪 Testing

### E2E Tests

```bash
# Run all tests
npm run test

# Run specific test file
npx playwright test basic.spec.ts

# Run with UI
npx playwright test --ui
```

### Test Coverage

- Component rendering and interaction
- File upload and processing
- Keyboard accessibility
- Responsive design
- Export functionality
- Error handling

## 📊 Performance Metrics

- **Bundle Size**: 122.62 KB gzipped (well under 250KB limit)
- **Build Time**: ~1.5s for production build
- **Type Safety**: 100% TypeScript coverage
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build outputs to the `dist/` directory and can be deployed to any static hosting service.

### Recommended Hosting

- **Vercel** - Zero-config deployment
- **Netlify** - Static site hosting
- **GitHub Pages** - Free hosting for open source
- **AWS S3** - Scalable object storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the existing issues
2. Create a new issue with detailed information
3. Include browser version and error messages

## 🔮 Roadmap

- [ ] Logo upload functionality
- [ ] Advanced text styling options
- [ ] Batch processing
- [ ] Cloud storage integration
- [ ] Advanced export formats
- [ ] Template system
- [ ] Collaborative editing

---

Built with ❤️ using modern web technologies.
