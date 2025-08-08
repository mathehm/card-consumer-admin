const fs = require('fs');

// Try to load .env file (for local development)
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not available or .env file not found - that's ok for production
}

const targetPath = './src/environments/environment.prod.ts';

// Get API_URL from environment variables (Vercel) or fallback to localhost
const apiUrl = process.env.API_URL || 'http://localhost:3000';

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;

console.log(`Using API_URL: ${apiUrl}`);

fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.log(err);
  }
  console.log(`Output generated at ${targetPath}`);
});