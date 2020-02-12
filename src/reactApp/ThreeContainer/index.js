/** @jsx jsx */
import React, { useRef, useState } from 'react';
import { func, number } from 'prop-types';
import { jsx } from '@emotion/core';
import { Main } from '../../threeApp';
import { Loader } from '../Loader';

import { styles } from '../styles';


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
      <section css={styles.info2}>
        <button
          css={styles.resetButton}
          onClick={() => threeRootElement.current.resetObjects(0)}
        >
          Reset
        </button>
        <button
          css={styles.button}
          onClick={() => threeRootElement.current.resetObjects(gamePosition.gate > 0 ? gamePosition.gate - 1 : gamePosition.gate)}
        >
            &lt;
        </button>
        <button
          css={styles.button}
          onClick={() => threeRootElement.current.resetObjects(gamePosition.gate < 500 ? gamePosition.gate + 1 : gamePosition.gate)}
        >
            &gt;
        </button>
      </section>
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
