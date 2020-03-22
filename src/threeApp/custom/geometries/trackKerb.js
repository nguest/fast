import * as THREE from 'three';

const trackKerbCrossSection1 = (trackParams) => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.01, -trackParams.trackHalfWidth + 0.1);
  shape.lineTo(-0.05, -trackParams.trackHalfWidth + 0.2);
  shape.lineTo(-0.2, -trackParams.trackHalfWidth - 0.8);
  return shape;
};

const trackKerbCrossSection2 = (trackParams) => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.2, trackParams.trackHalfWidth + 0.8);
  shape.lineTo(-0.05, trackParams.trackHalfWidth - 0.2);
  shape.lineTo(-0.01, trackParams.trackHalfWidth - 0.1);
  return shape;
};

export const trackKerbCrossSection = (trackParams) => ([trackKerbCrossSection1(trackParams), trackKerbCrossSection2(trackParams)]);
//export const trackEdgeCrossSection = [test, test2];

/*
The first 9 elements in the positions array contain the x,y,z coordinates of the 3 vertices of the first face.
The next 9 element specify the vertices of the 2nd face. – WestLangley Feb 11 '16 at 20:32
*/


export const getIncludeSegments = (trackParams) => {
  const curve = trackParams.centerLine;
  const steps = 1000;
  const { tangents } = curve.computeFrenetFrames(steps);
  const angles = tangents.map((t, i) => t.angleTo(tangents[i + 1] || t));

  const angleThreshold = 0.05; // min angle to build after
  let openSeg;
  const segments = angles.reduce((agg, c, idx) => {
    let newAgg = agg;
    if (c > angleThreshold && !openSeg) {
      openSeg = true;
      newAgg = [...agg, [idx / steps]];
    }
    if (c < angleThreshold && openSeg) {
      openSeg = false;
      newAgg[agg.length - 1] = [...agg[agg.length - 1], idx / steps];
    }
    return newAgg;
  }, []);
  return segments;
};
