export const materialsIndex = [
  {
    name: 'mappedRed',
    type: 'MeshPhongMaterial',
    color: 0xff0000,
    map: {
      name: 'UVGrid',
    },
    side: 'DoubleSide',
    wireframe: false,
  },
  {
    name: 'mappedFlat',
    type: 'MeshPhongMaterial',
    color: 0xffffff,
    map: {
      name: 'UVGrid',
    },
    side: 'DoubleSide',
    wireframe: false,
    emissive: 0x000022,
  },
  {
    name: 'wireFrame',
    type: 'MeshPhongMaterial',
    color: 0xff0000,
    side: 'FrontSide',
    wireframe: true,
    wireframeLinewidth: 5,
    emissive: 0x000000,
  },
  {
    name: 'road',
    type: 'MeshStandardMaterial',
    color: 0xffffff,
    roughness: 1,
    map: {
      name: 'Road_Map',
      wrapping: 'MirroredRepeatWrapping',
      repeat: [2, 1],
    },
    lightMap: {
      name: 'LightMap_Map',
      repeat: [0.25, 0.25],
      lightMapIntensity: 1,//0.1,
      //wrapping: 'MirroredRepeatWrapping',
    },
    normalMap: {
      name: 'Road_Normal',
      wrapping: 'MirroredRepeatWrapping',
      repeat: [2, 1],
      normalScale: [0.4, 0.4],
    },
    shininess: 20,
    specular: 0x555555,
    side: 'FrontSide',
    wireframe: false,
    emissive: 0x000000,
    transparent: true,
  },
  {
    name: 'grass',
    type: 'MeshPhongMaterial',
    color: 0xffffff,
    map: {
      name: 'Grass_Map',
      repeat: [20, 1],
      wrapping: 'MirroredRepeatWrapping',
    },
    normalMap: {
      name: 'Grass_Normal',
      //repeat: [15, 15],
      normalScale: [0.2, 0.2],
    },
    // lightMap: {
    //   name: 'LightMap_Map',
    //   repeat: [1, 1],
    //   lightMapIntensity: 0.1,
    // },
    // bumpMap: {
    //   name: 'UVGrid',
    //   repeat: [15, 15],
    //   bumpScale: 2,
    // },
    side: 'FrontSide',
    wireframe: false,
    emissive: 0x000000,
    shininess: 10,
  },
  {
    name: 'forest',
    type: 'MeshBasicMaterial',
    color: 0xffffff,
    map: {
      name: 'Forest_Map',
      repeat: [1, 1],
      wrapping: 'RepeatWrapping',
    },
    // normalMap: {
    //   name: 'Grass_Normal',
    //   repeat: [15, 15],
    //   normalScale: [0.2, 0.2],
    // },
    // lightMap: {
    //   name: 'LightMap_Map',
    //   repeat: [1, 1],
    //   lightMapIntensity: 0.1,
    // },
    // bumpMap: {
    //   name: 'UVGrid',
    //   repeat: [15, 15],
    //   bumpScale: 2,
    // },
    transparent: true,
    side: 'DoubleSide',
    wireframe: false,
    emissive: 0x000000,
    //shininess: 10,
  },
  {
    name: 'metalPlate',
    type: 'MeshPhongMaterial',
    color: 0xffffff,
    map: {
      name: 'Metalplate_Map',
      wrapping: 'RepeatWrapping',
      repeat: [10, 1],
    },
    normalMap: {
      name: 'Metalplate_Normal',
      wrapping: 'RepeatWrapping',
      repeat: [10, 1],
    },
    shininess: 0,
    specular: 0xaaaaaa,
    side: 'DoubleSide',
    wireframe: false,
    emissive: 0x000000,
  },
  {
    name: 'kerb',
    type: 'MeshPhongMaterial',
    color: 0xaaaaaa,
    map: {
      name: 'Concrete_Map',
      wrapping: 'RepeatWrapping',
      repeat: [1, 1],
    },
    normalMap: {
      name: 'Concrete_Normal',
      wrapping: 'RepeatWrapping',
      repeat: [1, 1],
      normalScale: [1, 1],
    },
    shininess: 0,
    specular: 0x000000,
    side: 'FrontSide',
    wireframe: false,
    emissive: 0x000000,
  },
  {
    name: 'guardRails',
    type: 'MeshStandardMaterial',
    color: 0xbbbbbb,
    map: {
      name: 'Metalplate_Map',
      wrapping: 'RepeatWrapping',
      repeat: [10, 3],
    },
    normalMap: {
      name: 'GuardRails_Normal',
      wrapping: 'RepeatWrapping',
      repeat: [10, 3],
    },
    metalness: 1,
    shininess: 40,
    specular: 0xaaaaaa,
    side: 'DoubleSide',
    wireframe: false,
    emissive: 0x000000,
  },
  {
    name: 'wheel',
    type: 'MeshPhongMaterial',
    color: 0xffffff,
    map: {
      name: 'Wheel_Map',
      wrapping: 'RepeatWrapping',
      repeat: [1, 1],
      offset: [-0.1, 0]
    },
    // bumpMap: {
    //   name: 'Wheel_Map',
    // },
    // normalMap: {
    //   name: 'Metalplate_Normal',
    //   wrapping: 'RepeatWrapping',
    //   repeat: [1, 20],
    // },
    shininess: 50,
    specular: 0xaaaaaa,
    side: 'FrontSide',
    wireframe: false,
    emissive: 0x000000,
  },
];
