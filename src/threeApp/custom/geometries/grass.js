import * as THREE from 'three';
import { trackParams } from './trackParams';
import { patchShader } from '../../materials/extend';
import { createSampledInstanceMesh, createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
import { InstancesStandardMaterial } from '../materials/InstancesStandardMaterials';


const grassCrossSection1 = new THREE.Shape();
grassCrossSection1.moveTo(0.1, -trackParams.trackHalfWidth + 0.3);
grassCrossSection1.lineTo(-0.7, -16);

const grassCrossSection2 = new THREE.Shape();
grassCrossSection2.moveTo(-0.7, 16);
grassCrossSection2.lineTo(0.1, trackParams.trackHalfWidth - 0.3);

export const grassCrossSection = [grassCrossSection1, grassCrossSection2];

const createGrassClumps = (mesh, scene) => {
  const plane = new THREE.PlaneBufferGeometry(0.5, 0.25);

  plane.translate(0, 0.125, 0);

  const instancedMesh = createSampledInstanceMesh({
    baseGeometry: plane,
    mesh,
    material: GrassClumpMaterial,
    count: 100000,
    name: 'grassClumps',
  });
  scene.add(instancedMesh);
};

const createDirt = (mesh, scene) => {
  const plane = new THREE.PlaneBufferGeometry(2, 2);
  plane.rotateX(-Math.PI/2)
  const material = new InstancesStandardMaterial({
    side: THREE.DoubleSide,
    //depthFunc: THREE.LessDepth,
    color: 0xff0000,
    userData: {
      faceToQuat: true,
    },
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });

  const quaternion = new THREE.Quaternion();

  const instancedMesh = createInstancedMesh({
    geometry: plane,
    count: 200000,//Math.floor(trackParams.length / 4),
    offset: new THREE.Vector3(0, 0.2, 0), // treeHeight * 0.5,
    name: 'dirt',
    material,
    // userData: {
    //   faceToQuat: true,
    // },
    //depthMaterial,
    positions: mesh.geometry.attributes.position.array,
    rotation: mesh.geometry.attributes.normal.array,
  });
  scene.add(instancedMesh);

}

export const decorateGrass = (mesh, scene) => {
  createGrassClumps(mesh, scene);
  createDirt(mesh, scene);
};

// create custom material with vertex clipping and proper alpha
const GrassClumpMaterial = new THREE.MeshLambertMaterial({
  color: 0xaaaaaa,
  map: new THREE.TextureLoader().load('./assets/textures/grassClump64_map.png'),
  side: THREE.DoubleSide,
});

GrassClumpMaterial.onBeforeCompile = (shader) => {
  patchShader(shader, {
    uniforms: {
      clipDistance: 50.0,
    },
    header: 'uniform float clipDistance;',
    fragment: {
      'gl_FragColor = vec4( outgoingLight, diffuseColor.a );':
      `if ( diffuseColor.a < 0.95 ) discard; // remove low alpha values
      gl_FragColor = vec4( outgoingLight * diffuseColor.a, diffuseColor.a );`,
    },
    vertex: {
      project_vertex: {
        '@gl_Position = projectionMatrix * mvPosition;':
        `
        gl_Position = projectionMatrix * mvPosition;
        if (gl_Position.z > clipDistance) gl_Position.w = 0.0/0.0;
        `,
      },
    },
  });
};


const loader = new THREE.TextureLoader();

export const GrassMaterial = new THREE.MeshLambertMaterial({
  color: 0x777777,
});

GrassMaterial.onBeforeCompile = (shader) => {
  patchShader(shader, {
    uniforms: {
      uDecal: new THREE.Vector4(0, 0, 0.2, 0.8), //(p.u, pv, scale (0.5 is fill uv))
      uDecal2: new THREE.Vector4(-0.5, -0.5, 0.2, 0.2),
      tDecal: loader.load('https://threejs.org/examples/textures/sprite0.png'),
      clipDistance: 200.0,
      // tDecal: loader.load('./assets/textures/UV_Grid_Sm.png')
    },
    header: `
    uniform sampler2D tDecal;
    uniform vec4 uDecal;
    uniform vec4 uDecal2;
    uniform float clipDistance;`,

    vertex: {
      // Inserts the line after #include <fog_vertex>
      // '#define USE_MAP true;': '#define USE_UV true;',
      // '#include <fog_vertex>': 'vEye = normalize(cameraPosition - w.xyz);',
      // Replaces a line (@ prefix) inside of the project_vertex include
      project_vertex: {
        '@gl_Position = projectionMatrix * mvPosition;':
        `
        gl_Position = projectionMatrix * mvPosition;
        if (gl_Position.z > clipDistance) gl_Position.w = 0.0/0.0;
        `,
      },
    },
  });
};
