const https = require('https');
const fs = require('fs');
const path = require('path');

// Ensure the target directory exists
const dir = './src/assets/images';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Download function with redirect handling
function downloadImage(url, filename) {
  const filepath = path.join(dir, filename);
  const file = fs.createWriteStream(filepath);

  const request = https.get(url, (response) => {
    // Handle redirects
    if (response.statusCode > 300 && response.statusCode < 400 && response.headers.location) {
      https.get(response.headers.location, (res) => {
        res.pipe(file);
      }).on('error', (err) => {
        fs.unlink(filepath, () => {});
        console.error(`Error downloading ${filename} (redirect):`, err.message);
      });
    } else {
      response.pipe(file);
    }

    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${filename} to ${dir}`);
    });
  }).on('error', (err) => {
    fs.unlink(filepath, () => {});
    console.error(`Error downloading ${filename}:`, err.message);
  });
}

// Download payment method logos
downloadImage(
  'https://www.logo.wine/a/logo/Banco_Mercantil/Banco_Mercantil-Logo.wine.svg',
  'logo-mercantil.svg'
);

downloadImage(
  'https://www.logo.wine/a/logo/Zelle_(payment_service)/Zelle_(payment_service)-Logo.wine.svg',
  'logo-zelle.svg'
);

downloadImage(
  'https://www.logo.wine/a/logo/Binance/Binance-Logo.wine.svg',
  'logo-binance.svg'
);
