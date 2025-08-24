import React, { useState, useEffect, useMemo } from 'react';
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
  const [responseData, setResponseData] = useState('');
  
  useEffect(() => {
    fetchFolders(currentPath);
  }, [currentPath]);

  const fetchFolders = async (path) => {
    try {
      setLoading(true);
      const foldersResponse = await axios.get(`${API_URL}/api/folders`, { params: { path } });
      setFolders(foldersResponse.data.folders);
    } catch (error) {
      setResponseData(error.response.data);
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
      const convertResonse = await axios.post(`${API_URL}/api/convert`, { folder: selectedFolder });
      setResponseData(convertResonse.data);
    } catch (error) {
      setResponseData(error.response.data);
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

  const errorMessages = useMemo(() => responseData.errors ? (
    Array.isArray(responseData.errors) ? 
      responseData.errors.map(({message, error}, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography>{message}</Typography>
          <pre style={{whiteSpace: 'normal'}}>{JSON.stringify(error, null, 2)}</pre>
        </Box>
      )) :  <pre style={{whiteSpace: 'normal'}}>{JSON.stringify(responseData.errors, null, 2)}</pre>) : 
      null, [responseData]);

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
        {responseData && (
          <Typography color={responseData.errors ? 'error' : 'success'} sx={{ mt: 2 }}>
            {responseData.message}
            <br />
            <br />
            {errorMessages}
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default App;