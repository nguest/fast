import * as THREE from 'three';
///import { trackParams } from '../custom/geometries/trackParams';
import { computeFrenetFrames } from './curveHelpers';
//import { rand } from './helpers';

export const createApexes = ({ centerLine, length }) => {
  const threshold = 0.008;//ß0.02; // 0.12;
  const pointsCount = Math.floor(length * 0.05);
  const { binormals, tangents } = computeFrenetFrames(centerLine, pointsCount);
  const points = centerLine.getSpacedPoints(pointsCount);

  const angles = tangents.map((t, i, arr) => {
    if (arr[i - 1] && arr[i + 1]) {
      return 0.5 * arr[i - 1].angleTo(arr[i + 1]);
    }
    return 0;
  });

  const apexes = angles.reduce((agg, theta, i) => {
    if (
      angles[i - 1]
      && angles[i + 1]
      && (theta > threshold)
      && angles[i - 1] < theta
      && angles[i + 1] < theta
    ) {
      const signedArea = signedTriangleArea(points[i - 1], points[i], points[i + 1]);
      const dir = Math.sign(signedArea);

      return [
        ...agg,
        { i, p: points[i], dir, binormal: binormals[i] },
      ];
    }
    return agg;
  }, []);

  return apexes;

  // const map = new THREE.TextureLoader().load('./assets/textures/location_map.png');
  // const material = new THREE.SpriteMaterial({map});
  // apexes.forEach((apex, i) => {
  //   const sprite = new THREE.Sprite(material);
  //   const apexMarkerPosn = apex.p.sub(binormals[apex.i].clone().multiplyScalar(trackParams.trackHalfWidth * apex.dir));
  //   sprite.position.set(apexMarkerPosn.x, apexMarkerPosn.y + 1, apexMarkerPosn.z);

  //   scene.add(sprite);
  //});
};


export const signedTriangleArea = (a, b, c) => (
  a.x * b.z - a.z * b.x + a.z * c.x - a.x * c.z + b.x * c.z - c.x * b.z
);