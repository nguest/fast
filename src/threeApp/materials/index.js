import * as THREE from 'three';

export const createMaterial = ({
  color,
  emissive = 0x000000,
  flatShading = false,
  map,
  name,
  normalMap,
  shininess = 30,
  side,
  specular = 0x000000,
  type,
  wireframe = false,
}, assets) => {
  const material = new THREE[type]({
    color,
    emissive,
    flatShading,
    name,
    shininess,
    side: THREE[side],
    specular,
    wireframe,
  });
  if (map) {
    material.map = assets[map.name];
    material.map.wrapT = THREE[map.wrapping] || THREE.RepeatWrapping;
    material.map.wrapS = THREE[map.wrapping] || THREE.RepeatWrapping;
    if (map.repeat) material.map.repeat.set(...map.repeat);
    if (map.offset) material.map.repeat.set(...map.offset);
  }
  if (normalMap) {
    material.normalMap = assets[normalMap.name];
    material.normalMap.wrapT = THREE[normalMap.wrapping] || THREE.RepeatWrapping;
    material.normalMap.wrapS = THREE[normalMap.wrapping] || THREE.RepeatWrapping;
    if (normalMap.repeat) material.normalMap.repeat.set(...normalMap.repeat);
    if (normalMap.offset) material.normalMap.repeat.set(...normalMap.offset);
    if (normalMap.normalScale) material.normalScale.set(...normalMap.normalScale);
  }
  return material;
};
