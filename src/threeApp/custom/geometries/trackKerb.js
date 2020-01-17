import * as THREE from 'three';
import { trackParams } from './trackParams';

const trackKerbCrossSection1 = new THREE.Shape();
trackKerbCrossSection1.moveTo(-0.01, -trackParams.trackHalfWidth + 0.2);
trackKerbCrossSection1.lineTo(-0.05, -trackParams.trackHalfWidth - 0.2);
trackKerbCrossSection1.lineTo(-0.01, -trackParams.trackHalfWidth - 1);

const trackKerbCrossSection2 = new THREE.Shape();
trackKerbCrossSection2.moveTo(-0.2, 11);
trackKerbCrossSection2.lineTo(0, 10);

export const trackKerbCrossSection = [trackKerbCrossSection1, trackKerbCrossSection2];
//export const trackEdgeCrossSection = [test, test2];

/*
The first 9 elements in the positions array contain the x,y,z coordinates of the 3 vertices of the first face.
The next 9 element specify the vertices of the 2nd face. – WestLangley Feb 11 '16 at 20:32
*/


export const getIncludeSegments = () => {
  const curve = trackParams.centerLine;
  const steps = 1000;
  const { tangents } = curve.computeFrenetFrames(steps);
  const angles = tangents.map((t, i) => t.angleTo(tangents[i + 1] || t));

  const angleThreshold = 0.05;
  let open;
  const segments = angles.reduce((agg, c, idx) => {
    let newAgg = agg;
    if (c > angleThreshold && !open) {
      open = true;
      newAgg = [...agg, [idx / steps]];
    }
    if (c < angleThreshold && open) {
      open = false;
      newAgg[agg.length - 1] = [...agg[agg.length - 1], idx / steps];
    }
    return newAgg;
  }, []);
  return segments;
};