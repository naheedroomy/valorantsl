// theme.js
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#483b44',
    },
    background: {
      default: '#2d242a',
      paper: '#32292F',
    },
    text: {
      primary: '#e3f2fd',
      secondary: '#90caf9',
    },
  },
  typography: {
    fontFamily: '"Source Sans Pro", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
    fontWeight: 'bold',
    h4: {
      fontFamily: '"Source Sans Pro", "Helvetica", "Arial", sans-serif',
      fontWeight: 'bold',
      // fontStyle: 'italic',
    },
  },
});

export default darkTheme;
