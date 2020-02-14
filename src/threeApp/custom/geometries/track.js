import * as THREE from 'three';
import { trackParams } from './trackParams';
import { DecalGeometry } from '../../helpers/DecalGeometry';

export const trackCrossSection = new THREE.Shape();
trackCrossSection.moveTo(0, trackParams.trackHalfWidth);
//trackCrossSection.lineTo(0, 0);
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
// 
export const createTrackDecals = (trackMesh, scene, material) => {
  const pointsCount = 2000;
  const positions = trackParams.centerLine.getSpacedPoints(pointsCount);
  const { binormals, normals, tangents } = trackParams.centerLine.computeFrenetFrames(pointsCount);

  console.log({ tangents })

  material.polygonOffset = true;
  material.polygonOffsetFactor = -1;
  material.blending = THREE.AdditiveBlending;

  const scale = new THREE.Vector3(10, 10, 10);

  for (let i = 0; i < pointsCount; i++) {
    const geometry = new DecalGeometry(
      trackMesh,
      positions[i],
      new THREE.Euler().setFromVector3(tangents[i]),
      scale,
    );
    const decalMesh = new THREE.Mesh(geometry, material);
    decalMesh.name = `trackDecal-${i}`;
    decalMesh.userData.type = 'decal';
    scene.add(decalMesh);
  }
};

export const createApexes = (scene) => {
  const pointsCount = 500;
  const { tangents } = trackParams.centerLine.computeFrenetFrames(pointsCount);
  const points = trackParams.centerLine.getSpacedPoints(pointsCount);

  const angles = tangents.map((t, i, arr) => {
    if (arr[i - 1] && arr[i + 1]) {
      return 0.5 * arr[i - 1].angleTo(arr[i + 1]);
    }
    return 0;
  });
  console.log({ angles, points })

  const apexIndices = angles.reduce((agg, theta, i) => {
    if (
      angles[i - 1]
      && angles[i + 1]
      && (theta > 0.2)
      && angles[i - 1] < theta
      && angles[i + 1] < theta
    ) {
      return [...agg, i];
    }
    return agg;
  }, []);


  const apexPoints = apexIndices.map((i) => points[i]);
  const geometry = new THREE.BoxBufferGeometry(20, 20, 20);
  const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
  console.log({ apexPoints })
  apexPoints.forEach((p) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(p.x, p.y, p.z);
    scene.add(mesh);
  });
};
