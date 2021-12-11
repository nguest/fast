/** @jsx jsx */
import React, { useState } from 'react';
import { jsx } from '@emotion/core';
import { ThreeContainer } from './ThreeContainer';
import { TrackMap } from './TrackMap';
import { Speedo } from './Speedo';
import { styles } from './styles';
import { Sound } from './Sound';

export const App = () => {
  const [status, setStatus] = useState(null);
  const [gamePosition, setGamePosition] = useState({ gate: 0, vehiclePosition: { x: 0, z: 0 } });
  const [track, setTrack] = useState('Square');
  const [trackParams, setTrackParams] = useState({});

  return (
    <div css={styles.app}>
      <header css={styles.appHeader}>
        <p>Fast Game</p>
      </header>
      <ThreeContainer
        status={status}
        setStatus={setStatus}
        setGamePosition={setGamePosition}
        gamePosition={gamePosition}
        selectedTrack={track}
        setSelectedTrack={setTrack}
        setTrackParams={setTrackParams}
        trackParams={trackParams}
      />
      <TrackMap gamePosition={gamePosition} trackParams={trackParams} />
      <Speedo speed={status?.speed || '0'} maxSpeed="250" />
      <Sound speed={status?.speed || '0'} />
    </div>
  );
};
