import * as THREE from 'three';
import { trackParams } from './trackParams';
import { createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
import { InstancesStandardMaterial } from '../materials/InstancesStandardMaterials';
import { MeshSurfaceSampler } from '../../helpers/MeshSurfaceSampler';

export const terrainCrossSection = new THREE.Shape([
  new THREE.Vector2(-1.5, trackParams.trackHalfWidth + 4),
  new THREE.Vector2(0, trackParams.trackHalfWidth + 2),
]);

export const decorateTerrainSmall = (mesh, scene) => {
  console.log({ mesh });

  const plane = new THREE.PlaneBufferGeometry(0.5, 0.5);
  plane.name = 'bushes';
  const material = new InstancesStandardMaterial({
    color: 0x118800,
    side: THREE.DoubleSide,
    userData: {
      faceToCamera: true,
    },
  });

  const sampler = new MeshSurfaceSampler(mesh)
    .setWeightAttribute(null)
    .build();

  const count = 150000;

  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const positions = [];

  for (let i = 0; i < count; i++) {
    sampler.sample(position, normal);
    positions.push(position.x, position.y + 0.25, position.z);
  }

  const instancedMesh = createInstancedMesh({
    geometry: plane,
    mesh,
    material,
    count,
    name: 'gg',
    lookAtCamera: true,
    positions,
    //offset: new THREE.Vector3(0, 0.25, 0),
    scaleFunc: () => 1,//Math.random() * 0.75 + 0.75,
    //uv: { u: 0.0, v: 0.95, },
    //rotateFunc: () => Math.PI / 2,
  });
  scene.add(instancedMesh);
}