import fs from 'fs'
import path from 'path';

_initDataFiles();

function _initDataFiles() {
    const dataDir = path.join(__dirname, 'data');

    // Check if /data directory exists, if not, create it
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('Created /data directory');
    }
}

export function readJsonFile(path) {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "[]", 'utf8'); // Create an empty JSON file
    }

    const json = fs.readFileSync(path, 'utf8');
    return JSON.parse(json);
}

export function writeJsonFile(path, data) {
    return new Promise((resolve, reject) => {
        // Ensure the file exists by creating it if necessary
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, "[]");
        }

        const json = JSON.stringify(data, null, 4);
        fs.writeFile(path, json, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}


export function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}