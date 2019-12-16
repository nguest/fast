import React, { useRef, useEffect } from 'react';
import Main from './app/main';


export const ThreeContainer = () => {
  useEffect(() => {
    new Main(threeRootElement.current);
  },[])
  const threeRootElement = useRef();
    return (
      <div ref={threeRootElement} />
    );
}
