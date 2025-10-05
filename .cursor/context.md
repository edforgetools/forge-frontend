# Scope

Client-only MVP for Snapthumb v1. No auth or cloud. Deterministic exports given same inputs. Undo/redo for overlay transforms in later step.

## QA Requirements

- No crash on 200MB input
- Export cap ≤2MB with quality slider
- Keyboard: arrows move, shift=10px, alt=precision, cmd/ctrl+z undo

## Technical Constraints

- Client-side only (no server dependencies)
- Works offline
- Deterministic exports (same inputs = same outputs)
- Graceful degradation on large files
- Keyboard accessibility parity

## Performance Targets

- Time to Interactive: <1.5s
- Bundle size: <250KB gzipped
- Accessibility: >90 Lighthouse score
- Export size: ≤2MB

## Architecture

- React + Vite + TypeScript
- Tailwind CSS for styling
- Canvas API for image processing
- File API for uploads
- No external image processing libraries
