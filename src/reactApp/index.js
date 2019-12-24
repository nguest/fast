import React, { useState } from 'react';
import { ThreeContainer } from './ThreeContainer';
import './App.css';


function App() {
  const [status, setStatus] = useState(null);

  return (
    <div className="App">
      <header className="app-header">
        <p>App Header</p>
      </header>
      <div className="status-bar">
        { status }
      </div>
      <ThreeContainer setStatus={setStatus} />
    </div>
  );
}

export default App;
