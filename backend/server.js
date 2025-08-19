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
    res.status(500).json({ error: 'Errore nella lettura delle cartelle' });
  }
});

app.post('/api/convert', async (req, res) => {
  const { folder } = req.body;
  if (!folder) {
    return res.status(400).json({ error: 'Cartella non specificata' });
  }

  try {
    const outputDir = '/app/converted';

    const files = await fs.readdir(folder);
    const heicFiles = files.filter(file => file.toLowerCase().endsWith('.heic'));

    for (const file of heicFiles) {
      const inputPath = path.join(folder, file);
      const outputPath = path.join(outputDir, file.replace(/\.heic$/i, '.jpg'));
      const inputBuffer = await promisify(fs.readFile)(inputPath);
      const outputBuffer = await convert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 1 // JPEG quality between 0 and 1
      });
      await promisify(fs.writeFile)(outputPath, outputBuffer);
    }

    res.json({ message: `Conversione completata: ${heicFiles.length} file convertiti` });
  } catch (error) {
    console.log({error})
    res.status(500).json({ error: 'Errore nella conversione delle immagini' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
