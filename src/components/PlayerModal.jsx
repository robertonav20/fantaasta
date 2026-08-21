import { Box, Dialog, DialogContent, DialogTitle, Divider, IconButton, Paper, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RoleBadge from './RoleBadge';
import { formatDateTime, number } from '../utils';

const LABELS = {
  Id: 'ID', R: 'Ruolo', RM: 'Ruolo Mantra', Rm: 'Ruolo Mantra', Nome: 'Nome', Squadra: 'Squadra',
  'Qt.A': 'Quotazione attuale', 'Qt.I': 'Quotazione iniziale', 'Diff.': 'Differenza', 'Qt.A M': 'Quotazione attuale M',
  'Qt.I M': 'Quotazione iniziale M', 'Diff.M': 'Differenza M', FVM: 'FVM', 'FVM M': 'FVM M',
  Pv: 'Presenze a voto', Mv: 'Media voto', Fm: 'Fantamedia', Gf: 'Gol fatti', Gs: 'Gol subiti', Rp: 'Rigori parati',
  Rc: 'Rigori calciati', 'R+': 'Rigori segnati', 'R-': 'Rigori sbagliati', Ass: 'Assist', Amm: 'Ammonizioni', Esp: 'Espulsioni', Au: 'Autogol',
  games: 'Partite', time: 'Minuti', goals: 'Gol', xG: 'xG', assists: 'Assist', xA: 'xA', shots: 'Tiri', key_passes: 'Key pass',
  yellow_cards: 'Ammonizioni', red_cards: 'Espulsioni', position: 'Posizione', team_title: 'Squadra', npg: 'Gol non su rigore',
  npxG: 'npxG', xGChain: 'xGChain', xGBuildup: 'xGBuildup', xG90: 'xG / 90', xA90: 'xA / 90', 'xG+xA90': 'xG+xA / 90',
  titolarita: 'Probabilità prossima partita', stato: 'Stato', modulo: 'Modulo squadra', posizione: 'Posizione tattica',
  rigoristaRank: 'Gerarchia rigori', calciDaFermoRank: 'Calci da fermo', punizioniRank: 'Punizioni', cornerRank: 'Corner',
  injured: 'Infortunato', status: 'Stato', returnText: 'Rientro stimato', description: 'Dettaglio infortunio', provider: 'Fonte', season: 'Stagione', updatedAt: 'Aggiornato', source: 'URL fonte',
};

function display(key, value) {
  if (value === null || value === undefined || value === '') return '—';
  if (key === 'updatedAt') return formatDateTime(value);
  if (key === 'injured') return value ? 'Sì' : 'No';
  if (key === 'titolarita') return `${number(value, 0)}%`;
  if (key.endsWith('Rank') && Number(value) > 0) return `${Number(value)}ª scelta`;
  if (typeof value === 'number') return number(value);
  return String(value);
}

function InfoGrid({ data }) {
  const entries = Object.entries(data || {}).filter(([, value]) => value !== null && value !== undefined && value !== '');
  if (!entries.length) return <Typography variant="body2" color="text.secondary">Dati non disponibili.</Typography>;
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))', md: 'repeat(3,minmax(0,1fr))' }, gap: 1 }}>
      {entries.map(([key, value]) => (
        <Paper key={key} variant="outlined" sx={{ p: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{LABELS[key] || key}</Typography>
          <Typography sx={{ fontWeight: 750, wordBreak: 'break-word' }}>{display(key, value)}</Typography>
        </Paper>
      ))}
    </Box>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Stack>
      {children}
    </Box>
  );
}

export default function PlayerModal({ player, open, onClose }) {
  if (!player) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ py: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <RoleBadge role={player.info?.R || player.role} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{player.name}</Typography>
            <Typography variant="caption" color="text.secondary">{player.team} · FVM {player.fvm}</Typography>
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 0 }}>
        <Section title="Quotazioni / FVM"><InfoGrid data={player.info} /></Section>
        {Object.entries(player.stats || {}).map(([season, data]) => <Section key={`s-${season}`} title="Statistiche Fantacalcio" subtitle={season}><InfoGrid data={data} /></Section>)}
        {Object.entries(player.advanced || {}).map(([season, data]) => <Section key={`a-${season}`} title="Metriche avanzate" subtitle={season}><InfoGrid data={data} /></Section>)}
        <Section title="Disponibilità / titolarità" subtitle={player.availability?.provider}><InfoGrid data={player.availability} /></Section>
        <Section title="Stato fisico" subtitle={player.injury?.provider}><InfoGrid data={player.injury} /></Section>
        <Section title="Piazzati" subtitle={player.setPieces?.provider}><InfoGrid data={player.setPieces} /></Section>
      </DialogContent>
    </Dialog>
  );
}
