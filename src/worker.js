// Cloudflare Worker for serving static assets
// This worker handles all requests and serves static files for the React SPA

export default {
  async fetch(request, env) {
    // Let all requests be handled by static assets
    // The 'not_found_handling = "single-page-application"' in wrangler.toml
    // ensures that unmatched routes return index.html for client-side routing
    return env.ASSETS.fetch(request);
  }
};