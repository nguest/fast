/** @jsx jsx */
import React, { useRef, useState } from 'react';
import { func, number, object, string } from 'prop-types';
import { jsx } from '@emotion/core';
import { Main } from '../../threeApp';
import { Loader } from '../Loader';
import { DebugBox } from '../DebugBox';

import { styles } from '../styles';


export const ThreeContainer = ({ gamePosition, setStatus, status, setGamePosition }) => {
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
      />
      <DebugBox
        threeRootElement={threeRootElement}
        gamePosition={gamePosition}
        setGamePosition={setGamePosition}
        status={status}
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
  status: string,
  gamePosition: object,
  setGamePosition: func,
};
