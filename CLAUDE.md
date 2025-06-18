# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Excel to Winfakt is a React/TypeScript application designed specifically for Winfakt users to transform CSV, Excel, and Winfakt Classic (*.soc) files into Winfakt-compatible CSV format. The app provides a visual column mapping interface with real-time preview and validation.

## Common Development Commands

```bash
# Development
npm install                  # Install dependencies (requires Node.js >=20.0.0)
npm run dev                 # Start development server (port 8080)
npm run build               # Production build with build info generation
npm run build:dev           # Development mode build
npm run preview             # Preview production build

# Testing
npm run test                # Run tests with Vitest (auto-installs jsdom)
npm run test:ci             # Run tests in CI mode
npm test -- src/path/to/test.ts  # Run a single test file

# Code Quality
npm run lint                # Run ESLint
npm run typecheck           # Run TypeScript compiler check

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
- `ConfigurationContext` - React Context for managing configuration lists and loading states

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

### Vite Build Configuration
The Vite config is optimized for modern browsers:

```typescript
build: {
  target: 'esnext',  // Modern JS target for optimal performance
  outDir: 'dist',
  chunkSizeWarningLimit: 1000
}
```

### Environment Variables
- Use `VITE_` prefix for client-side variables
- Supabase configuration is in `src/integrations/supabase/client.ts`

### Lovable Platform Integration
The project is integrated with Lovable.dev for rapid development:
- Changes made via Lovable are automatically committed
- Uses `lovable-tagger` plugin for development mode component tracking
- Development server configured for Replit and other cloud environments

### Performance Boundaries
The application is designed to handle:
- Excel files up to 100MB
- CSV files with 100,000+ rows
- Browser memory limitations may affect larger files
- Web Worker architecture prevents UI blocking during processing

### TypeScript Configuration
- Path aliases: `@/*` maps to `src/*`
- Relaxed null checks and unused parameters for rapid development
- Separate configs for app and node modules

## Testing Approach

**Vitest Configuration**:
- Uses `jsdom` environment for DOM testing (auto-installed via npm script)
- Setup file: `src/__tests__/setup.ts` with Web Worker mocks
- Test file: `src/__tests__/csv-processing.test.ts`
- jsdom is installed as optional dependency to avoid build issues

**Running Tests**:
```bash
npm run test              # Run all tests in watch mode
npm run test:ci           # Run tests once (CI mode)
npm test -- --run         # Run tests once and exit
npm test -- src/__tests__/csv-processing.test.ts  # Run specific test file
```

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

### Critical UI Rules
**Menu Items**: Must NEVER wrap to multiple lines
- Apply `white-space: nowrap` to all menu text
- Keep menu item text concise and clear
- Test all translations to ensure they don't wrap
- See `UI_RULES.md` for detailed examples

### Component Guidelines
**Component Library**: Uses shadcn/ui with PM7 UI Style Guide integration
**PM7 Components**: Migrated to PM7 UI library for consistent branding and styling
**Responsive Design**: Desktop-focused with mobile considerations
**CSS Rules**: Use `white-space: nowrap` to prevent text wrapping in menu items

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

// Access configuration context for list management
const { configurations, isLoading, refreshConfigurations } = useConfigurationContext();
```

### File Processing
```typescript
// Use Web Workers for large file processing
const worker = new Worker('/src/workers/csv-worker.ts', { type: 'module' });
```

### URL-based Configuration Loading
```typescript
// Configuration can be loaded via URL parameters
const { dossier, config } = useUrlParams();
// Automatically loads configuration when URL params change
```

### Unsaved Changes Tracking
The application tracks unsaved changes and displays indicators:
- Configuration indicator shows loading states during URL config loading
- Visual indicators for unsaved modifications
- Automatic state persistence to localStorage

## Deployment

**Vercel Configuration**:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- Node version: 18.x

**Build Process**:
1. Generate build info (timestamp, version) - runs automatically via `prebuild` script
2. Vite build with modern JS target
3. Deploy to Vercel

## Critical Implementation Details

### Web Worker Architecture
The application uses Web Workers for processing large files to prevent UI blocking:
- Worker file: `src/workers/csv-worker.ts`
- Processes data in chunks of 10,000 rows
- Uses MessageChannel for real-time progress updates
- Handles CSV, Excel, DBF, and Winfakt Classic (.soc) formats

### State Persistence
- Mapping configuration is persisted to localStorage using `useMappingReducer`
- Key: `excel-to-winfakt-state`
- Includes mappings, transforms, filters, and column order
- Automatically saves after each state change

### Configuration Sharing
- Configurations can be saved to Supabase for sharing
- Shareable via URL parameters: `?dossier=X&config=Y`
- Automatic loading when URL parameters are present
- Visual indicators for unsaved changes

### Performance Optimizations
- Large file processing in Web Worker
- Chunked data processing (10,000 rows per chunk)
- Virtual scrolling for large datasets
- Lazy loading of components

### Data Validation
- Automatic detection of decimal and thousand separators
- Header row validation and duplicate detection
- Empty row filtering
- Data type inference for columns

### ESLint Configuration
- Uses TypeScript ESLint with recommended rules
- React Hooks plugin for hook rules
- React Refresh plugin for HMR
- Disabled rules: `@typescript-eslint/no-unused-vars`

### TypeScript Configuration
- Relaxed settings for rapid development:
  - `noImplicitAny: false`
  - `strictNullChecks: false`
  - `noUnusedParameters: false`
- Path alias: `@/*` maps to `src/*`
- Separate configs for app and node environments