/** @jsx jsx */
import React, { useRef, useState } from 'react';
import { func } from 'prop-types';
import { jsx } from '@emotion/core';
import { Main } from '../../threeApp';
import { Loader } from '../Loader'

import { styles } from './styles';


export const ThreeContainer = ({ setStatus }) => {
  const threeRootElement = useRef();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <Main ref={threeRootElement} setStatus={setStatus} setIsLoading={setIsLoading} />
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
};
