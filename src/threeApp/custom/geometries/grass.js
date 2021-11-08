import * as THREE from 'three';
import { patchShader } from '../../materials/extend';
import { createSampledInstanceMesh, createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
import { InstancesStandardMaterial, InstancesDepthMaterial } from '../materials/InstancesStandardMaterials';
import { getQuatFromNormal, rand } from '../../helpers/helpers';
import { computeFrenetFrames } from '../../helpers/curveHelpers';
import { Vector3 } from 'three';

export const grassCrossSectionR = (trackParams) => {
  const shape = new THREE.Shape();
  shape.moveTo(0.1, -trackParams.trackHalfWidth + 0.3);
  shape.lineTo(-0.7, -trackParams.vergeWidth - 5);
  return shape;
};

export const grassCrossSectionL = (trackParams) => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.7, trackParams.vergeWidth + 5);
  shape.lineTo(0.1, trackParams.trackHalfWidth - 0.3);
  return shape;
};

export const grassEdgeL = (trackParams) => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.65, trackParams.trackHalfWidth + trackParams.vergeWidth - 0.3);
  shape.lineTo(-2.5, trackParams.trackHalfWidth + trackParams.vergeWidth - 0.3);
  return shape;
};

export const grassUVGenerator = {
  generateTopUV(geometry, vertices, indexA, indexB, indexC) {
    const aX = vertices[indexA * 3];
    const aY = vertices[indexA * 3 + 1];
    const bX = vertices[indexB * 3];
    const bY = vertices[indexB * 3 + 1];
    const cX = vertices[indexC * 3];
    const cY = vertices[indexC * 3 + 1];

    return [new THREE.Vector2(aX * 0.1, aY), new THREE.Vector2(bX * 0.1, bY), new THREE.Vector2(cX * 0.1, cY)];
  },

  // generateSideWallUV(geometry, vertices, indexA, indexB, indexC, indexD) {
  //   // simple uv 1:1 mapping:
  //   return [
  //     new THREE.Vector2(0, 10),
  //     new THREE.Vector2(1, 10),
  //     new THREE.Vector2(1, 0),
  //     new THREE.Vector2(0, 0),
  //   ];
  // },
};

// export const grassCrossSection = [grassCrossSection1, grassCrossSection2];

const createGrassClumps = (mesh, scene, materials) => {
  const plane = new THREE.PlaneBufferGeometry(0.8, 0.8);
  const up = new Vector3(0, 1, 0);

  //   var uvAttribute = plane.attributes.uv;
  //   console.log({ uvAttribute });

  // for ( var i = 0; i < uvAttribute.count; i ++ ) {

  //     var u = uvAttribute.getX( i );
  //     var v = uvAttribute.getY( i );

  //     // do something with uv

  //     // write values back to attribute

  //     uvAttribute.setXY( i, -u, -v );

  // }

  const loader = new THREE.TextureLoader();
  const map = loader.load('./assets/textures/tiledTrees_map.png');
  //const map = loader.load('../assets/textures/grass_map_sq_512.jpg');
  
  const normalMap = loader.load('./assets/textures/tree_block_normal2.png');

  const material = new InstancesStandardMaterial({
    map,
    side: THREE.DoubleSide,
    normalMap,
    normalScale: new THREE.Vector2(0.5, 0.5),
    depthFunc: THREE.LessDepth,
    color: 0x888888,
    specular: 0x000000,
    userData: {
      //faceToCamera: true,
    },
  });

  const { instancedMesh, positions } = createSampledInstanceMesh({
    baseGeometry: plane,
    mesh,
    material,//: materials.red, //['GrassEdgeMaterial'],//GrassClumpMaterial,
    count: 300000,
    name: 'grassClumps',
    lookAtNormal: true,
    scaleFunc: () => 1.25,
    translateFunc: (v) => v.translateOnAxis(up, -0.5),
    rotateFunc: (v) => {
      v.rotateX(Math.PI * 0.5);
      v.rotateY(-Math.PI * 0.5);
      v.rotateZ(Math.PI);
    },
  });
  const instancedMeshTest = createInstancedMesh({
    geometry: plane,
    positions,
    count: 100000,
    offset: new THREE.Vector3(0, 0, 0), // treeHeight * 0.5,
    name: `xxx`,
    material,
    //depthMaterial,
    //scaleFunc,
    shadow: {
      cast: true,
      receive: true,
    },
  });
  console.log({ instancedMeshTest });
  
  scene.add(instancedMeshTest);

  //scene.add(instancedMesh);
};

const createDirt = (mesh, scene, trackParams) => {
  const { binormals, normals, tangents } = computeFrenetFrames(trackParams.centerLine, trackParams.steps);
  const centerLinePoints = trackParams.centerLine.getSpacedPoints(trackParams.steps);

  //const plane = new THREE.PlaneBufferGeometry(4, 1);
  const plane = new THREE.PlaneBufferGeometry(10, 1.5);

  //plane.rotateX(-Math.PI / 2);
  // plane.rotateY(-Math.PI / 2);
  // plane.rotateZ(-Math.PI / 2);

  const loader = new THREE.TextureLoader();
  const map = loader.load('./assets/textures/sand2_map.png');
  map.repeat.set(1, 1);
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
  // const helper = new THREE.VertexNormalsHelper(mesh, 2, 0x00ffff, 1);
  //scene.add(helper);

  const instancedMesh = createSampledInstanceMesh({
    baseGeometry: plane,
    mesh,
    material,
    count: 5000,
    name: 'dirt',
    lookAtNormal: true,
    uv: { u: 0.0, v: 0.95 },
    //rotateFunc: () => Math.PI / 2,
  });
  scene.add(instancedMesh);
};

export const decorateGrass = (mesh, scene, trackParams, materials) => {
  createGrassClumps(mesh, scene, materials);
  createDirt(mesh, scene, trackParams);
};

// create custom material with vertex clipping and proper alpha
const GrassClumpMaterial = new THREE.MeshLambertMaterial({
  color: 0xaaaaaa,
  map: new THREE.TextureLoader().load('./assets/textures/grass_alpha.png'),
  side: THREE.DoubleSide,
});

GrassClumpMaterial.onBeforeCompile = (shader) => {
  patchShader(shader, {
    uniforms: {
      clipDistance: 50.0,
    },
    header: 'uniform float clipDistance;',
    fragment: {
      'gl_FragColor = vec4( outgoingLight, diffuseColor.a );': `if ( diffuseColor.a < 0.95 ) discard; // remove low alpha values
      gl_FragColor = vec4( outgoingLight * diffuseColor.a, diffuseColor.a );`,
    },
    vertex: {
      project_vertex: {
        '@gl_Position = projectionMatrix * mvPosition;': `
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
        '@gl_Position = projectionMatrix * mvPosition;': `
        gl_Position = projectionMatrix * mvPosition;
        if (gl_Position.z > clipDistance) gl_Position.w = 0.0/0.0;
        `,
      },
    },
  });
};
