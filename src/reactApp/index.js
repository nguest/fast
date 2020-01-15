/** @jsx jsx */
import React, { useState } from 'react';
import { jsx } from '@emotion/core';
import { ThreeContainer } from './ThreeContainer';

import { styles } from './styles';

export const App = () => {
  const [status, setStatus] = useState(null);
  const [gamePosition, setGamePosition] = useState('gate-0');

  return (
    <div css={styles.app}>
      <header css={styles.appHeader}>
        <p>App Header</p>
      </header>
      <div css={styles.statusBar}>
        { status }
      </div>
      <div css={styles.gamePosition}>
        { gamePosition }
      </div>
      <ThreeContainer
        setStatus={setStatus}
        setGamePosition={setGamePosition}
        gamePosition={gamePosition}
      />
    </div>
  );
};
