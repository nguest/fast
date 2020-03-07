import * as THREE from 'three';
import { trackParams } from './trackParams';
import { computeFrenetFrames } from '../../helpers/curveHelpers';
import { createSampledInstanceMesh } from '../../helpers/InstancedBufferGeometry';
import { patchShader } from '../../materials/extend';
import { rand } from '../../helpers/helpers';

export const trackCrossSection = new THREE.Shape();
trackCrossSection.moveTo(0, trackParams.trackHalfWidth);
trackCrossSection.lineTo(0, -trackParams.trackHalfWidth);

export const trackUVGenerator = {
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

// export const createTrackDecalsOld = (trackMesh, scene, material) => {
//   const pointsCount = 2000;
//   const positions = trackParams.centerLine.getSpacedPoints(pointsCount);
//   const { binormals, normals, tangents } = computeFrenetFrames(trackParams.centerLine, pointsCount);

//   console.log({ tangents })

//   material.polygonOffset = true;
//   material.polygonOffsetFactor = -1;
//   material.blending = THREE.AdditiveBlending;

//   const scale = new THREE.Vector3(10, 10, 10);

//   for (let i = 0; i < pointsCount; i++) {
//     const geometry = new DecalGeometry(
//       trackMesh,
//       positions[i],
//       new THREE.Euler().setFromVector3(tangents[i]),
//       scale,
//     );
//     const decalMesh = new THREE.Mesh(geometry, material);
//     decalMesh.name = `trackDecal-${i}`;
//     decalMesh.userData.type = 'decal';
//     scene.add(decalMesh);
//   }
// };

export const createTrackDecals = (trackMesh, scene, material) => {
  const plane = new THREE.PlaneBufferGeometry(0.2, 10);

  const instancedMesh = createSampledInstanceMesh({
    baseGeometry: plane,
    mesh: trackMesh,
    material: TrackMarksMaterial,
    count: trackParams.length * 3,
    name: 'trackMarks',
    lookAtNormal: true,
    scaleFunc: () => rand(2),
  });
  scene.add(instancedMesh);
};


export const createApexes = (scene) => {
  const threshold = 0.02; // 0.12;
  const pointsCount = Math.floor(trackParams.length * 0.05);
  const { binormals, tangents } = computeFrenetFrames(trackParams.centerLine, pointsCount);
  const points = trackParams.centerLine.getSpacedPoints(pointsCount);

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
        { i, p: points[i], dir },
      ];
    }
    return agg;
  }, []);

  const spriteMap = new THREE.TextureLoader().load('./assets/textures/UV_Grid_Sm.png');
  const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff });
  apexes.forEach((apex, i) => {
    const sprite = new THREE.Sprite(spriteMaterial);
    const apexMarkerPosn = apex.p.sub(binormals[apex.i].clone().multiplyScalar(trackParams.trackHalfWidth * apex.dir));
    sprite.position.set(apexMarkerPosn.x, apexMarkerPosn.y + 1, apexMarkerPosn.z);

    scene.add(sprite);
  });
};

const signedTriangleArea = (a, b, c) => (
  a.x * b.z - a.z * b.x + a.z * c.x - a.x * c.z + b.x * c.z - c.x * b.z
);

// create custom material with vertex clipping and proper alpha
const TrackMarksMaterial = new THREE.MeshLambertMaterial({
  color: 0x000000,
  //map: new THREE.TextureLoader().load('./assets/textures/grassClump64_map.png'),
  side: THREE.FrontSide,
  polygonOffset: true,
  polygonOffsetFactor: -1,
  transparent: true,
  opacity: 0.2,
  //renderOrder: 1,

});

TrackMarksMaterial.onBeforeCompile = (shader) => {
  patchShader(shader, {
    uniforms: {
      clipDistance: 50.0,
    },
    header: 'uniform float clipDistance;',
    // fragment: {
    //   'gl_FragColor = vec4( outgoingLight, diffuseColor.a );':
    //   `if ( diffuseColor.a < 0.95 ) discard; // remove low alpha values
    //   gl_FragColor = vec4( outgoingLight * diffuseColor.a, diffuseColor.a );`,
    // },
    vertex: {
      project_vertex: {
        '@gl_Position = projectionMatrix * mvPosition;':
        `
        gl_Position = projectionMatrix * mvPosition;
        if (gl_Position.z > clipDistance) gl_Position.w = 0.0/0.0;
        `,
      },
    },
  });
};
