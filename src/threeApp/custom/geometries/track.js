import * as THREE from 'three';
import { trackParams } from './trackParams';

export const trackCrossSection = new THREE.Shape();
trackCrossSection.moveTo(trackParams.trackHalfWidth, 0);
//trackCrossSection.lineTo(0, 0);
trackCrossSection.lineTo(-trackParams.trackHalfWidth, 0);


export const trackUVGenerator = {
  generateTopUV(geometry, vertices, indexA, indexB, indexC) {
    console.log({ geometry, vertices });
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

  generateSideWallUV(geometry, vertices, indexA, indexB, indexC, indexD ) {
    // const kx = 1;//0.1
    // const ky = 1;//10
    // const kz = 1;//0.1

    // let a_x = vertices[indexA * 3] * kx;
    // let a_y = vertices[indexA * 3 + 1] * ky;
    // let a_z = vertices[indexA * 3 + 2] * kz;
    // let b_x = vertices[indexB * 3] * kx;
    // let b_y = vertices[indexB * 3 + 1] * ky;
    // let b_z = vertices[indexB * 3 + 2] * kz;
    // let c_x = vertices[indexC * 3] * kx;
    // let c_y = vertices[indexC * 3 + 1] * ky;
    // let c_z = vertices[indexC * 3 + 2] * kz;
    // let d_x = vertices[indexD * 3] * kx;
    // let d_y = vertices[indexD * 3 + 1] * ky;
    // let d_z = vertices[indexD * 3 + 2] * kz;
    // console.log({ a_x, a_y, a_z });
    // console.log({ b_x, b_y, b_z });
    // console.log({ c_x, c_y, c_z });
    // console.log({ d_x, d_y, d_z });

    // const u = 1;
    // const v = 1;

    // simple uv 1:1 mapping:
    return [
      new THREE.Vector2(0, 1),
      new THREE.Vector2(1, 1),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 0),
    ];
  },
};

/*
0: {a_x: -9.999999997904824, a_y: 0, a_z: -0.00020470352443405633}
1: {b_x: 0, b_y: 0.1, b_z: 0}
4: {c_x: 0.07644613795383218, c_y: 0.1, c_z: -12.902481556879032}
3: {d_x: -9.923062852324778, d_y: 0, d_z: -13.001577234571238}
*/
