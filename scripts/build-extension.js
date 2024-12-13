const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// First generate icons
require('./generate-extension-icons');

// Create build directory if it doesn't exist
const buildDir = path.join(__dirname, '../build-extension');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(buildDir, 'cal-assistant.zip'));
const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', () => {
    console.log('Chrome extension has been packaged');
    console.log('Total bytes:', archive.pointer());
});

// Handle warnings and errors
archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
        console.warn('Warning:', err);
    } else {
        throw err;
    }
});

archive.on('error', (err) => {
    throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add the extension files
const extensionDir = path.join(__dirname, '../chrome-extension');
archive.directory(extensionDir, false);

// Finalize the archive
archive.finalize();

// Install archiver if not already installed
try {
    require.resolve('archiver');
} catch (e) {
    console.log('Installing archiver package...');
    require('child_process').execSync('npm install --save-dev archiver');
    // Re-run this script after installing archiver
    require('child_process').execSync('node scripts/build-extension.js');
    process.exit(0);
}
