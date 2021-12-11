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
  quadrants,
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
      instanceOffset.push(positions[i].x + rand(1.2), positions[i].y + scale.y * offset.y - 1, positions[i].z + rand(1.2));
    } else {
      instanceOffset = positions;
    }

    instanceScale.push(scale.x, scale.y, scale.z);

    // randomize which quadrant of the texture to use
    let xCount = 2;
    let yCount = 2;
    if (quadrants) {
      [xCount, yCount] = quadrants;
    }

    instanceMapUV.push(Math.random() > 0.5 ? 0.5 : 0.0, Math.random() > 0.5 ? 0.5 : 0.0);
    //instanceMapUV.push(0.0, 0.5);    
  }

  instancedGeo.setAttribute('instanceOffset', new THREE.InstancedBufferAttribute(new Float32Array(instanceOffset), 3, false));
  instancedGeo.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(new Float32Array(instanceScale), 3, false));
  instancedGeo.setAttribute('instanceMapUV', new THREE.InstancedBufferAttribute(new Float32Array(instanceMapUV), 2, false));
  if (material.userData.faceToQuat) {
    instancedGeo.setAttribute('instanceQuaternion', new THREE.InstancedBufferAttribute(new Float32Array(instanceQuaternion), 4, false));
  }
  instancedGeo.instanceCount = count;

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
  translateFunc,
  uv,
}) => {
  const geometry = new THREE.InstancedBufferGeometry().copy(baseGeometry);
  geometry.computeBoundingSphere();

  const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
  instancedMesh.name = name;
  instancedMesh.userData.type = 'instancedMesh';
  instancedMesh.material.needsUpdate = true;

  const sampler = new MeshSurfaceSampler(mesh, uv).setWeightAttribute(0).build();

  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const dummy = new THREE.Object3D();

  const positions = [];

  for (let i = 0; i < count; i++) {
    sampler.sample(position, normal);
    normal.add(position);
    dummy.position.copy(position);

    if (lookAtNormal) {
      dummy.lookAt(normal);

      if (rotateFunc) rotateFunc(dummy);
      if (translateFunc) translateFunc(dummy);
    }
    if (scaleFunc) dummy.scale.setY(scaleFunc());
    dummy.updateMatrix();
    positions.push(position.x, position.y, position.z);
    instancedMesh.setMatrixAt(i, dummy.matrix);
    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.material.needsUpdate = true;
  }
  instancedMesh.receiveShadow = true;
  //instancedMesh.castShadow = true;

  return { instancedMesh, positions };
};
