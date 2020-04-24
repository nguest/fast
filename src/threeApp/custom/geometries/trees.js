import * as THREE from 'three';
import { getTreeline } from './treeline';
import { createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
import { InstancesStandardMaterial, InstancesDepthMaterial } from '../materials/InstancesStandardMaterials';

const treesCrossSection1 = (trackParams) => {
  const shape = new THREE.Shape();
  shape.moveTo(0.1, -trackParams.trackHalfWidth - 10);
  shape.lineTo(-8, -trackParams.trackHalfWidth - 10);
  return shape;
};

const treesCrossSection2 = (trackParams) => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.1, trackParams.trackHalfWidth + 10);
  shape.lineTo(-8, trackParams.trackHalfWidth + 10);
  return shape;
};

export const treesCrossSection = [treesCrossSection1, treesCrossSection2];

export const createTrees = (scene, trackParams) => {
  const treeHeight = 12;
  const treePlane = new THREE.PlaneBufferGeometry(7, treeHeight, 1, 1);
  treePlane.translate(0, treeHeight * 0.5, 0);
  treePlane.name = 'treePlane';
  const loader = new THREE.TextureLoader();
  const map = loader.load('./assets/textures/tiledTrees_map.png');
  const normalMap = loader.load('./assets/textures/tree_block_normal2.png');

  const material = new InstancesStandardMaterial({
    map,
    side: THREE.DoubleSide,
    normalMap,
    normalScale: new THREE.Vector2(0.5, 0.5),
    depthFunc: THREE.LessDepth,
    color: 0x888888,
    specular: 0x000000,
    userData: {
      faceToCamera: true,
    },
  });

  const depthMaterial = new InstancesDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map,
    alphaTest: 0.5,
    userData: {
      faceToCamera: true,
    },
  });

  const scaleFunc = () => {
    const r = Math.random() * 0.75 + 0.75;
    return { x: r, y: r, z: r };
  };

  const { treeCurveLeft, treeCurveRight } = getTreeline(trackParams);

  [treeCurveLeft, treeCurveRight].forEach((curve, i) => {
    const instancedMesh = createInstancedMesh({
      geometry: treePlane,
      curve,
      count: Math.floor(trackParams.length / 4),
      offset: new THREE.Vector3(0, 0, 0), // treeHeight * 0.5,
      name: `treesInstance-${i}`,
      material,
      depthMaterial,
      scaleFunc,
      shadow: {
        cast: true,
      },
    });
    scene.add(instancedMesh);
  });
};
