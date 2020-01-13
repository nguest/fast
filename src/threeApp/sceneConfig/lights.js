export const lightsIndex = [
  {
    name: 'ambientLight',
    type: 'AmbientLight',
    addToScene: false,
    //color: 0x000000,
    intensity: 0.3,
  },
  {
    name: 'directionalLight',
    type: 'DirectionalLight',
    addToScene: true,
    color: 0xffff44,
    intensity: 2.2,
    position: [40, 15, 30],
    castShadow: true,
    helperEnabled: true,
    target: [0, 0, 0],
    shadow: {
      bias: 0,
      mapWidth: 2048,
      mapHeight: 2048,
      camera: {
        near: 0,
        far: 100,
        top: 10,
        right: 100,
        bottom: -10,
        left: -10,
      },
    },
  },
  // {
  //   name: 'spotLight',
  //   type: 'SpotLight',
  //   addToScene: false,
  //   color: 0xfff0f0,
  //   intensity: 1,
  //   angle: Math.PI / 5,
  //   penumbra: 0.5,
  //   position: [50, 50, 0],
  //   castShadow: true,
  //   helperEnabled: true,
  //   target: [0, 0, 0],
  //   shadow: {
  //     bias: 0,
  //     mapWidth: 2048,
  //     mapHeight: 2048,
  //     camera: {
  //       near: 0,
  //       far: 400,
  //       top: 200,
  //       right: 200,
  //       bottom: -200,
  //       left: -200,
  //     },
  //   },
  // },
  {
    name: 'hemisphereLight',
    type: 'HemisphereLight',
    addToScene: true,
    color: 0xffffff,
    intensity: 1,
    position: [0, 10, 0],
    visible: true,
  },
];
