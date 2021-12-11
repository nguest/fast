import * as THREE from 'three';
import {
  createSampledInstanceMesh,
  createInstancedMesh,
} from '../../helpers/InstancedBufferGeometry';
import {
  InstancesStandardMaterial,
  InstancesDepthMaterial,
} from '../materials/InstancesStandardMaterials';
import { patchShader } from '../../materials/extend';
import { rand } from '../../helpers/helpers';
import { Vector3 } from 'three';

export const trackCrossSection = (trackParams) => {
  const shape = new THREE.Shape();
  shape.moveTo(0, trackParams.trackHalfWidth);
  // shape.lineTo(0.2, 0);
  shape.lineTo(0, -trackParams.trackHalfWidth);
  return shape;
};

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

  generateSideWallUV() {
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
  // const helper = new THREE.VertexNormalsHelper(trackMesh, 2, 0x00ff00, 1);
  // scene.add(helper);

  const plane = new THREE.PlaneBufferGeometry(0.2, 10);
  const { instancedMesh } = createSampledInstanceMesh({
    baseGeometry: plane,
    mesh: trackMesh,
    material: TrackMarksMaterial,
    count: trackParams.length * 3,
    name: 'trackMarks',
    lookAtNormal: true,
    scaleFunc: () => rand(2),
    // rotateFunc: () => new Vector3(Math.PI * 0.5
  });
  instancedMesh.position.y = 0.1;

  // scene.add(instancedMesh);

  // TRY NO 2
  //
  const pointsCount = Math.floor(trackParams.steps * 1);
  const curve = new THREE.CatmullRomCurve3(trackParams.racingLine);
  console.log({ pointsCount });
  
  const points = curve.getSpacedPoints(pointsCount);
  const { binormals, normals, tangents } = curve.computeFrenetFrames(pointsCount, true);

  const adjustedPoints = points.reduce(
    (a, p, i) => [
      ...a,
      p.clone().sub(binormals[i].clone().multiplyScalar(1 * rand(2.5))),
      p.clone().sub(binormals[i].clone().multiplyScalar(-(1 * rand(2.5)))),
      //p.clone().sub(binormals[i].clone().multiplyScalar(1)),
      //p.clone().sub(binormals[i].clone().multiplyScalar(-1)),
    ],
    [],
  );

  const positions = [];
  const quaternions = [];
  let dummyQuat = new THREE.Quaternion();
  let dummyObj = new THREE.Object3D();

  for (let i = 0; i < adjustedPoints.length; i += 1) {
    positions.push(
      adjustedPoints[i].x,
      adjustedPoints[i].y,
      adjustedPoints[i].z,
    );

    dummyObj.lookAt(tangents[Math.floor(i * 0.5)]);
    dummyQuat = dummyObj.quaternion;
    quaternions.push(dummyQuat.x, dummyQuat.y, dummyQuat.z, dummyQuat.w);
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
    blending: THREE.SubtractiveBlending,
    //transparent: true,
    //opacity: 0.8,
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

  const geometry = new THREE.PlaneBufferGeometry(0.5, 10);
  geometry.rotateX(Math.PI * 0.5);
  //geometry.rotateZ  (Math.PI * 0.5);
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
  // instancedMesh2.position.y += 0.1;

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
        '@gl_Position = projectionMatrix * mvPosition;': `
        gl_Position = projectionMatrix * mvPosition;
        if (gl_Position.z > clipDistance) gl_Position.w = 0.0/0.0;
        `,
      },
    },
  });
};

const CustomDistanceMaterial = new THREE.MeshDistanceMaterial({
  depthPacking: THREE.RGBADepthPacking,
  alphaTest: 0.5,
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
        gl_Position = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );`
  );

  shader.fragmentShader = `
    #define DEPTH_PACKING 3201
    ${shader.fragmentShader}`;
};

TrackMarksMaterial.customDistanceMaterial = CustomDistanceMaterial;
