# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CSV Transformer Hero is a React/TypeScript application designed specifically for Winfakt users to transform CSV, Excel, and Winfakt Classic (*.soc) files into Winfakt-compatible CSV format. The app provides a visual column mapping interface with real-time preview and validation.

## Common Development Commands

```bash
# Development
npm install                  # Install dependencies
npm run dev                 # Start development server (port 8080)
npm run build               # Production build with build info generation
npm run build:dev           # Development mode build
npm run preview             # Preview production build

# Testing
npm run test                # Run tests with Vitest
npm run test:ci             # Run tests in CI mode

# Build info generation (runs automatically with build)
npm run generate-build-info  # Generate build timestamp and version info
```

## Architecture Overview

### Core Technology Stack
- **React 18** with TypeScript for the frontend
- **Vite** as build tool with SWC plugin for fast compilation
- **Tailwind CSS** + **shadcn/ui** for styling and components
- **Radix UI** primitives for accessible components
- **Supabase** for configuration storage and sharing
- **i18next** for internationalization (EN, NL, FR, TR)

### Key Features
- **Multi-format file support**: CSV, Excel (.xlsx), Winfakt Classic (.soc), DBF files
- **Visual column mapping**: Drag-and-drop interface with real-time preview
- **Configuration management**: Save, share, and reuse mapping configurations via Supabase
- **Data transformation**: Expression editor with helper functions for complex transformations
- **Internationalization**: Full i18n support with language switcher

### Application Structure

**State Management**:
- `useMappingReducer` - Centralized state management for column mappings, transforms, and filters
- `useMappingState` - Persistent state handling with localStorage
- `useConfiguration` - Configuration saving/loading via Supabase

**Core Components**:
- `ColumnMapper` - Main mapping interface with drag-and-drop
- `FileUpload` - Multi-format file upload with validation
- `ExpressionEditor` - Formula builder for data transformations
- `FilterDialog` - Compound filtering system
- `HelperFunctions` - Predefined transformation functions

**Data Processing**:
- `csv-worker.ts` - Web Worker for processing large files
- `csvUtils.ts` - CSV export and data transformation utilities
- `dbfParser.ts` - DBF file format parser

### File Processing Architecture

The app uses a Web Worker architecture for handling large files:
1. **Main Thread**: UI interactions and preview
2. **Web Worker**: Data processing and transformation
3. **Streaming**: MessageChannel for real-time progress updates

## Important Configuration

### Cloudflare Workers Deployment
The Vite config includes `target: 'esnext'` specifically for Cloudflare Workers compatibility:

```typescript
build: {
  target: 'esnext',  // Required for Cloudflare Workers
  outDir: 'dist',
  chunkSizeWarningLimit: 1000
}
```

### Environment Variables
- Use `VITE_` prefix for client-side variables
- Supabase configuration is in `src/integrations/supabase/client.ts`

### TypeScript Configuration
- Path aliases: `@/*` maps to `src/*`
- Relaxed null checks and unused parameters for rapid development
- Separate configs for app and node modules

## Testing Approach

**Vitest Configuration**:
- Uses `jsdom` environment for DOM testing
- Setup file: `src/__tests__/setup.ts` with Web Worker mocks
- Test file: `src/__tests__/csv-processing.test.ts`

**Mocking Strategy**:
- Web Workers are mocked with MessageChannel simulation
- Supabase client is mocked for offline testing
- File processing uses synthetic data for consistent testing

## Internationalization

**Language Support**: English, Dutch (default), French, Turkish
**Implementation**:
- `i18next` with browser language detection
- Translation files in `src/i18n/locales/`
- Language selection in Info dialog
- Persistent language preference in localStorage

## UI Guidelines

**Menu Items**: Must never wrap to multiple lines (see `UI_RULES.md`)
**Component Library**: Uses shadcn/ui with custom PM7 styling
**Responsive Design**: Desktop-focused with mobile considerations

## Development Patterns

### State Management
```typescript
// Use the mapping reducer for state management
const { state, setMapping, setSourceData, resetState } = useMappingReducer();
```

### Configuration Handling
```typescript
// Save configurations to Supabase
const { saveConfiguration, isSaving } = useConfiguration();
```

### File Processing
```typescript
// Use Web Workers for large file processing
const worker = new Worker('/src/workers/csv-worker.ts', { type: 'module' });
```

## Deployment

**Netlify Configuration**:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect: `/* -> /index.html`
- Node version: 18.18.0

**Build Process**:
1. Generate build info (timestamp, version)
2. Vite build with modern JS target
3. Deploy to Netlify or Cloudflare Workers