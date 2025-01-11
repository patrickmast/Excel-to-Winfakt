# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5985f879-1a41-4e6f-96b6-fc5132d262ec

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5985f879-1a41-4e6f-96b6-fc5132d262ec) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.



**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


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
