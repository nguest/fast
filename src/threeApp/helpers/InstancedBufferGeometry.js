import * as THREE from 'three';
import { MeshSurfaceSampler } from './MeshSurfaceSampler';
import { rand } from './helpers';

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
  scaleFunc = null,
  shadow,
}) => {
  const instancedGeo = new THREE.InstancedBufferGeometry().copy(geometry);

  positions = curve ? curve.getSpacedPoints(count) : positions;

  let instanceOffset = [];
  const instanceScale = [];
  let instanceQuaternion = [];
  const instanceMapUV = [];

  if (material.userData.faceToQuat) {
    instanceQuaternion = quaternions;
  }

  for (let i = 0; i < count; i++) {
    const scale = scaleFunc ? scaleFunc(i) : { x: 1, y: 1, z: 1 };

    if (curve) {
      instanceOffset.push(
        positions[i].x + rand(1),
        positions[i].y + scale.y * offset.y - 1,
        positions[i].z + rand(1),
      );
    } else {
      instanceOffset = positions;
    }

    instanceScale.push(
      scale.x,
      scale.y,
      scale.z,
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
  }

  material.needsUpdate = true;
  material.uniformsNeedUpdate = true;

  const mesh = new THREE.Mesh(instancedGeo, material);

  mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);

  if (depthMaterial) mesh.customDepthMaterial = depthMaterial;
  // mesh.frustumCulled = false; //
  // this is probably not best:
  // https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
  if (shadow) {
    mesh.castShadow = shadow.cast;
    mesh.receiveShadow = shadow.receive;
  }
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
  uv,
}) => {
  const geometry = new THREE.InstancedBufferGeometry().copy(baseGeometry);
  geometry.computeBoundingSphere();

  const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
  instancedMesh.name = name;
  instancedMesh.userData.type = 'instancedMesh';

  const sampler = new MeshSurfaceSampler(mesh, uv)
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
    }
    if (scaleFunc) dummy.scale.setY(scaleFunc());
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
    instancedMesh.instanceMatrix.needsUpdate = true;
  }
  instancedMesh.receiveShadow = true;
  return instancedMesh;
};
