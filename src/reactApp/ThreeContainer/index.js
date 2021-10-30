/** @jsx jsx */
import React, { useRef, useState } from 'react';
import { func, number, object, string } from 'prop-types';
import { jsx } from '@emotion/core';
import { Main } from '../../threeApp';
import { Loader } from '../Loader';
import { DebugBox } from '../DebugBox';

import { styles } from '../styles';


export const ThreeContainer = ({
  gamePosition,
  setStatus,
  status,
  setGamePosition,
  selectedTrack,
  setSelectedTrack,
  setTrackParams,
  trackParams,
}) => {
  const threeRootElement = useRef();
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <>
      <Main
        ref={threeRootElement}
        setStatus={setStatus}
        setIsLoading={setIsLoading}
        gamePosition={gamePosition}
        setGamePosition={setGamePosition}
        selectedTrack={selectedTrack}
        setTrackParams={setTrackParams}
      />
      <DebugBox
        threeRootElement={threeRootElement}
        gamePosition={gamePosition}
        setGamePosition={setGamePosition}
        status={status}
        selectedTrack={selectedTrack}
        setSelectedTrack={setSelectedTrack}
        trackParams={trackParams}
      />
      {
        isLoading
        && (<div css={styles.loadingScreen}><Loader /></div>)
      }
    </>
  );
};

ThreeContainer.propTypes = {
  setStatus: func,
  status: object,
  gamePosition: object,
  setGamePosition: func,
};
