import * as THREE from 'three';

// import Config from '../../config';

export const createMaterial = ({
  name,
  type,
  color,
  map,
  side,
  wireframe = false,
  flatShading = false,
  emissive,
}, assets) => {
  console.log({ zzz: assets })
    const material = new THREE[type]({
      name,
      color,
      flatShading,
      roughness: 1,
      metalness: 0,
      side: THREE[side],
      wireframe,
      emissive,
      map: assets.map
    });

    return material;
};
