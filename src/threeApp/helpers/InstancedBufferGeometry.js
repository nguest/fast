import * as THREE from 'three';

import { MeshSurfaceSampler } from './MeshSurfaceSampler';
import { BufferGeometryUtils } from './BufferGeometryUtils';
import { computeFrenetFrames } from './curveHelpers';
import { getQuatFromNormal, rand } from './helpers';

export const createInstancedMesh = ({
  count,
  curve,
  depthMaterial,
  geometry,
  material,
  name,
  offset,
  positions,
  quaternions,
  scaleFunc,
}) => {
  const instancedGeo = new THREE.InstancedBufferGeometry().copy(geometry);

  positions = curve ? curve.getSpacedPoints(count) : positions;
  //const { binormals, normals, tangents } = computeFrenetFrames(curve, count);

  let instanceOffset = [];
  const instanceScale = [];
  let instanceQuaternion = [];
  const instanceMapUV = [];
  const up = new THREE.Vector3(1,1,0);
  const quaternion = new THREE.Quaternion();
  const rotationV = new THREE.Vector3();

  // if (!curve ) {
  //   instanceOffset = positions;
  // }

  for (let i = 0; i < count; i++) {
    // quaternion.setFromAxisAngle(
    //   up,
    //   //new THREE.Vector3(binormals[i].x, 0, binormals[i].z),
    //   Math.random() * Math.PI,
    // );
    if (material.userData.faceToQuat) {

      // const quat = getQuatFromNormal(up.normalize(), quaternion);
      // quat.normalize();
      // instanceQuaternion.push(quat.x, quat.y, quat.z, quat.w);
      // rotationV.set(
      //   rotation[i * 3],
      //   rotation[i * 3 + 1],
      //   rotation[i * 3 + 2],
      // );
      // // .add(
      // //   positions[i * 3],
      // //   positions[i * 3 + 1],
      // //   positions[i * 3 + 2],
      // // );
      // const quat = getQuatFromNormal(rotationV.normalize(), quaternion);
      // instanceQuaternion.push(quat.x, quat.y, quat.z, quat.w);
      //console.log({ positions, quaternions });
      
      instanceQuaternion = quaternions;

    }

    const scale = scaleFunc ? scaleFunc() : 1;

    if (curve) {
      instanceOffset.push(
        positions[i].x + rand(1),
        positions[i].y + scale * offset.y - 1,
        positions[i].z + rand(1),
      );
    } else {
      // instanceOffset.push(
      //   positions[i * 3],
      //   positions[i * 3 + 1],
      //   positions[i * 3 + 2],
      // );
      instanceOffset = positions;//.push(positions[i]);
    }

    instanceScale.push(
      scale,
      scale,
      scale,
    );
    // randomize which quadrant of the texture to use
    instanceMapUV.push(
      Math.random() > 0.5 ? 0.5 : 0.0,
      Math.random() > 0.5 ? 0.5 : 0.0,
    );
  }

  instancedGeo.setAttribute('instanceOffset',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceOffset), 3, false));
  instancedGeo.setAttribute('instanceScale',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceScale), 3, false));
  instancedGeo.setAttribute('instanceMapUV',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceMapUV), 2, false));
  if (material.userData.faceToQuat) {
    instancedGeo.setAttribute('instanceQuaternion',
      new THREE.InstancedBufferAttribute(new Float32Array(instanceQuaternion), 4, false));
      console.log({ instanceQuaternion });
      
  }



  material.needsUpdate = true;
  material.uniformsNeedUpdate = true;

  const mesh = new THREE.Mesh(instancedGeo, material);

  mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);

  if (depthMaterial) mesh.customDepthMaterial = depthMaterial;
  // mesh.frustumCulled = false; // this is probably not best: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
  mesh.castShadow = true;
  mesh.userData.type = 'instancedMesh';
  mesh.name = name;
  return mesh;
};


export const createSampledInstanceMesh = ({ 
  baseGeometry,
  mesh,
  material,
  count,
  name,
  lookAtNormal,
  rotateFunc,
  scaleFunc,
}) => {
  const geometry = new THREE.InstancedBufferGeometry().copy(baseGeometry);
  geometry.computeBoundingSphere();

  const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
  instancedMesh.name = name;
  instancedMesh.userData.type = 'instancedMesh';

  const sampler = new MeshSurfaceSampler(mesh)
    .setWeightAttribute(null)
    .build();

  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    sampler.sample(position, normal);
    normal.add(position);

    dummy.position.copy(position);
    if (lookAtNormal) {

      dummy.lookAt(normal);
      if (rotateFunc) dummy.rotateOnWorldAxis(up, rotateFunc());
      // dummy,

      //if (i < 50) console.log(dummy)
    }
    if (scaleFunc) dummy.scale.setY(scaleFunc());
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
    instancedMesh.instanceMatrix.needsUpdate = true;
  }
  console.log({ instancedMesh })
  return instancedMesh;
};