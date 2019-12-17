import React, { useRef, useEffect } from 'react';
import Main from './threeApp/main';


export const ThreeContainer = () => {
  useEffect(() => {
    new Main(threeRootElement.current);
  },[])
  const threeRootElement = useRef();

  return <div ref={threeRootElement} />;
}
