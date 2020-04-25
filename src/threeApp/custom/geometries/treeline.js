import * as THREE from 'three';
import { computeFrenetFrames } from '../../helpers/curveHelpers';

export const getTreeline = (trackParams) => {
  const pointsCount = 2000;
  const { binormals, normals, tangents } = computeFrenetFrames(trackParams.centerLine, pointsCount);
  const positions = trackParams.centerLine.getSpacedPoints(pointsCount);

  const leftPositions = [];
  const rightPositions = [];
  for (let i = 0; i < pointsCount; i++) {
    leftPositions.push(
      positions[i].clone().sub(binormals[i].clone().multiplyScalar(trackParams.treeDistance)) // * trackParams.widthFactor[i].x))
    );
    rightPositions.push(
      positions[i].clone().add(binormals[i].clone().multiplyScalar(trackParams.treeDistance))// * trackParams.widthFactor[i].x))
    );
  }

  const treeCurveLeft = new THREE.CatmullRomCurve3(leftPositions);
  const treeCurveRight = new THREE.CatmullRomCurve3(rightPositions);

  return { treeCurveLeft, treeCurveRight };
};
