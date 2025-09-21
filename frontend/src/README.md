# Frontend Structure

This document describes the refactored frontend structure with proper routing and layout management.

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── Home.tsx
│   └── About.tsx
├── layout/             # Layout components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Footer component
│   ├── Sidebar.tsx     # Dashboard sidebar
│   └── index.ts        # Layout exports
├── router/             # Routing configuration
│   └── index.tsx       # Route definitions and router
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types
├── App.tsx             # Main app component
└── index.tsx           # App entry point
```

## Layout System

The layout system supports three different layout types:

### 1. Default Layout
- Includes header, main content area, and footer
- Used for most pages (Home, About, etc.)

### 2. Minimal Layout
- Clean layout with minimal styling
- Only main content area
- Useful for landing pages or simple forms

### 3. Dashboard Layout
- Includes sidebar navigation, header, and footer
- Designed for dashboard/admin pages
- Sidebar contains navigation items

## Adding New Routes

To add a new route:

1. Create your component in the `components/` directory
2. Add the route configuration to `router/index.tsx`:

```typescript
{
  path: '/new-page',
  element: NewComponent,
  layout: 'default', // or 'minimal' or 'dashboard'
  title: 'New Page - XMUS CRM'
}
```

## Layout Types

- `default`: Standard layout with header and footer
- `minimal`: Clean layout without header/footer
- `dashboard`: Full dashboard layout with sidebar

## Component Exports

All components use named exports for better tree-shaking and clarity:

```typescript
export const ComponentName: React.FC = () => {
  // component implementation
};
```
