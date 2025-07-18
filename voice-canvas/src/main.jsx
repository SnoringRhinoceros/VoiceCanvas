import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './settings/settingsStore.js';
import App from './App.jsx';
import { PitchProvider } from './context/PitchContext';
import './index.css';
import { MicModeProvider } from './context/MicModeContext.jsx';
import { CommandProvider } from './context/CommandContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PitchProvider>
        <MicModeProvider>
          <CommandProvider>
            <App />
          </CommandProvider>
        </MicModeProvider>
      </PitchProvider>
    </Provider>
  </React.StrictMode>
);
