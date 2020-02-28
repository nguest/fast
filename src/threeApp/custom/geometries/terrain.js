import * as THREE from 'three';
import { trackParams } from './trackParams';
import { computeFrenetFrames } from '../../helpers/curveHelpers';

export const terrainCrossSection = new THREE.Shape();
terrainCrossSection.moveTo(-100, 100);
//trackCrossSection.lineTo(0, 0);
terrainCrossSection.lineTo(20, 0);

export const getTerrainCurve = () => {
  const pointsCount = 100;
  const { binormals, normals, tangents } = computeFrenetFrames(trackParams.centerLine, pointsCount);
  const positions = trackParams.centerLine.getSpacedPoints(pointsCount);

  const leftPositions = [];
  const rightPositions = [];
  for (let i = 0; i < pointsCount; i++) {
    leftPositions.push(
      positions[i].clone().sub(binormals[i].clone().multiplyScalar(-50 * trackParams.widthFactor[i].x))
    );
    // rightPositions.push(
    //   positions[i].clone().add(binormals[i].clone().multiplyScalar(trackParams.treeDistance * trackParams.widthFactor[i].x))
    // );
  }

  const terrainCurveLeft = new THREE.CatmullRomCurve3(leftPositions);
  //const terrainCurveLeft = new THREE.CubicBezierCurve3(...leftPositions);

  //const treeCurveRight = new THREE.CatmullRomCurve3(rightPositions);

  return terrainCurveLeft;
};
