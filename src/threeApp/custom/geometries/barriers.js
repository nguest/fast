import * as THREE from 'three';
import { trackParams } from './trackParams';
import { Vector3 } from 'three/build/three.module';

const barrierCrossSection1 = new THREE.Shape();
barrierCrossSection1.moveTo(-0.25, -(trackParams.trackHalfWidth + trackParams.vergeWidth));
barrierCrossSection1.lineTo(-1.5, -(trackParams.trackHalfWidth + trackParams.vergeWidth));
const barrierCrossSection2 = new THREE.Shape();
barrierCrossSection2.moveTo(-0.25, (trackParams.trackHalfWidth + trackParams.vergeWidth));
barrierCrossSection2.lineTo(-1.5, (trackParams.trackHalfWidth + trackParams.vergeWidth));

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
      new THREE.Vector2(1, -1),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0, -1),
    ];
  },
};
