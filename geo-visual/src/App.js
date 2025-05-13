// src/App.js
import React from 'react';
import './App.css';
import AppLayout from './components/layout/AppLayout';
import { ThreeJsProvider } from './contexts/ThreeJsContext';
import { LayersProvider } from './contexts/LayersContext';
import { BoreholeProvider } from './contexts/BoreholeContext';
import { DisplayOptionsProvider } from './contexts/DisplayOptionsContext';

function App() {
  return (
    <ThreeJsProvider>
      <LayersProvider>
        <BoreholeProvider>
          <DisplayOptionsProvider>
            <AppLayout />
          </DisplayOptionsProvider>
        </BoreholeProvider>
      </LayersProvider>
    </ThreeJsProvider>
  );
}

export default App;