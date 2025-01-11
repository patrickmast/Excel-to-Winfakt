import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildInfo = `# Generated at ${new Date().toISOString()}
VITE_DEPLOYMENT_TIMESTAMP=${Date.now()}
`;

// Write to .env.production
fs.writeFileSync(path.join(__dirname, '..', '.env.production'), buildInfo);

console.log('Build info generated successfully!');
console.log(buildInfo);