# Keyboard Navigation Guide for Forge Tools

## Overview

This document outlines the keyboard navigation features implemented across all Forge Tools applications to ensure full accessibility for keyboard-only users.

## Skip Links

All pages include skip links that allow users to bypass navigation and jump directly to the main content:

- **Skip to main content**: Press Tab on page load to access the skip link, then press Enter to jump to the main content area.

## Navigation Patterns

### Main Navigation

- **Tab**: Move forward through navigation links
- **Shift + Tab**: Move backward through navigation links
- **Enter/Space**: Activate focused links
- **Arrow Keys**: Navigate within grouped navigation items (where applicable)

### Tool Pages

Each tool page (Snapthumb, Captiq, Audiogram, Video Clipper) follows consistent navigation patterns:

#### Snapthumb (YouTube Thumbnail Tool)

- **Tab**: Navigate through form controls and buttons
- **Arrow Keys**: Nudge selected elements (text or overlay) by 1px
- **Shift + Arrow Keys**: Nudge selected elements by 10px
- **Space/Enter**: Activate buttons and form controls
- **Escape**: Close modals and dialogs

#### Captiq (Podcast Caption Generator)

- **Tab**: Navigate through form fields and buttons
- **Space**: Toggle checkboxes for platform selection
- **Enter**: Submit forms and activate buttons
- **Arrow Keys**: Navigate within radio button groups (where applicable)

## Form Controls

### Input Fields

All form inputs are properly labeled and accessible:

- **Tab**: Move to next form field
- **Shift + Tab**: Move to previous form field
- **Enter**: Submit forms
- **Escape**: Clear current field (where applicable)

### Buttons

All buttons have proper focus indicators and are keyboard accessible:

- **Tab**: Focus on button
- **Enter/Space**: Activate button
- **Escape**: Cancel action (where applicable)

### File Uploads

File upload controls are keyboard accessible:

- **Tab**: Focus on upload button
- **Enter/Space**: Open file dialog
- **Escape**: Cancel file selection

## Canvas Interactions (Snapthumb)

### Keyboard Controls

The thumbnail canvas supports keyboard interaction:

- **Tab**: Focus on canvas area
- **Arrow Keys**: Nudge selected elements
- **Shift + Arrow Keys**: Fine nudge selected elements
- **Space**: Select/deselect elements
- **Escape**: Deselect all elements

### Focus Management

- Canvas receives focus when tabbed to
- Visual focus indicator shows current focus
- Screen reader announces canvas purpose and available controls

## Modal Dialogs

### Navigation

- **Tab**: Move through modal controls
- **Shift + Tab**: Move backward through modal controls
- **Escape**: Close modal
- **Enter**: Confirm action
- Focus is trapped within modal when open

### Focus Management

- Focus moves to modal when opened
- Focus returns to trigger element when closed
- Focus trap prevents tabbing outside modal

## ARIA Labels and Descriptions

### Screen Reader Support

All interactive elements include appropriate ARIA labels:

- **aria-label**: Describes purpose of element
- **aria-describedby**: References help text
- **aria-labelledby**: References label element
- **role**: Defines element purpose

### Help Text

- Help text is associated with form controls
- Screen readers announce help text when element receives focus
- Help text provides context for complex interactions

## Focus Indicators

### Visual Focus

All focusable elements have visible focus indicators:

- **Ring**: 2px ring around focused element
- **Color**: Primary blue (#3b82f6) for focus ring
- **Offset**: 2px offset from element edge
- **High Contrast**: Enhanced visibility in high contrast mode

### Focus States

- **:focus-visible**: Only shows on keyboard focus
- **:focus**: Shows on all focus (mouse and keyboard)
- **Custom classes**: Additional styling for specific elements

## Keyboard Shortcuts

### Global Shortcuts

- **Alt + 1**: Jump to main content (skip link)
- **Tab**: Next focusable element
- **Shift + Tab**: Previous focusable element
- **Enter/Space**: Activate focused element
- **Escape**: Cancel current action

### Tool-Specific Shortcuts

- **Arrow Keys**: Nudge elements (Snapthumb)
- **Shift + Arrow Keys**: Fine nudge elements (Snapthumb)
- **Ctrl + Z**: Undo (Snapthumb)
- **Ctrl + Y**: Redo (Snapthumb)

## Testing Checklist

### Keyboard Navigation

- [ ] All interactive elements are reachable via Tab
- [ ] Focus order is logical and intuitive
- [ ] Focus indicators are visible and clear
- [ ] Skip links work correctly
- [ ] Modal focus trapping works
- [ ] Form submission works with keyboard only

### Screen Reader Support

- [ ] All elements have appropriate labels
- [ ] Help text is announced
- [ ] Form validation messages are announced
- [ ] Dynamic content changes are announced
- [ ] ARIA attributes are correct

### Visual Focus

- [ ] Focus indicators are visible
- [ ] Focus indicators have sufficient contrast
- [ ] Focus indicators work in high contrast mode
- [ ] Focus indicators don't interfere with content

## Browser Support

Keyboard navigation is tested and supported in:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility Standards

Implementation follows:

- WCAG 2.1 AA guidelines
- Section 508 requirements
- ARIA 1.1 specifications
- Best practices for keyboard navigation

## Contact

For accessibility issues or questions, please contact the development team or file an issue in the project repository.
