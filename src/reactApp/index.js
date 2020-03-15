/** @jsx jsx */
import React, { useState } from 'react';
import { jsx } from '@emotion/core';
import { ThreeContainer } from './ThreeContainer';
import { TrackMap } from './TrackMap';
import { trackParams } from '../threeApp/custom/geometries/trackParams';

import { styles } from './styles';

export const App = () => {
  const [status, setStatus] = useState(null);
  const [gamePosition, setGamePosition] = useState({ gate: 0, vehiclePosition: { x: 0, z: 0 } });
  //console.log('renderAPP')
  return (
    <div css={styles.app}>
      <header css={styles.appHeader}>
        <p>App Header</p>
      </header>
      <ThreeContainer
        status={status}
        setStatus={setStatus}
        setGamePosition={setGamePosition}
        gamePosition={gamePosition}
      />
      <TrackMap gamePosition={gamePosition} trackParams={trackParams} />
    </div>
  );
};
