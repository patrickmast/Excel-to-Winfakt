import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

function getLatestModificationTime(dir: string): number {
  let latestTime = 0;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        const dirTime = getLatestModificationTime(filePath);
        latestTime = Math.max(latestTime, dirTime);
      }
    } else {
      latestTime = Math.max(latestTime, stat.mtimeMs);
    }
  });
  
  return latestTime;
}

export function lastModifiedPlugin(): Plugin {
  return {
    name: 'last-modified',
    configureServer(server) {
      server.middlewares.use('/api/last-modified', (_, res) => {
        try {
          const projectRoot = server.config.root;
          const latestTime = getLatestModificationTime(projectRoot);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ timestamp: latestTime }));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to get modification time' }));
        }
      });
    }
  };
}
