import { useMemo, useRef, useState } from 'react';
import {
  Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem,
  ListItemButton, ListItemText, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import { defaultRosterName, downloadJson, extractImportedRosters, formatDateTime, normalizeImportedRoster, rosterExportPackage, rosterMeta, safeFilePart } from '../utils';

export default function HistoryModal({ open, onClose, history, activeAuction, onSaveNew, onLoadCurrent, onOpenNew, onDelete, onImport }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const fileRef = useRef(null);
  const activeHistoryId = activeAuction?.historyId || '';
  const selectedItems = useMemo(() => history.filter((item) => selected.has(item.id)), [history, selected]);

  const toggle = (id) => setSelected((old) => { const next = new Set(old); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const exportItems = (items) => {
    if (!items.length) return;
    if (items.length === 1) downloadJson(rosterExportPackage(items), `rosa-${safeFilePart(items[0].name)}.json`);
    else downloadJson(rosterExportPackage(items), `rose-fantacalcio-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleFiles = async (files) => {
    const imported = [];
    for (const file of [...files]) {
      try {
        const payload = JSON.parse(await file.text());
        extractImportedRosters(payload).forEach((item) => {
          const normalized = normalizeImportedRoster(item, file.name.replace(/\.json$/i, ''));
          if (normalized) imported.push(normalized);
        });
      } catch (error) {
        console.warn('Import JSON non valido', file.name, error);
      }
    }
    if (imported.length) onImport(imported);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box><Typography variant="h6">Gestione rose</Typography><Typography variant="caption" color="text.secondary">Storico locale del browser · import/export JSON.</Typography></Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={.75} sx={{ mb: 1.25 }}>
          <TextField size="small" fullWidth label="Nome nuova rosa" value={name} onChange={(e) => setName(e.target.value)} placeholder={defaultRosterName()} />
          <Button startIcon={<SaveIcon />} variant="contained" onClick={() => { onSaveNew(name.trim() || defaultRosterName()); setName(''); }}>Salva corrente</Button>
        </Stack>
        <Stack direction="row" gap={.5} flexWrap="wrap" sx={{ mb: 1 }}>
          <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />} disabled={!selectedItems.length} onClick={() => exportItems(selectedItems)}>Esporta selezionate ({selectedItems.length})</Button>
          <Button size="small" variant="outlined" startIcon={<FileUploadIcon />} onClick={() => fileRef.current?.click()}>Importa JSON</Button>
          <input ref={fileRef} hidden type="file" accept="application/json,.json" multiple onChange={(e) => handleFiles(e.target.files)} />
        </Stack>
        {history.length ? (
          <List disablePadding>
            {history.map((item) => {
              const meta = rosterMeta(item.state);
              const active = item.id === activeHistoryId;
              return (
                <ListItem key={item.id} disablePadding divider secondaryAction={
                  <Stack direction="row" spacing={0}>
                    <Tooltip title="Carica nel tab corrente"><IconButton color={active ? 'primary' : 'default'} onClick={() => onLoadCurrent(item)}><FolderOpenIcon /></IconButton></Tooltip>
                    <Tooltip title="Apri in un nuovo tab asta"><IconButton onClick={() => onOpenNew(item)}><AddToPhotosIcon /></IconButton></Tooltip>
                    <Tooltip title="Esporta JSON"><IconButton onClick={() => exportItems([item])}><FileDownloadIcon /></IconButton></Tooltip>
                    <Tooltip title="Elimina"><IconButton color="error" onClick={() => onDelete(item)}><DeleteOutlineIcon /></IconButton></Tooltip>
                  </Stack>
                }>
                  <Checkbox checked={selected.has(item.id)} onChange={() => toggle(item.id)} />
                  <ListItemButton selected={active} onClick={() => onLoadCurrent(item)} sx={{ pr: 18 }}>
                    <ListItemText primary={<Typography sx={{ fontWeight: 800 }}>{item.name}</Typography>} secondary={`${meta.players}/25 giocatori · ${meta.spent} cr · aggiornato ${formatDateTime(item.updatedAt || item.createdAt)}`} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        ) : <Box sx={{ py: 4, textAlign: 'center' }}><Typography color="text.secondary">Nessuna rosa salvata.</Typography></Box>}
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Chiudi</Button></DialogActions>
    </Dialog>
  );
}
