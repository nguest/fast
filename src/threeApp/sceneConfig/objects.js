import * as THREE from 'three';

import { calculateFaces, calculateVertices, planeUnwrapUVs } from '../custom/geometries/concaveExample1';
import { crossSection, centerLine, UVGenerator } from '../custom/geometries/track';

import { createVehicle } from '../custom/geometries/vehicle';

export const objectsIndex = [
  {
    name: 'sphere2',
    type: 'SphereBufferGeometry',
    params: [10, 10, 10],
    position: [50, 130, -70],
    material: 'redShiny',
    physics: {
      mass: 1,
      friction: 0.8,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'groundPlane',
    type: 'PlaneBufferGeometry',
    params: [1000, 1000, 1, 1],
    position: [0, -0.1, 0],
    rotation: [-Math.PI * 0.5, 0, 0],
    material: 'mappedFlat',
    physics: {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: false,
    },
    add: true,
  },
  {
    name: 'concaveExample1',
    type: 'Geometry',
    params: 'custom',
    position: [0, 1, 0],
    rotation: [0, 0, 0],
    material: 'redMapped',//'wireFrame',//'redMapped',
    physics: {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    calculateVertices,
    calculateFaces,
    calculateUVs: planeUnwrapUVs,
    add: false,
  },
  {
    name: 'box',
    type: 'BoxBufferGeometry',
    params: [1.8, 0.8, 4.5, 1, 1, 1],
    position: [0, 0.55, 10],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'mappedFlat',
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
    name: 'track',
    type: 'ExtrudeGeometry',
    params: [
      crossSection,
      {
        steps: 50,
        depth: 0,
        UVGenerator,
        extrudePath: centerLine,
      },
    ],
    position: [0, 0.1, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'mappedFlat',//wireFrame',//,//'asphalt',
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
    position: [0, 10, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: 'mappedFlat',//wireFrame',//,//'asphalt',
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
  //   name: 'duck',
  //   type: 'GLTF',
  //   url: {
  //     path: 'assets/objects/duck/',
  //     file: 'Duck.gltf',
  //   },
  //   position: [0, 100, -105],
  //   rotation: [0, 0, 0],
  //   scale: [0.2, 0.2, 0.2],
  //   physics: {
  //     mass: 0,
  //     friction: 0.8,
  //     restitution: 0.5,
  //   },
  //   shadows: {
  //     receive: true,
  //     cast: true,
  //   },
  //   add: true,
  // },
];
