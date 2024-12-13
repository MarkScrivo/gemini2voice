const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const inputFile = path.join(__dirname, '../public/Cal.png');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
    for (const size of sizes) {
        await sharp(inputFile)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toFile(path.join(outputDir, `Cal-${size}.png`));
        console.log(`Generated ${size}x${size} icon`);
    }

    // Generate screenshot
    await sharp(inputFile)
        .resize(1280, 720, {
            fit: 'contain',
            background: { r: 28, g: 31, b: 33, alpha: 1 } // #1c1f21
        })
        .toFile(path.join(outputDir, 'screenshot.png'));
    console.log('Generated screenshot');
}

// Create package.json script if it doesn't exist
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = require(packageJsonPath);
if (!packageJson.scripts.icons) {
    packageJson.scripts.icons = 'node scripts/generate-icons.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// Install sharp if not already installed
try {
    require.resolve('sharp');
} catch (e) {
    console.log('Installing sharp package...');
    require('child_process').execSync('npm install --save-dev sharp');
}

generateIcons().catch(console.error);
