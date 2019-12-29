import TWEEN from '@tweenjs/tween.js';

// This object contains the state of the app
export const Config = {
  isDev: true,
  showStats: true,
  isLoaded: false,
  isTweening: false,
  isRotating: true,
  isMouseMoving: false,
  isMouseOver: false,
  maxAnisotropy: 1,
  dpr: 1,
  easing: TWEEN.Easing.Quadratic.InOut,
  duration: 500,
  renderer: {
    antialias: true,
    alpha: true,
  },
  container: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  mesh: {
    enableHelper: false,
    wireframe: false,
    translucent: false,
    material: {
      color: 0xffffff,
      emissive: 0xffffff,
    },
  },
  fog: {
    color: 0xaaaaaa,
    near: 0.0008,
  },
  camera: {
    fov: 45,
    near: 2,
    far: 2000,
    aspect: 1,
    posX: 0,
    posY: 500,
    posZ: 20,
    lookAt: [0, 0, 0],
  },
  controls: {
    autoRotate: false,
    autoRotateSpeed: -0.5,
    rotateSpeed: 0.5,
    zoomSpeed: 0.8,
    minDistance: 10,
    maxDistance: 1000,
    minPolarAngle: -Math.PI / 2,
    maxPolarAngle: Math.PI / 2,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    enableDamping: true,
    dampingFactor: 0.5,
    enableZoom: true,
    target: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  skyBox: {
    position: [0, 0, 0],
  },
  gravity: [0, -100, 0],
};
