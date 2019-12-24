export const lightsIndex = [
  {
    name: 'ambientLight',
    type: 'AmbientLight',
    addToScene: true,
    color: 0x141414,
  },
  {
    name: 'directionalLight',
    type: 'DirectionalLight',
    addToScene: true,
    color: 0xfff0f0,
    intensity: 0.4,
    position: [0, 300, 50],
    castShadow: true,
    helperEnabled: true,
    target: [0, 0, 0],
    shadow: {
      bias: 0,
      mapWidth: 2048,
      mapHeight: 2048,
      camera: {
        near: 0,
        far: 400,
        top: 200,
        right: 200,
        bottom: -200,
        left: -200,
      }
    }
  },
  {
    name: 'pointLight',
    type: 'PointLight',
    addToScene: true,
    color: 0xffffff,
    intensity: 0.34,
    position: [0, 0, 0],
    visible: false,
  },
  {
    name: 'hemisphereLight',
    type: 'HemisphereLight',
    addToScene: true,
    color: 0xc8c8c8,
    intensity: 0.5,
    position: [0, 0, 0],
    visible: false,
  },
];
