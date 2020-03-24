import * as THREE from 'three';
import { createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
import { InstancesStandardMaterial } from '../materials/InstancesStandardMaterials';
import { computeFrenetFrames } from '../../helpers/curveHelpers';

const fences1 = (trackParams) => {
  const shape = new THREE.Shape([
    new THREE.Vector2(-0.5, -(trackParams.trackHalfWidth + trackParams.vergeWidth + 0.2)),
    new THREE.Vector2(-3, -(trackParams.trackHalfWidth + trackParams.vergeWidth + 0.2)),
    new THREE.Vector2(-3.5, -(trackParams.trackHalfWidth + trackParams.vergeWidth - 0.3)),
  ]);
  return shape;
};

const fences2 = (trackParams) => {
  const shape = new THREE.Shape([
    new THREE.Vector2(-0.5, (trackParams.trackHalfWidth + trackParams.vergeWidth + 0.2)),
    new THREE.Vector2(-3, (trackParams.trackHalfWidth + trackParams.vergeWidth + 0.2)),
    new THREE.Vector2(-3.5, (trackParams.trackHalfWidth + trackParams.vergeWidth - 0.3)),
  ]);
  return shape;
};

export const fencesCrossSection = (trackParams) => [fences1(trackParams), fences2(trackParams)];

export const decorateFences = (fences, scene, trackParams) => {
  const geometry = new THREE.BoxBufferGeometry(0.1, 3, 0.1);
  //const geometry = new THREE.PlaneBufferGeometry(2,2);
  const pointsCount = trackParams.steps;

  const material = new InstancesStandardMaterial({ color: 0xff0000, userData: { faceToCamera: true } })

  const points = trackParams.centerLine.getSpacedPoints(pointsCount);
  const { binormals, normals, tangents } = computeFrenetFrames(trackParams.centerLine, pointsCount);

  const adjustedPoints = points.map((p, i) => {
    return p.clone().sub(binormals[i].clone().multiplyScalar(5))
  })


  console.log({ fences });
  const positions = [];
  for (let i = 0; i < 50; i+=1) {
    positions.push(
      adjustedPoints[i].x,
      adjustedPoints[i].y,
      adjustedPoints[i].z
      // fences.geometry.attributes.position.array[i],
      // fences.geometry.attributes.position.array[i+1],
      // fences.geometry.attributes.position.array[i+2],
    );
  }
  console.log({ positions });
  
  const instancedMesh = createInstancedMesh({
    geometry,
    //curve,
    count: 50,//trackParams.steps * 6,
    offset: new THREE.Vector3(0, 0, 0), // treeHeight * 0.5,
    name: `fencePostInstance-${0}`,
    material,
    positions,//: fences.geometry.attributes.position.array,
    //depthMaterial,
    scaleFunc: () => 1,// Math.random() * 0.75 + 0.75,
    shadow: {
      cast: true,
    },
  });
  console.log({ instancedMesh });
  
  scene.add(instancedMesh);
}
// export const barriersUVGenerator = {
//   generateTopUV(geometry, vertices, indexA, indexB, indexC) {
//     const aX = vertices[indexA * 3];
//     const aY = vertices[indexA * 3 + 1];
//     const bX = vertices[indexB * 3];
//     const bY = vertices[indexB * 3 + 1];
//     const cX = vertices[indexC * 3];
//     const cY = vertices[indexC * 3 + 1];

//     return [
//       new THREE.Vector2(aX, aY),
//       new THREE.Vector2(bX, bY),
//       new THREE.Vector2(cX, cY),
//     ];
//   },

//   generateSideWallUV() {
//     return [
//       new THREE.Vector2(1, -1),
//       new THREE.Vector2(1, 0),
//       new THREE.Vector2(0, 0),
//       new THREE.Vector2(0, -1),
//     ];
//   },
// };
