import * as THREE from 'three';
import { createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
import { InstancesStandardMaterial, InstancesDepthMaterial } from '../materials/InstancesStandardMaterials';
import { MeshSurfaceSampler } from '../../helpers/MeshSurfaceSampler';

export const terrainCrossSection = (trackParams) => (
  new THREE.Shape([
    new THREE.Vector2(-1.5, trackParams.trackHalfWidth + 4),
    new THREE.Vector2(0, trackParams.trackHalfWidth + 2),
  ]));

export const decorateTerrainSmall = (mesh, scene) => {
  const plane = new THREE.PlaneBufferGeometry(0.5, 0.5);
  plane.name = 'bushes';
  const loader = new THREE.TextureLoader();
  const map = loader.load('./assets/textures/longgrassclumps_map.png');
  const material = new InstancesStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    userData: {
      faceToCamera: true,
    },
    //blending: THREE.MultiplyBlending,
    //transparent: true,
    //opacity: 0.7,
    map,
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
    positions.push(position.x, position.y + 0.15, position.z);
  }

  const depthMaterial = new InstancesDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map,
    alphaTest: 0.5,
    userData: {
      faceToCamera: true,
    },
  });

  const instancedMesh = createInstancedMesh({
    geometry: plane,
    mesh,
    material,
    depthMaterial,
    count,
    name: 'longGrasses',
    lookAtCamera: true,
    positions,
    scaleFunc: () => Math.random() * 0.75 + 0.5,
    shadow: {
      receive: true,
    },
  });
  scene.add(instancedMesh);
}