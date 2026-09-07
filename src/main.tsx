import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { TypographyProvider } from './context/TypographyContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <TypographyProvider>
        <App />
      </TypographyProvider>
    </ThemeProvider>
  </StrictMode>,
);
