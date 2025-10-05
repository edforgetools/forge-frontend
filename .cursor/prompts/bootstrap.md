# Bootstrap Instructions

You are scaffolding forge-frontend. Generate config and stubs as listed. Keep code minimal and typed. Leave clear TODOs. Do not pull extra deps beyond React, React-DOM, TypeScript, Vite, Tailwind, PostCSS, Autoprefixer, @vitejs/plugin-react, Playwright, eslint + @typescript-eslint, lucide-react, framer-motion, class-variance-authority, tailwind-merge, radix-ui primitives (for shadcn).

## Key Requirements

1. All components must be typed with TypeScript
2. Keyboard handlers scaffolded in all interactive components
3. Clear TODO comments for implementation
4. Minimal working shell that can be built and run
5. Export functionality stubbed with 2MB limit awareness

## File Structure

```
src/
├── pages/
│   ├── index.tsx (landing page)
│   └── app.tsx (editor shell)
├── components/
│   ├── CanvasStage.tsx
│   ├── FrameGrabber.tsx
│   ├── Cropper.tsx
│   ├── Overlay.tsx
│   └── ExportBar.tsx
├── hooks/
│   ├── useCanvas.ts
│   └── useOverlay.ts
├── lib/
│   ├── image.ts
│   ├── video.ts
│   └── download.ts
└── styles/
    └── globals.css
```

## Implementation Notes

- Use React hooks for state management
- Canvas operations should be async where possible
- File size validation before processing
- Keyboard shortcuts for all major operations
- Error boundaries for graceful failure
