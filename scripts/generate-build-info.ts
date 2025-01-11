import fs from 'fs';
import path from 'path';

// Read the package.json to get the current version
const packageJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
);

const buildInfo = `# Generated at ${new Date().toISOString()}
NEXT_PUBLIC_DEPLOYMENT_TIMESTAMP=${Date.now()}
NEXT_PUBLIC_VERSION_NUMBER=${packageJson.version}
`;

// Write to .env.production
fs.writeFileSync(path.join(process.cwd(), '.env.production'), buildInfo);

console.log('Build info generated successfully!');
console.log(buildInfo);