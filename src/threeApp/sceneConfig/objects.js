import * as THREE from 'three';

import { trackCrossSection, trackUVGenerator } from '../custom/geometries/track';
import { trackKerbCrossSection, getIncludeSegments } from '../custom/geometries/trackKerb';
import { grassCrossSectionL, grassCrossSectionR } from '../custom/geometries/grass';
import { treesCrossSection } from '../custom/geometries/trees';
import { barriersCrossSection, barriersUVGenerator } from '../custom/geometries/barriers';
import { terrainCrossSection, getTerrainCurve } from '../custom/geometries/terrain';

import { trackParams } from '../custom/geometries/trackParams';
 
import { createVehicle } from '../custom/geometries/vehicle';

export const objectsIndex = [
  {
    name: 'groundPlane',
    type: 'PlaneBufferGeometry',
    params: [1, 1, 1, 1],
    position: [0, -0.1, 0],
    rotation: [-Math.PI * 0.5, 0, 0],
    material: 'green',
    shadows: {
      receive: false,
      cast: false,
    },
    add: true,
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
    material: 'road',
    physics: {
      mass: 0,
      friction: 1,
      restitution: 0.1,
    },
    shadows: {
      receive: true,
      cast: false,
    },
    add: true,
    uv2Params: [1, 0.1],
  },
  {
    name: 'terrain',
    type: 'ExtrudeGeometry',
    params: [
      terrainCrossSection,
      {
        steps: 50,//trackParams.steps,
        depth: 0,
        UVGenerator: trackUVGenerator,
        extrudePath: getTerrainCurve(),
        widthFactor: trackParams.widthFactor,
      },
    ],
    position: [0, 0.0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'mappedFlat',
    shadows: {
      receive: false,
      cast: false,
    },
    add: false,
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
    material: 'kerb',
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
    name: 'grassL',
    type: 'ExtrudeGeometry',
    params: [
      grassCrossSectionL,
      {
        steps: trackParams.steps,
        depth: 0,
        // UVGenerator: trackUVGenerator,
        extrudePath: trackParams.centerLine,
        widthFactor: trackParams.widthFactor,
        autoCloseShape: true,
      },
    ],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'GrassMaterial',
    physics: {
      mass: 0,
      friction: 100,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: false,
    },
    add: true,
  },
  {
    name: 'grassR',
    type: 'ExtrudeGeometry',
    params: [
      grassCrossSectionR,
      {
        steps: trackParams.steps,
        depth: 0,
        // UVGenerator: trackUVGenerator,
        extrudePath: trackParams.centerLine,
        widthFactor: trackParams.widthFactor,
        autoCloseShape: true,
      },
    ],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'GrassMaterial',
    physics: {
      mass: 0,
      friction: 100,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: false,
    },
    add: true,
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
    material: 'guardRails',
    physics: {
      mass: 0,
      friction: 0,
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
    rotation: [-Math.PI * 0.5, 0, 0],
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
    add: false,
  },
  {
    name: 'porsche_911gt2',
    type: 'GLTF',
    //link: 'https://sketchfab.com/3d-models/ruf-rt-12s-f215e8aa71da449095f4e7dceb373893',
    url: {
      path: 'assets/objects/', //porsche_911gt2/',
      file: 'porsche_911gt2.gltf',//'wheel.gltf',
    },
    position: [4, 0, 0], // [-4, 2, 0],
    rotation: [-Math.PI * 0.5, Math.PI, 0],
    scale: [0.01, 0.01, 0.01],
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
  {
    name: 'wheel',
    type: 'GLTF',
    //link: 'https://sketchfab.com/3d-models/ruf-rt-12s-f215e8aa71da449095f4e7dceb373893',
    url: {
      path: 'assets/objects/', //porsche_911gt2/',
      file: 'wheel.gltf',//'wheel.gltf',
    },
    position: [0.16, 0, 0], // [-4, 2, 0],
    rotation: [0, 0, 0],
    scale: [0.01, 0.01, 0.01],
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
  {
    name: 'vehicle',
    type: 'custom',
    params: 'custom',
    customFunction: createVehicle,
    position: [10, 5, 0],
    scale: [1, 1, 1],
    material: 'wireFrame',//wireFrame',//,//'asphalt',
    physics: {
      mass: 0,
      friction: 0.1,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'skyline',
    type: 'CylinderBufferGeometry',
    params: [1, 1, 0.2, 36, 1, true],
    position: [0, 30, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'skyline',
    shadows: {
      receive: false,
      cast: false,
    },
    add: true,
  },
];
