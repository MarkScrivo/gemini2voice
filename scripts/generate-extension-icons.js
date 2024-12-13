const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const inputFile = path.join(__dirname, '../public/Cal.png');
const outputDir = path.join(__dirname, '../chrome-extension/icons');

async function generateIcons() {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const size of sizes) {
        await sharp(inputFile)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toFile(path.join(outputDir, `Cal-${size}.png`));
        console.log(`Generated ${size}x${size} icon`);
    }
}

// Install sharp if not already installed
try {
    require.resolve('sharp');
} catch (e) {
    console.log('Installing sharp package...');
    require('child_process').execSync('npm install --save-dev sharp');
}

generateIcons().catch(console.error);
