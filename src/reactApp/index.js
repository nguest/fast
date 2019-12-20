import React, { useState } from 'react';
import { ThreeContainer } from './ThreeContainer';
import './App.css';

function App() {

  const [status, setStatus] = useState(null);

  const cb = { setStatus }

  return (
    <div className="App">
      <header className="app-header">
        <p>App Header</p>
      </header>
      <div className="status-bar">
        { status }
      </div>
      <ThreeContainer cb={cb} />
    </div>
  );
};

export default App;
