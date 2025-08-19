import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import axios from 'axios';

const BE_PORT = 3006;
const API_URL = `http://${location.hostname}:${BE_PORT}`;

function App() {
  const [folders, setFolders] = useState([]);
  const [currentPath, setCurrentPath] = useState('/app/images');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  console.log({selectedFolder, currentPath})
  useEffect(() => {
    fetchFolders(currentPath);
  }, [currentPath]);

  const fetchFolders = async (path) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/folders`, { params: { path } });
      setFolders(response.data.folders);
    } catch (error) {
      setMessage('Errore nel caricamento delle cartelle');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(`${currentPath}/${folder}`);
    setCurrentPath(`${currentPath}/${folder}`);
  };

  const handleConvert = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/convert`, { folder: selectedFolder });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Errore nella conversione delle immagini');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    if (parentPath) {
      setCurrentPath(parentPath);
      setSelectedFolder(parentPath);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          HEIC to JPG Converter
        </Typography>
        <Typography variant="subtitle1">Percorso corrente: {currentPath}</Typography>
        <Button variant="outlined" onClick={goBack} sx={{ mb: 2 }} disabled={currentPath === '/app/images'}>
          Torna indietro
        </Button>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {folders.map((folder) => (
              <ListItem button key={folder} onClick={() => handleFolderClick(folder)}>
                <FolderIcon sx={{ mr: 1 }} />
                <ListItemText primary={folder} />
              </ListItem>
            ))}
          </List>
        )}
        {selectedFolder && (
          <Box sx={{ mt: 2 }}>
            <Typography>Cartella selezionata: {selectedFolder}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConvert}
              disabled={loading}
              sx={{ mt: 1 }}
            >
              Converti immagini HEIC in JPG
            </Button>
          </Box>
        )}
        {message && (
          <Typography color={message.includes('Errore') ? 'error' : 'success'} sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default App;