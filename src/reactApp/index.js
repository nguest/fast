/** @jsx jsx */
import React, { useState } from 'react';
import { jsx } from '@emotion/core';
import { ThreeContainer } from './ThreeContainer';

import { styles } from './styles';

export const App = () => {
  const [status, setStatus] = useState(null);
  const [gamePosition, setGamePosition] = useState(0);
  //const [resetPosition, setResetPosition] = useState(0)
  //console.log({ gamePosition })
  return (
    <div css={styles.app}>
      <header css={styles.appHeader}>
        <p>App Header</p>
      </header>
      <section css={styles.info}>
        <div css={styles.statusBar}>
          { status }
        </div>
        <div css={styles.gamePosition}>
          { `${gamePosition} / 500` }
        </div>
      </section>
      <ThreeContainer
        setStatus={setStatus}
        setGamePosition={setGamePosition}
        gamePosition={gamePosition}
      />
    </div>
  );
};
