import React, { useRef, useEffect, useState } from 'react';
import { object } from 'prop-types';
import Main from '../../threeApp';


export const ThreeContainer = ({ cb, state }) => {
  const threeRootElement = useRef();
  const [main, setMain] = useState(null);

  useEffect(() => {
    if (!main) {
      //const threeApp = new Main(threeRootElement.current, cb, state);
      //setMain(threeApp);
    }
  }, []);

  console.log({ threeRootElement })


  return (
    <Main cb={cb} ref={threeRootElement}/>
  )
};

ThreeContainer.propTypes = {
  cb: object,
  state: object,
};
