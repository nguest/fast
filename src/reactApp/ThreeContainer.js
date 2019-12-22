import React, { useRef, useEffect, useState } from 'react';
import { object } from 'prop-types';
import Main from '../threeApp';


export const ThreeContainer = ({ cb, state }) => {
  const threeRootElement = useRef();
  const [main, setMain] = useState(null);

  useEffect(() => {
    if (!main) {
      const threeApp = new Main(threeRootElement.current, cb, state);
      setMain(threeApp);
    }
  }, []);

  return <div ref={threeRootElement} className="three-container" />;
};

ThreeContainer.propTypes = {
  cb: object,
  state: object,
};
