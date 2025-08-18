import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import axios from 'axios';

function App() {
  const [treeData, setTreeData] = useState([]);
  const [currentPath, setCurrentPath] = useState('/app/images');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [expanded, setExpanded] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFolders(currentPath);
  }, [currentPath]);

  const fetchFolders = async (path, parentNodeId = 'root') => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/folders`, { params: { path } });
      const folders = response.data.folders.map((folder, index) => ({
        id: `${parentNodeId}-${index}`,
        label: folder,
        path: `${path}/${folder}`,
      }));
      setTreeData((prev) => {
        if (parentNodeId === 'root') {
          return folders;
        }
        return updateTreeData(prev, parentNodeId, folders);
      });
    } catch (error) {
      setMessage('Errore nel caricamento delle cartelle');
    } finally {
      setLoading(false);
    }
  };

  const updateTreeData = (nodes, parentId, newChildren) => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return { ...node, children: newChildren };
      }
      if (node.children) {
        return { ...node, children: updateTreeData(node.children, parentId, newChildren) };
      }
      return node;
    });
  };

  const handleNodeToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleNodeSelect = (event, nodeId) => {
    const node = findNodeById(treeData, nodeId);
    if (node) {
      setSelectedFolder(node.path);
      setCurrentPath(node.path);
      if (!node.children) {
        fetchFolders(node.path, nodeId);
      }
    }
  };

  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleConvert = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/convert`, { folder: selectedFolder });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Errore nella conversione delle immagini');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    if (parentPath && parentPath !== '/app') {
      setCurrentPath(parentPath);
      setSelectedFolder(parentPath);
      const parentNodeId = parentPath.split('/').slice(-1)[0];
      fetchFolders(parentPath, `root-${parentNodeId}`);
    }
  };

  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.label}>
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  );

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
          <TreeView
            defaultCollapseIcon={<FolderOpenIcon />}
            defaultExpandIcon={<FolderIcon />}
            expanded={expanded}
            onNodeToggle={handleNodeToggle}
            onNodeSelect={handleNodeSelect}
            sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}
          >
            {treeData.map((node) => renderTree(node))}
          </TreeView>
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
