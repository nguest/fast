import TWEEN from '@tweenjs/tween.js';

// This object contains the state of the app
export default {
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
    color: 0x444444,
    near: 0.0008,
  },
  camera: {
    fov: 45,
    near: 2,
    far: 1000,
    aspect: 1,
    posX: 0,
    posY: 130,
    posZ: 200,
  },
  controls: {
    autoRotate: false,
    autoRotateSpeed: -0.5,
    rotateSpeed: 0.5,
    zoomSpeed: 0.8,
    minDistance: 200,
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
