import * as THREE from 'three';
import { computeFrenetFrames } from '../../helpers/curveHelpers';
import { createSampledInstanceMesh, createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
import { InstancesStandardMaterial, InstancesDepthMaterial } from '../materials/InstancesStandardMaterials';
import { patchShader } from '../../materials/extend';
import { rand } from '../../helpers/helpers';

export const trackCrossSection = (trackParams) => {
  const shape = new THREE.Shape();
  shape.moveTo(0, trackParams.trackHalfWidth);
  shape.lineTo(0, -trackParams.trackHalfWidth);
  return shape;
}

export const trackUVGenerator = {
  generateTopUV(geometry, vertices, indexA, indexB, indexC) {
    const aX = vertices[indexA * 3];
    const aY = vertices[indexA * 3 + 1];
    const bX = vertices[indexB * 3];
    const bY = vertices[indexB * 3 + 1];
    const cX = vertices[indexC * 3];
    const cY = vertices[indexC * 3 + 1];

    return [
      new THREE.Vector2(aX, aY),
      new THREE.Vector2(bX, bY),
      new THREE.Vector2(cX, cY),
    ];
  },

  generateSideWallUV(geometry, vertices, indexA, indexB, indexC, indexD ) {
    // const kx = 1;//0.1
    // const ky = 1;//10
    // const kz = 1;//0.1

    // let a_x = vertices[indexA * 3] * kx;
    // let a_y = vertices[indexA * 3 + 1] * ky;
    // let a_z = vertices[indexA * 3 + 2] * kz;
    // let b_x = vertices[indexB * 3] * kx;
    // let b_y = vertices[indexB * 3 + 1] * ky;
    // let b_z = vertices[indexB * 3 + 2] * kz;
    // let c_x = vertices[indexC * 3] * kx;
    // let c_y = vertices[indexC * 3 + 1] * ky;
    // let c_z = vertices[indexC * 3 + 2] * kz;
    // let d_x = vertices[indexD * 3] * kx;
    // let d_y = vertices[indexD * 3 + 1] * ky;
    // let d_z = vertices[indexD * 3 + 2] * kz;
    // console.log({ a_x, a_y, a_z });
    // console.log({ b_x, b_y, b_z });
    // console.log({ c_x, c_y, c_z });
    // console.log({ d_x, d_y, d_z });

    // const u = 1;
    // const v = 1;

    // simple uv 1:1 mapping:
    return [
      new THREE.Vector2(0, 1),
      new THREE.Vector2(1, 1),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 0),
    ];
  },
};

export const decorateTrack = (trackMesh, scene, trackParams, material) => {

  //const helper = new THREE.VertexNormalsHelper(trackMesh, 2, 0x00ff00, 1);
  //scene.add(helper);

  const plane = new THREE.PlaneBufferGeometry(0.2, 10);
  const instancedMesh = createSampledInstanceMesh({
    baseGeometry: plane,
    mesh: trackMesh,
    material: TrackMarksMaterial,
    count: trackParams.length * 3,
    name: 'trackMarks',
    lookAtNormal: true,
    scaleFunc: () => rand(2),
    //rotateFunc: () => new Vector3(Math.PI * 0.5
  });
  instancedMesh.position.y = 0.1;

  //scene.add(instancedMesh);


  /// TRY NO 2
  // 
  const pointsCount = Math.floor(trackParams.steps * 1);
  const curve = new THREE.CatmullRomCurve3(trackParams.racingLine);

  const points = curve.getSpacedPoints(pointsCount);
  const { binormals } = computeFrenetFrames(curve, pointsCount);

  const adjustedPoints = points.reduce((a, p, i) => (
    [
      ...a,
      p.clone().sub(binormals[i].clone().multiplyScalar(1 * rand(1))),
      p.clone().sub(binormals[i].clone().multiplyScalar(-(1 * rand(1)))),
    ]
  ), []);

  const positions = [];
  const quaternions = [];
  const dummyQuat = new THREE.Quaternion();
  const x = new THREE.Vector3(1, 0, 0);
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < adjustedPoints.length; i += 1) {
    positions.push(
      adjustedPoints[i].x,
      adjustedPoints[i].y,
      adjustedPoints[i].z,
    );
    const angleX = binormals[Math.floor(i * 0.5)].angleTo(x);
    dummyQuat.setFromAxisAngle(up, angleX);

    quaternions.push(
      dummyQuat.x,
      dummyQuat.y,
      dummyQuat.z,
      dummyQuat.w,
    );
  }

  const scaleFunc = (i) => {
    // if (i % 2 === 0) {
    //   return { x: 1, y: 1, z: 1 };
    // }
    return { x: 1, y: rand(2), z: rand(2) };
  };

  const mat = new InstancesStandardMaterial({
    color: 0x111111,
    map: new THREE.TextureLoader().load('./assets/textures/racingLine_map.png'),
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    //transparent: true,
    opacity: 0.1,
    renderOrder: 1,
    polygonOffsetUnits: -1.0,
    userData: {
      faceToQuat: true,
      opacityDiscardLimit: 0.01,
    },
    shininess: 1,
    specular: 0xaaaaaa,
  });

  const depthMaterial = new InstancesDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
    userData: {
      faceToQuat: true,
    },
  });

  const geometry = new THREE.PlaneBufferGeometry(0.2, 10);
  geometry.rotateX(Math.PI * 0.5);
  geometry.translate(0, 0.1, 0);

  const instancedMesh2 = createInstancedMesh({
    geometry,
    count: adjustedPoints.length * 2,
    offset: new THREE.Vector3(0, 0, 0),
    name: 'trackMarkInstance',
    material: mat,
    depthMaterial,
    positions,
    quaternions,
    scaleFunc,
    shadow: {
      cast: false,
      receive: true,
    },
  });
  console.log({instancedMesh2  });
  //instancedMesh2.position.y += 0.1;

  
  scene.add(instancedMesh2);
};

// create custom material with vertex clipping and proper alpha
const TrackMarksMaterial = new THREE.MeshLambertMaterial({
  color: 0x000000,
  map: new THREE.TextureLoader().load('./assets/textures/racingLine_map.png'),
  side: THREE.FrontSide,
  polygonOffset: true,
  polygonOffsetFactor: -1,
  transparent: true,
  opacity: 0.2,
  renderOrder: 1,
  polygonOffsetUnits: -1.0,
});

TrackMarksMaterial.map.wrapS = THREE.MirroredRepeatWrapping;
TrackMarksMaterial.map.wrapT = THREE.MirroredRepeatWrapping;
TrackMarksMaterial.map.repeat.set(2, 1);

TrackMarksMaterial.onBeforeCompile = (shader) => {
  patchShader(shader, {
    uniforms: {
      clipDistance: 50.0,
    },
    header: 'uniform float clipDistance;',
    // fragment: {
    //   'gl_FragColor = vec4( outgoingLight, diffuseColor.a );':
    //   `if ( diffuseColor.a < 0.95 ) discard; // remove low alpha values
    //   gl_FragColor = vec4( outgoingLight * diffuseColor.a, diffuseColor.a );`,
    // },
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
TrackMarksMaterial.customDistanceMaterial = CustomDistanceMaterial;

const CustomDistanceMaterial = new THREE.MeshDistanceMaterial({
  depthPacking: THREE.RGBADepthPacking,
  alphaTest: 0.5
});

CustomDistanceMaterial.onBeforeCompile = (shader) => {
  // app specific instancing shader code
  shader.vertexShader = `
    #define DEPTH_PACKING 3201
        attribute vec3 offset;
        attribute vec4 orientation;

        vec3 applyQuaternionToVector( vec4 q, vec3 v ){
           return v + 2.0 * cross( q.xyz, cross( q.xyz, v ) + q.w * v );
        }
      ${shader.vertexShader}`;
  shader.vertexShader = shader.vertexShader.replace(
    '#include <project_vertex>',
    `                     
        vec3 vPosition = offset + applyQuaternionToVector( orientation, transformed );
 
        vec4 mvPosition = modelMatrix * vec4( vPosition, 1.0 );
        transformed = vPosition;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );`,
  );

  shader.fragmentShader = `
    #define DEPTH_PACKING 3201
    ${shader.fragmentShader}`;
};
