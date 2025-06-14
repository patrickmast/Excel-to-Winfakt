# Excel to Winfakt

Een krachtige React/TypeScript applicatie voor het transformeren van verschillende bestandsformaten naar Winfakt-compatibele CSV bestanden.

## Overzicht

Excel to Winfakt is speciaal ontworpen voor Winfakt gebruikers om eenvoudig CSV, Excel, DBF en Winfakt Classic (*.soc) bestanden om te zetten naar het juiste Winfakt import formaat. De applicatie biedt een visuele kolom mapping interface met real-time preview en validatie.

## Hoofdfuncties

- 📁 **Multi-formaat ondersteuning**: CSV, Excel (.xlsx), DBF, Winfakt Classic (.soc)
- 🔗 **Visuele kolom mapping**: Drag & drop interface
- ⚙️ **Data transformaties**: Expression editor met helper functies
- 🔍 **Geavanceerde filtering**: Complexe filters met EN/OF logica
- 💾 **Configuratie management**: Opslaan, laden en delen van instellingen
- 🌍 **Meertalig**: Nederlands, Engels, Frans, Turks
- 📤 **Smart export**: Automatische encoding en bestandsnaam generatie

## Technologie Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite met SWC
- **UI Framework**: shadcn/ui + Tailwind CSS
- **State Management**: React Hooks + Context
- **File Processing**: Web Workers voor performance
- **Internationalization**: i18next
- **Database**: Supabase voor configuratie opslag

## Development

### Requirements

- Node.js 18+ 
- npm

### Setup

```bash
# Clone repository
git clone <repository-url>

# Navigate to project
cd excel-to-winfakt

# Install dependencies  
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server (port 8080)
npm run build        # Production build with build info
npm run build:dev    # Development mode build  
npm run preview      # Preview production build
npm run test         # Run tests with Vitest
npm run test:ci      # Run tests in CI mode
```


## Deploy to Cloudflare

When deploying to Cloudflare Workers, the Vite configuration requires the build target to be set to `esnext`:

The key change to get the deployment working in Cloudflare was adding target: 'esnext' to the build configuration, which ensures Vite builds for modern JavaScript environments like Cloudflare Workers.

For reference, here's what we changed in vite.config.ts
```typescript
// ... existing code ...
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    target: 'esnext',  // Added this line to target modern JS environments
  },
// ... existing code ...
```

This setting tells Vite to generate modern JavaScript code without transpiling to older versions, which is ideal for environments like Cloudflare Workers that support the latest JavaScript features.

- Build command: `npm ci && npm run build`
- Build output: `dist`
- Root directory:
- Build comments: `Enabled`

Envoirement variables:
- CI: `true`
- NODE_VERSION: `18`
