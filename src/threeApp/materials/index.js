import * as THREE from 'three';

export const createMaterial = ({
  name,
  type,
  color,
  map,
  side,
  wireframe = false,
  flatShading = false,
  emissive = 0x000000,
}, assets) => {
  const material = new THREE[type]({
    name,
    color,
    flatShading,
    side: THREE[side],
    wireframe,
    emissive,
    map: assets[map],
  });

  material.map.wrapT = THREE.RepeatWrapping;
  material.map.wrapS = THREE.RepeatWrapping;
  return material;
};
