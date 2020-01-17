import * as THREE from 'three';

import { calculateFaces, calculateVertices, planeUnwrapUVs } from '../custom/geometries/concaveExample1';
import { trackCrossSection, trackUVGenerator } from '../custom/geometries/track';
import { trackKerbCrossSection, getIncludeSegments } from '../custom/geometries/trackKerb';
import { grassCrossSection, treesCrossSection } from '../custom/geometries/grass';
import { barriersCrossSection, barriersUVGenerator } from '../custom/geometries/barriers';

import { trackParams } from '../custom/geometries/trackParams';


import { createVehicle } from '../custom/geometries/vehicle';

export const objectsIndex = [
  // {
  //   name: 'sun',
  //   type: 'SphereBufferGeometry',
  //   params: [4, 16, 8],
  //   position: [20, 5, 0],
  //   rotation: [0, 0, 0],
  //   material: 'mappedFlat',
  //   add: true,
  // },
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
        steps: trackParams.steps,
        depth: 0,
        UVGenerator: trackUVGenerator,
        extrudePath: trackParams.centerLine,
        widthFactor: trackParams.widthFactor,
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
    uv2Params: [1, 0.1],
  },
  {
    name: 'trackKerb',
    type: 'ExtrudeGeometry',
    params: [
      trackKerbCrossSection,
      {
        steps: trackParams.steps,
        depth: 0,
        UVGenerator: trackUVGenerator,
        extrudePath: trackParams.centerLine,
        renderEndCaps: false,
        autoCloseShape: false,
        includeSegments: getIncludeSegments(),

      },
    ],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'kerb',//'asphalt',//'mappedFlat',//wireFrame',//,//'asphalt',
    // physics: {
    //   mass: 0,
    //   friction: 1,
    //   restitution: 0.5,
    // },
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
        steps: trackParams.steps,
        depth: 0,
        //UVGenerator: trackUVGenerator,
        extrudePath: trackParams.centerLine,
        widthFactor: trackParams.widthFactor,
      },
    ],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'grass',
    physics: {
      mass: 0,
      friction: 100,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'treesBg',
    type: 'ExtrudeGeometry',
    params: [
      treesCrossSection,
      {
        steps: trackParams.steps,
        depth: 0,
        UVGenerator: barriersUVGenerator,
        extrudePath: trackParams.centerLine,
        widthFactor: trackParams.widthFactor,
      },
    ],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'forest',
    // physics: {
    //   mass: 0,
    //   friction: 1,
    //   restitution: 0.5,
    // },
    shadows: {
      receive: true,
      cast: true,
    },
    add: false,
  },
  {
    name: 'barriers',
    type: 'ExtrudeGeometry',
    params: [
      barriersCrossSection,
      {
        steps: trackParams.steps,
        depth: 0,
        UVGenerator: barriersUVGenerator,
        extrudePath: trackParams.centerLine,
        widthFactor: trackParams.widthFactor,
        //includeSegments: [[0, 0.05], [0.1, 0.2]]
      },
    ],
    position: [0, -0.3, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: ['mappedFlat','guardRails'],//'asphalt',//'mappedFlat',//wireFrame',//,//'asphalt',
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
    name: 'car',
    type: 'GLTF',
    link: 'https://sketchfab.com/3d-models/ruf-rt-12s-f215e8aa71da449095f4e7dceb373893',
    url: {
      path: 'assets/objects/ruf_rt-12s/',
      file: 'scene.gltf',
    },
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [0.01, 0.01, 0.01],
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
    position: [10, 5, 0],
    rotation: [0, 1.9, 0],
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
  //   name: 'wheel',
  //   type: 'GLTF',
  //   link: 'https://sketchfab.com/3d-models/ruf-rt-12s-f215e8aa71da449095f4e7dceb373893',
  //   url: {
  //     path: 'assets/objects/',
  //     file: 'wheel.glb',
  //   },
  //   position: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   //scale: [q,q,q],
  //   // physics: {
  //   //   mass: 0,
  //   //   friction: 0.8,
  //   //   restitution: 0.5,
  //   // },
  //   shadows: {
  //     receive: true,
  //     cast: true,
  //   },
  //   add: true,
  // },

  // {
  //   name: 'wheel',
  //   //type: 'CircleBufferGeometry',
  //   type: 'RingBufferGeometry',
  //   params: [1, 0.8, 24],
  //   position: [0, 2, 5],
  //   rotation: [0, Math.PI / 4, 0],
  //   material: 'wheel',
  //   // physics: {
  //   //   mass: 1,
  //   //   friction: 0.8,
  //   // },
  //   shadows: {
  //     receive: true,
  //     cast: true,
  //   },
  //   add: true,
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
  {
    name: 'test',
    type: 'GLTF',
    url: {
      path: 'assets/objects/',
      file: 'wheel.gltf',
    },
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    // physics: {
    //   mass: 0,
    //   friction: 0.8,
    //   restitution: 0.5,
    // },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
];
