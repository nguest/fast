import React, { useRef } from 'react';
import { func } from 'prop-types';
import { Main } from '../../threeApp';


export const ThreeContainer = ({ setStatus }) => {
  const threeRootElement = useRef();

  return (
    <>
      <Main ref={threeRootElement} setStatus={setStatus} />
      <button
        id="reset-button"
        onClick={() => threeRootElement.current.resetObjects()}
      >
        Reset
      </button>
    </>
  );
};

ThreeContainer.propTypes = {
  setStatus: func,
};
