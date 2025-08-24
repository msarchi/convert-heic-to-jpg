const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const convert = require('heic-convert');

const app = express();
const PORT = 3006;

app.use(cors());
app.use(express.json());

app.get('/api/folders', async (req, res) => {
  const dirPath = req.query.path || '/app/images';
    try {
        const files = await fs.readdir(dirPath, { withFileTypes: true });
        const folders = files
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        res.json({ folders });
    } catch (error) {
        res.status(500).json({ message: 'Errore nella lettura delle cartelle', error });
    }
});

app.post('/api/convert', async (req, res) => {
  const { folder } = req.body;
    if (!folder) {
        return res.status(400).json({ message: 'Cartella non specificata', error: 'Cartella non specificata' });
    }

    const outputDir = '/app/converted';

    let responseErrors = [];
    let files;

    try {
        files = await fs.readdir(folder);
    } catch (error) {
        res.status(500).json({ message: 'Errore nella lettura delle cartelle', error });
        return;
    }
    const heicFiles = files.filter(file => file.toLowerCase().endsWith('.heic'));

    for (const file of heicFiles) {
        try{

            const inputPath = path.join(folder, file);
            const outputPath = path.join(outputDir, file.replace(/\.heic$/i, '.jpg'));
            const inputBuffer = await promisify(fs.readFile)(inputPath);
            const outputBuffer = await convert({
                buffer: inputBuffer,
                format: 'JPEG',
                quality: 1 // JPEG quality between 0 and 1
            });
            await promisify(fs.writeFile)(outputPath, outputBuffer);
        } catch (error) {
            console.log({ file, error });
            responseErrors.push({ message: `Errore nella conversione del file ${file}:`, error: JSON.stringify(error, Object.getOwnPropertyNames(error), 2) });
        }
    }

    if(responseErrors.length === 0){
        res.json({ message: `Conversione completata: ${heicFiles.length} / ${heicFiles.length} file convertiti` });
    } else {
        res.status(500).json({ message: `Conversione completata con errori: ${heicFiles.length - responseErrors.length} / ${heicFiles.length} file convertiti con successo`, errors: responseErrors });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
