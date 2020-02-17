
import * as THREE from 'three';

import { MeshSurfaceSampler } from './MeshSurfaceSampler';
import { rand } from './helpers';

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