import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { PitchProvider } from './context/PitchContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PitchProvider>
      <App />
    </PitchProvider>
  </React.StrictMode>
);
