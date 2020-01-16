/** @jsx jsx */
import React, { useRef, useState } from 'react';
import { func, number } from 'prop-types';
import { jsx } from '@emotion/core';
import { Main } from '../../threeApp';
import { Loader } from '../Loader';

import { styles } from './styles';


export const ThreeContainer = ({ setStatus, gamePosition, setGamePosition }) => {
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
      <button
        css={styles.resetButton}
        onClick={() => threeRootElement.current.resetObjects()}
      >
        Reset
      </button>
      {
        isLoading
        && (<div css={styles.loadingScreen}><Loader /></div>)
      }
    </>
  );
};

ThreeContainer.propTypes = {
  setStatus: func,
  gamePosition: number,
  setGamePosition: func,
};
