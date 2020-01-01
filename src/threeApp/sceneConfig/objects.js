import * as THREE from 'three';

import { calculateFaces, calculateVertices, planeUnwrapUVs } from '../custom/geometries/concaveExample1';
import { trackCrossSection, trackUVGenerator } from '../custom/geometries/track';
import { trackKerbCrossSection } from '../custom/geometries/trackKerb';
import { grassCrossSection } from '../custom/geometries/grass';
import { barrierCrossSection } from '../custom/geometries/barriers';

import { centerLine } from '../custom/geometries/centerLine';


import { createVehicle } from '../custom/geometries/vehicle';

export const objectsIndex = [
  {
    name: 'groundPlane',
    type: 'PlaneBufferGeometry',
    params: [1000, 1000, 1, 1],
    position: [0, -0.1, 0],
    rotation: [-Math.PI * 0.5, 0, 0],
    material: 'mappedFlat',
    physics: {
      mass: 0,
      friction: 1,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: false,
    },
    add: false,
  },
  {
    name: 'track',
    type: 'ExtrudeGeometry',
    params: [
      trackCrossSection,
      {
        steps: 100,
        depth: 0,
        UVGenerator: trackUVGenerator,
        extrudePath: centerLine,
      },
    ],
    position: [0, 0.0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'road',//'asphalt',//'mappedFlat',//wireFrame',//,//'asphalt',
    physics: {
      mass: 0,
      friction: 1,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'trackKerb',
    type: 'ExtrudeGeometry',
    params: [
      trackKerbCrossSection,
      {
        steps: 50,
        depth: 0,
        UVGenerator: trackUVGenerator,
        extrudePath: centerLine,
        renderEndCaps: false,
        autoCloseShape: false,
      },
    ],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'mappedRed',//'asphalt',//'mappedFlat',//wireFrame',//,//'asphalt',
    physics: {
      mass: 0,
      friction: 1,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'grass',
    type: 'ExtrudeGeometry',
    params: [
      grassCrossSection,
      {
        steps: 50,
        depth: 0,
        UVGenerator: trackUVGenerator,
        extrudePath: centerLine,
      },
    ],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'grass',//'asphalt',//'mappedFlat',//wireFrame',//,//'asphalt',
    physics: {
      mass: 0,
      friction: 1,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'barriers',
    type: 'ExtrudeGeometry',
    params: [
      barrierCrossSection,
      {
        steps: 50,
        depth: 0,
        UVGenerator: trackUVGenerator,
        extrudePath: centerLine,
      },
    ],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'metalPlate',//'asphalt',//'mappedFlat',//wireFrame',//,//'asphalt',
    physics: {
      mass: 0,
      friction: 1,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'rufrt12s',
    type: 'GLTF',
    url: {
      path: 'assets/objects/ruf_rt-12s/',
      file: 'scene.gltf',
    },
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [0.2, 0.2, 0.2],
    physics: {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'vehicle',
    type: 'custom',
    params: 'custom',
    customFunction: createVehicle,
    position: [0, 0.5, 0],
    rotation: [0, Math.PI, 0],
    scale: [1, 1, 1],
    material: 'wireFrame',//wireFrame',//,//'asphalt',
    physics: {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },

   // {
  //   name: 'sphere2',
  //   type: 'SphereBufferGeometry',
  //   params: [10, 10, 10],
  //   position: [50, 130, -70],
  //   material: 'redShiny',
  //   physics: {
  //     mass: 1,
  //     friction: 0.8,
  //   },
  //   shadows: {
  //     receive: true,
  //     cast: true,
  //   },
  //   add: false,
  // },
  // {
  //   name: 'concaveExample1',
  //   type: 'Geometry',
  //   params: 'custom',
  //   position: [0, 1, 0],
  //   rotation: [0, 0, 0],
  //   material: 'redMapped',//'wireFrame',//'redMapped',
  //   physics: {
  //     mass: 0,
  //     friction: 0.8,
  //     restitution: 0.5,
  //   },
  //   shadows: {
  //     receive: true,
  //     cast: true,
  //   },
  //   calculateVertices,
  //   calculateFaces,
  //   calculateUVs: planeUnwrapUVs,
  //   add: false,
  // },
   // {
  //   name: 'box',
  //   type: 'BoxBufferGeometry',
  //   params: [1.8, 0.8, 4.5, 1, 1, 1],
  //   position: [-10, 0.55, 10],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1],
  //   material: 'mappedFlat',
  //   physics: {
  //     mass: 0,
  //     friction: 0.8,
  //     restitution: 0.5,
  //   },
  //   shadows: {
  //     receive: true,
  //     cast: true,
  //   },
  //   add: false,
  // },
];
