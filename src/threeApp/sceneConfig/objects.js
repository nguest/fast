import * as THREE from 'three';

import { trackCrossSection, trackUVGenerator } from '../custom/geometries/track';
import { trackKerbCrossSection, getIncludeSegments } from '../custom/geometries/trackKerb';
import { grassCrossSectionL, grassCrossSectionR, grassEdgeL, grassUVGenerator } from '../custom/geometries/grass';
import { treesCrossSection } from '../custom/geometries/trees';
import { barriersCrossSection, barriersUVGenerator } from '../custom/geometries/barriers';
import { fencesCrossSection } from '../custom/geometries/fences';
import { getTerrainCurve } from '../custom/geometries/terrain';
import { terrainCrossSection } from '../custom/geometries/terrainSmall';
import { racingLineCrossSection } from '../custom/geometries/racingLine';

import { createVehicle } from '../custom/geometries/vehicle';

export const objectsIndex = (trackParams) => ([
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
    type: 'CustomExtrudeGeometry',
    params: [
      trackCrossSection(trackParams),
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
    name: 'racingLine',
    type: 'CustomExtrudeGeometry',
    params: [
      racingLineCrossSection(trackParams),
      {
        steps: trackParams.steps,
        depth: 0,
        UVGenerator: trackUVGenerator,
        extrudePath: new THREE.CatmullRomCurve3(trackParams.racingLine),
        widthFactor: trackParams.widthFactor,
        autoCloseShape: true,
      },
    ],
    position: [0, 0.1, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'roadRacingLine',//'wireFrame',//'mappedFlat',//roadRacingLine',
    shadows: {
      receive: true,
      cast: false,
    },
    opacity: 0,
    add: true,
  },
  {
    name: 'terrain',
    type: 'CustomExtrudeGeometry',
    params: [
      terrainCrossSection(trackParams),
      {
        steps: 50, // trackParams.steps,
        depth: 0,
        UVGenerator: trackUVGenerator,
        extrudePath: getTerrainCurve(trackParams),
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
    name: 'terrainSmall',
    type: 'CustomExtrudeGeometry',
    params: [
      terrainCrossSection(trackParams),
      {
        steps: trackParams.steps,
        depth: 0,
        // UVGenerator: trackUVGenerator,
        extrudePath: trackParams.centerLine,
        widthFactor: trackParams.widthFactor,
      },
    ],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'LongGrassMaterial',
    shadows: {
      receive: true,
      cast: false,
    },
    add: false,
    uv2Params: [1, 0.1],
  },
  {
    name: 'trackKerb',
    type: 'CustomExtrudeGeometry',
    params: [
      trackKerbCrossSection(trackParams),
      {
        steps: trackParams.steps,
        depth: 0,
        UVGenerator: trackUVGenerator,
        extrudePath: trackParams.centerLine,
        renderEndCaps: false,
        autoCloseShape: false,
        includeSegments: getIncludeSegments(trackParams),
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
    type: 'CustomExtrudeGeometry',
    params: [
      grassCrossSectionL(trackParams),
      {
        steps: trackParams.steps,
        depth: 0,
        //UVGenerator: grassUVGenerator,
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
    type: 'CustomExtrudeGeometry',
    params: [
      grassCrossSectionR(trackParams),
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
  // {
  //   name: 'grassEdgeL',
  //   type: 'CustomExtrudeGeometry',
  //   params: [
  //     grassEdgeL(trackParams),
  //     {
  //       steps: trackParams.steps,
  //       depth: 0,
  //       UVGenerator: barriersUVGenerator,
  //       extrudePath: trackParams.centerLine,
  //       widthFactor: trackParams.widthFactor,
  //       autoCloseShape: true,
  //     },
  //   ],
  //   position: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1],
  //   material: 'GrassEdgeMaterial',
  //   shadows: {
  //     receive: true,
  //     cast: false,
  //   },
  //   add: true,
  // },
  {
    name: 'barriers',
    type: 'CustomExtrudeGeometry',
    params: [
      barriersCrossSection(trackParams),
      {
        steps: trackParams.steps,
        depth: 0,
        UVGenerator: barriersUVGenerator,
        extrudePath: trackParams.centerLine,
        widthFactor: trackParams.widthFactor,
        // includeSegments: [[0, 0.05], [0.1, 0.2]]
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
    name: 'fences',
    type: 'CustomExtrudeGeometry',
    params: [
      fencesCrossSection(trackParams),
      {
        steps: trackParams.steps,
        depth: 0,
        UVGenerator: barriersUVGenerator,
        extrudePath: trackParams.centerLine,
        widthFactor: trackParams.widthFactor,
        // includeSegments: [[0, 0.05], [0.1, 0.2]]
      },
    ],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'chainlink',
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
    url: {
      path: 'assets/objects/',
      file: 'porsche_911gt2.gltf',
    },
    position: [4, 0, 0],
    rotation: [-Math.PI * 0.5, Math.PI, 0],
    scale: [0.01, 0.01, 0.01],
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'wheel',
    type: 'GLTF',
    // link: 'https://sketchfab.com/3d-models/ruf-rt-12s-f215e8aa71da449095f4e7dceb373893',
    url: {
      path: 'assets/objects/',
      file: 'wheel.gltf',
    },
    position: [0.16, 0, 0],
    rotation: [0, 0, 0],
    scale: [0.01, 0.01, 0.01],
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
    material: 'wireFrame',
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
]);
