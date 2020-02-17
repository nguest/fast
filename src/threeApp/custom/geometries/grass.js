import * as THREE from 'three';
import { trackParams } from './trackParams';
import { patchShader } from '../../materials/extend';
import { MeshSurfaceSampler } from '../../helpers/MeshSurfaceSampler';

const grassCrossSection1 = new THREE.Shape();
grassCrossSection1.moveTo(0.1, -trackParams.trackHalfWidth + 0.3);
grassCrossSection1.lineTo(-1, -20);

const grassCrossSection2 = new THREE.Shape();
grassCrossSection2.moveTo(-1, 20);
grassCrossSection2.lineTo(0.1, trackParams.trackHalfWidth - 0.3);

export const grassCrossSection = [grassCrossSection1, grassCrossSection2];

export const decorateGrass = (mesh, scene) => {
  const plane = new THREE.PlaneBufferGeometry(0.5, 0.25);
  //plane.rotateX(-Math.PI * 0.5);
  //plane.rotateZ(Math.PI * 0.5);
  plane.translate(0, 0.125, 0);

  const geometry = new THREE.InstancedBufferGeometry().copy(plane);
  const count = 100000;
  geometry.computeBoundingSphere();

  const instancedMesh = new THREE.InstancedMesh(geometry, GrassClumpMaterial, count);
  instancedMesh.name = 'grassClumps';
  instancedMesh.userData.type = 'instancedMesh';

  const sampler = new MeshSurfaceSampler(mesh)
    .setWeightAttribute(null)
    .build();

  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    sampler.sample(position, normal);
    normal.add(position);

    dummy.position.copy(position);
    //dummy.lookAt(normal);
    dummy.updateMatrix();

    instancedMesh.setMatrixAt(i, dummy.matrix);
    instancedMesh.instanceMatrix.needsUpdate = true;
  }

  scene.add(instancedMesh);
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
  onBeforeCompile: (shader) => {
    patchShader(shader, {
      uniforms: {
        uDecal: new THREE.Vector4(0, 0, 0.2, 0.8), //(p.u, pv, scale (0.5 is fill uv))
        uDecal2: new THREE.Vector4(-0.5, -0.5, 0.2, 0.2),
        tDecal: loader.load('https://threejs.org/examples/textures/sprite0.png'),
        clipDistance: 100.0,
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
  },
});
