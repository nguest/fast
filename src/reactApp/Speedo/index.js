/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { number, string } from 'prop-types';

const speedoContainer = {
  position: 'absolute',
  right: 50,
  bottom: 50,
  zIndex: 0,
};

const speedoStyles = (needleAngle) => ({
  width: 100,
  height: 100,
  border: '1px solid black',
  '#needle': {
    transform: `rotate(${needleAngle}deg)`,
    transformOrigin: '50px 50px',
    transition: '0.1s linear',
  },
});

const speedDisplay = {
  fontSize: 40,
  position: 'absolute',
  right: 0,
  bottom: 0,
  margin: 0,
  lineHeight: 0.95,
  color: 'rgba(255, 255, 255, 0.8)',
};

export const Speedo = ({ speed = 0, maxSpeed }) => {
  const needleAngle = 20 + (300 * speed) / maxSpeed;
  return (
    <div css={speedoContainer}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200" css={speedoStyles(needleAngle)}>
        <circle cx="50" cy="50" r="48" stroke="black" strokeWidth="4" fill="transparent" />
        <path id="needle" d="M 48 50 l 1 48 h 2 l 1 -48 z" stroke="red" strokeWidth="0" fill="pink" />
      </svg>
      <p style={speedDisplay}>{speed}</p>
    </div>
  );
};

Speedo.propTypes = {
  speed: string,
  maxSpeed: string,
};
