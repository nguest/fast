
import * as THREE from 'three';

import { MeshSurfaceSampler } from './MeshSurfaceSampler';
import { BufferGeometryUtils } from './BufferGeometryUtils';
import { computeFrenetFrames } from './curveHelpers';

import { rand } from './helpers';

export const createInstancedMesh = ({ geometry, curve, count, offset, name, material, depthMaterial }) => {
  const instancedGeo = new THREE.InstancedBufferGeometry().copy(geometry);

  const positions = curve.getSpacedPoints(count);
  const { binormals, normals, tangents } = computeFrenetFrames(curve, count);

  const instanceOffset = [];
  const instanceScale = [];
  const instanceQuaternion = [];
  const instanceMapUV = [];

  for (let i = 0; i < count; i++) {
    // quaternion.setFromUnitVectors(
    //   up,
    //   //new THREE.Vector3(binormals[i].x, 0, binormals[i].z);
    //   new THREE.Vector3(Math.random() * Math.PI, 0, Math.random() * Math.PI)
    // );
    // quaternion.normalize();

    const scale = Math.random() * 0.75 + 0.75;

    instanceOffset.push(
      positions[i].x + rand(1),
      positions[i].y + scale * offset.y - 1,
      positions[i].z + rand(1),
    );
    //instanceQuaternion.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
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
  // treeGeo1.setAttribute('instanceQuaternion',
  //   new THREE.InstancedBufferAttribute(new Float32Array(instanceQuaternion), 4, false));


  material.needsUpdate = true;
  material.uniformsNeedUpdate = true;

  const mesh = new THREE.Mesh(instancedGeo, material);


  mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);

  if (depthMaterial) mesh.customDepthMaterial = depthMaterial;
  // mesh1.frustumCulled = false; // this is probably not best: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
  mesh.castShadow = true;
  mesh.userData.type = 'instancedMesh';
  mesh.name = name;
  console.log({ 'iii': mesh })
  return mesh;
};


export const createSampledInstanceMesh = ({ baseGeometry, mesh, material, count, name, lookAtNormal }) => {
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
      dummy.rotateOnWorldAxis(up, rand(0.2));
      // dummy,

      //if (i < 50) console.log(dummy)
    }
    dummy.scale.setY(rand(2))
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
    instancedMesh.instanceMatrix.needsUpdate = true;
  }
  console.log({ instancedMesh })
  return instancedMesh;
};