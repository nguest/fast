import TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';

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
  gammaFactor: 1.1,
  dpr: 1.5,//.5,
  easing: TWEEN.Easing.Quadratic.InOut,
  duration: 500,
  clipDistance: 200,
  renderer: {
    antialias: false, // 'true' has serious framerate implications!
    alpha: false,
    //logarithmicDepthBuffer: true,
    //toneMapping: THREE.CineonToneMapping,//ACESFilmicToneMapping,

    //precision: 'lowP'
  },
  container: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  res: {
    x: 2560,
    y: 1440,
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
    near: 0.00001,
    enable: true,
  },
  camera: {
    fov: 45,
    near: 0.1,
    far: 40000,
    aspect: 1,
    position: [-30, 20, 20],
    lookAt: [0, 0, 0],
  },
  followCam: {
    fov: 60,
    near: 0.1,
    far: 10000,
    aspect: 1,
    position: [0, 1.45, -4.5],
    ß: 30,
    clipDistance: 20,
  },
  useBasicMaterials: false,
  useFollowCam: true,
  controls: {
    autoRotate: false,
    autoRotateSpeed: -0.5,
    rotateSpeed: 0.5,
    zoomSpeed: 0.8,
    minDistance: 2,
    maxDistance: 20000,
    minPolarAngle: -Math.PI / 2,
    maxPolarAngle: Math.PI / 2,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    enableDamping: true,
    dampingFactor: 0.5,
    enableZoom: true,
    target: [0, 0, 0],
  },
  skyBox: {
    position: [0, 0, 0],
  },
  gravity: [0, -10, 0],
};
