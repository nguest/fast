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
    color: 0xfffed7,
    intensity: 2.5,
    position: [80, 50, 40],
    castShadow: true,
    helperEnabled: true,
    target: [0, 0, 0],
    shadow: {
      bias: -0.0001,
      mapWidth: 2048,
      mapHeight: 2048,
      // camera: {
      //   near: 20,
      //   far: 200,
      //   top: 100,
      //   right: 100,
      //   bottom: -100,
      //   left: -100,
      // },
      camera: {
        near: 0,
        far: 150,
        top: 150,
        right: 150,
        bottom: -150,
        left: -150,
      },
    },
  },
  // {
  //   name: 'spotLight',
  //   type: 'SpotLight',
  //   addToScene: true,
  //   color: 0xfff0f0,
  //   intensity: 3,
  //   angle: Math.PI / 3,
  //   penumbra: 1.0, // 0 > 1
  //   position: [40, 25, 30],
  //   castShadow: true,
  //   helperEnabled: true,
  //   target: [0, 0, 0],
  //   shadow: {
  //     bias: 0.005, // stop self-shadowing - tweak by tiny amounts
  //     mapWidth: 2048,
  //     mapHeight: 2048,
  //     camera: {
  //       near: 20,
  //       far: 100,
  //       top: 100,
  //       right: 100,
  //       bottom: -100,
  //       left: -100,
  //     },
  //   },
  // },
  {
    name: 'hemisphereLight',
    type: 'HemisphereLight',
    addToScene: true,
    color: 0xfffed2,
    intensity: 0.45,
    position: [0, 10, 0],
    visible: true,
  },
];
