/** @jsx jsx */
import React, { useRef, useState } from 'react';
import { func, number, object, string } from 'prop-types';
import { jsx } from '@emotion/core';
import { Main } from '../../threeApp';
import { Loader } from '../Loader';

import { styles } from './styles';


export const DebugBox = ({ status, threeRootElement, gamePosition }) => {
  return (
    <section css={styles.debugBox}>
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
      <button
        css={styles.button}
        onClick={() => threeRootElement.current.resetObjects(gamePosition.gate > 0 ? gamePosition.gate - 10 : gamePosition.gate)}
      >
          &lt; 10
      </button>
      <button
        css={styles.button}
        onClick={() => threeRootElement.current.resetObjects(gamePosition.gate < 500 ? gamePosition.gate + 10 : gamePosition.gate)}
      >
          &gt; 10
      </button>
      <section css={styles.info}>
        <div css={styles.statusBar}>
          { status }
        </div>
        <div css={styles.gamePosition}>
          { `${gamePosition.gate} / 500` }
        </div>
      </section>
    </section>
  );
};

DebugBox.propTypes = {
  status: string,
  setStatus: func,
  gamePosition: object,
  setGamePosition: func,
  threeRootElement: object,
};
