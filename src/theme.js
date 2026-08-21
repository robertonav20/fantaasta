import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    background: { default: '#0d1117', paper: '#161b22' },
    primary: { main: '#58a6ff' },
    success: { main: '#3fb950' },
    warning: { main: '#d29922' },
    error: { main: '#f85149' },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 12,
    h5: { fontSize: '1.2rem', fontWeight: 800 },
    h6: { fontSize: '1rem', fontWeight: 800 },
    button: { fontSize: '.72rem', fontWeight: 800 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { minWidth: 320 },
        '*': { boxSizing: 'border-box' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: '6px 8px', fontSize: '.72rem', whiteSpace: 'nowrap' },
        head: { fontWeight: 800, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '.04em' },
      },
    },
    MuiInputBase: {
      styleOverrides: { root: { fontSize: '.78rem' } },
    },
    MuiButton: {
      defaultProps: { size: 'small' },
      styleOverrides: { root: { minWidth: 32 } },
    },
    MuiIconButton: { defaultProps: { size: 'small' } },
    MuiTooltip: { defaultProps: { arrow: true } },
  },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
});
