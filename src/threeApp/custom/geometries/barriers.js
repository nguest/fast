import * as THREE from 'three';
import { trackParams } from './trackParams';

const barrierCrossSection1 = new THREE.Shape();
barrierCrossSection1.moveTo(-(trackParams.trackHalfWidth + trackParams.vergeWidth), 0.25);
barrierCrossSection1.lineTo(-(trackParams.trackHalfWidth + trackParams.vergeWidth), 1.5);
const barrierCrossSection2 = new THREE.Shape();
barrierCrossSection2.moveTo((trackParams.trackHalfWidth + trackParams.vergeWidth), 0.25);
barrierCrossSection2.lineTo((trackParams.trackHalfWidth + trackParams.vergeWidth), 1.5);

export const barriersCrossSection = [barrierCrossSection1, barrierCrossSection2];

export const barriersUVGenerator = {
  generateTopUV(geometry, vertices, indexA, indexB, indexC) {
    const aX = vertices[indexA * 3];
    const aY = vertices[indexA * 3 + 1];
    const bX = vertices[indexB * 3];
    const bY = vertices[indexB * 3 + 1];
    const cX = vertices[indexC * 3];
    const cY = vertices[indexC * 3 + 1];

    return [
      new THREE.Vector2(aX, aY),
      new THREE.Vector2(bX, bY),
      new THREE.Vector2(cX, cY),
    ];
  },

  generateSideWallUV() {
    return [
      new THREE.Vector2(1, 1),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0, 1),
    ];
  },
};
