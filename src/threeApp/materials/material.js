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
    const material = new THREE[type]({
      name,
      color,
      flatShading,
      side: THREE[side],
      wireframe,
      emissive,
      map: assets.UVGrid,
    });

    return material;
};
