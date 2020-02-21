/** @jsx jsx */
import React, { useEffect, useState } from 'react';
import { jsx } from '@emotion/core';
import { object } from 'prop-types';

import { styles } from './styles';

const computeMapPoints = (points) => points.reduce((agg, p) => agg.concat(`${p.x} ${p.z},`), '').slice(0, -1);

export const TrackMap = ({ gamePosition, trackParams }) => {
  const [points, setPoints] = useState([]);
  const [e, setE] = useState(null);

  useEffect(() => {
    if (trackParams.adjustedTrackPoints) {
      const ps = computeMapPoints(trackParams.adjustedTrackPoints);
      const xArray = trackParams.adjustedTrackPoints.map((p) => p.x);
      const zArray = trackParams.adjustedTrackPoints.map((p) => p.z);
      const extents = {
        minX: Math.min(...xArray),
        minZ: Math.min(...zArray),
        maxX: Math.max(...xArray),
        maxZ: Math.max(...zArray),
      };
      setE(extents);
      setPoints(ps);
    }
  }, []);

  if (!e) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      css={styles.map}
      viewBox={` ${e.minX} ${e.minZ} ${-e.minX + e.maxX} ${-e.minZ + e.maxZ}`}
    >
      <polyline points={points} fill="none" stroke="black" strokeWidth="50" />
      <circle cx="0" cy="0" r="60" fill="white" />
      <circle cx={gamePosition.vehiclePosition.x} cy={gamePosition.vehiclePosition.z} r="50" fill="red" />
    </svg>
  );
};

TrackMap.propTypes = {
  gamePosition: object,
  trackParams: object,
};