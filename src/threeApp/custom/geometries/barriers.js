import * as THREE from 'three';

const barrierCrossSection1 = (trackParams) => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, -(trackParams.trackHalfWidth + trackParams.vergeWidth));
  shape.lineTo(-1.75, -(trackParams.trackHalfWidth + trackParams.vergeWidth));
  return shape;
};

const barrierCrossSection2 = (trackParams) => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, (trackParams.trackHalfWidth + trackParams.vergeWidth));
  shape.lineTo(-1.75, (trackParams.trackHalfWidth + trackParams.vergeWidth));
  return shape;
};

export const barriersCrossSection = (trackParams) => [barrierCrossSection1(trackParams), barrierCrossSection2(trackParams)];

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
