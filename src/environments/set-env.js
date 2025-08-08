const fs = require('fs');
require('dotenv').config();

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || 'http://localhost:3000'}'
};
`;

fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.log(err);
  }
  console.log(`Output generated at ${targetPath}`);
});