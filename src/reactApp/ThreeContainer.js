import React, { useRef, useEffect } from 'react';
import Main from '../threeApp/main';


export const ThreeContainer = ({cb}) => {
  useEffect(() => {
    new Main(threeRootElement.current, cb);
  },[])
  const threeRootElement = useRef();

  return <div ref={threeRootElement} />;
}
