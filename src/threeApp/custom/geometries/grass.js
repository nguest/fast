import * as THREE from 'three';
import { VertexTangentsHelper } from '../../helpers/VertexTangentsHelper';
import { BufferGeometryUtils } from '../../helpers/BufferGeometryUtils';
import { trackParams } from './trackParams';
import { patchShader } from '../../materials/extend';
import { createSampledInstanceMesh, createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
import { InstancesStandardMaterial, InstancesDepthMaterial } from '../materials/InstancesStandardMaterials';
import { getQuatFromNormal, rand } from '../../helpers/helpers';
import { computeFrenetFrames } from '../../helpers/curveHelpers';


export const grassCrossSectionR = new THREE.Shape();
grassCrossSectionR.moveTo(0.1, -trackParams.trackHalfWidth + 0.3);
grassCrossSectionR.lineTo(-0.7, -16);

export const grassCrossSectionL = new THREE.Shape();
grassCrossSectionL.moveTo(-0.7, 16);
grassCrossSectionL.lineTo(0.1, trackParams.trackHalfWidth - 0.3);

//export const grassCrossSection = [grassCrossSection1, grassCrossSection2];

const createGrassClumps = (mesh, scene) => {
  const plane = new THREE.PlaneBufferGeometry(0.5, 0.25);

  plane.translate(0, 0.125, 0);

  const instancedMesh = createSampledInstanceMesh({
    baseGeometry: plane,
    mesh,
    material: GrassClumpMaterial,
    count: 100000,
    name: 'grassClumps',
    lookAtNormal: true,
    scaleFunc: () => rand(2),
    rotateFunc: () => rand(0.2),
  });
  scene.add(instancedMesh);
};

const createDirt = (mesh, scene) => {
  const { binormals, normals, tangents } = computeFrenetFrames(trackParams.centerLine, trackParams.steps);
  console.log({ tangents });
  const centerLinePoints = trackParams.centerLine.getSpacedPoints(trackParams.steps);


  //const plane = new THREE.PlaneBufferGeometry(4, 1);
  const plane = new THREE.PlaneBufferGeometry(10, 1.5);

  //plane.rotateX(-Math.PI / 2);
  // plane.rotateY(-Math.PI / 2);
  // plane.rotateZ(-Math.PI / 2);

  const loader = new THREE.TextureLoader()
  const map = loader.load('./assets/textures/sand_map.png');
  map.repeat.set(10, 1.5);
  map.wrapS = THREE.MirroredRepeatWrapping;
  map.wrapT = THREE.MirroredRepeatWrapping;

  const material = new THREE.MeshLambertMaterial({
    color: 0x555555,
    //map: new THREE.TextureLoader().load('./assets/textures/grassClump64_map.png'),
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    transparent: true,
    opacity: 1.0,
    map,
    //renderOrder: 1,
  
  });
  // const material = new InstancesStandardMaterial({
  //   side: THREE.DoubleSide,
  //   //depthFunc: THREE.LessDepth,
  //   color: 0xff0000,
  //   userData: {
  //     faceToQuat: true,
  //   },
  //   polygonOffset: true,
  //   polygonOffsetFactor: -1,
  // });

  const depthMaterial = new InstancesDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
    userData: {
      faceToQuat: true,
    },
  });

  // const dummyQuat = new THREE.Quaternion();
  // const dummyRot = new THREE.Vector3();
  // const positions = [];
  // const quaternions = [];

  // const count = 50;
  // const k = 18;

  // for (let i = 0; i < count; i++) {
  //   positions.push(
  //     mesh.geometry.attributes.position.array[i * 3 * k],
  //     mesh.geometry.attributes.position.array[i * 3 * k + 1]+0.5,
  //     mesh.geometry.attributes.position.array[i * 3 * k + 2],
  //   );

  //   dummyRot.set(
  //     mesh.geometry.attributes.normal.array[i * 3 * k],
  //     mesh.geometry.attributes.normal.array[i * 3 * k + 1],
  //     mesh.geometry.attributes.normal.array[i * 3 * k + 2],
  //   );
  //   //const quat = getQuatFromNormal(dummyRot.normalize(), dummyQuat);
  //   const t = tangents[Math.floor(i * 0.166666 * k)];
  //   const rotation = new THREE.Vector3(0, 0.2, 0.8);//.rotateX(Math.PI/2)
  //   const quat = getQuatFromNormal(rotation//[Math.floor(k * i)]
  //     //.sub(centerLinePoints[Math.floor(i * 0.25 * k)])
  //     // .add(new THREE.Vector3(
  //     //   mesh.geometry.attributes.position.array[i * 3 * k],
  //     //   mesh.geometry.attributes.position.array[i * 3 * k + 1],
  //     //   mesh.geometry.attributes.position.array[i * 3 * k + 2],
  //     // ))
  //     .normalize(), dummyQuat);
  //   //rotate.multiply(quat);
  //   //console.log({ rotation });

  //   quaternions.push(quat.x, quat.y, quat.z, quat.w);
  // }

  


  // const instancedMesh = createInstancedMesh({
  //   geometry: plane,
  //   count,//Math.floor(trackParams.length / 4),
  //   offset: new THREE.Vector3(0, 1, 0), // treeHeight * 0.5,
  //   name: 'dirt',
  //   material,
  //   // userData: {
  //   //   faceToQuat: true,
  //   // },
  //   depthMaterial,
  //   positions,//: mesh.geometry.attributes.position.array,
  //   quaternions,//: mesh.geometry.attributes.normal.array,
  // });
  // scene.add(instancedMesh);
  const helper = new THREE.VertexNormalsHelper(mesh, 2, 0x00ffff, 1);
  //scene.add(helper);

  const instancedMesh = createSampledInstanceMesh({
    baseGeometry: plane,
    mesh,
    material,
    count: 5000,
    name: 'dirt',
    lookAtNormal: true,
    uv: { u: 0.0, v: 0.95, },
    //rotateFunc: () => Math.PI / 2,
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
