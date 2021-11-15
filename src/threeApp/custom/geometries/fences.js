import * as THREE from 'three';
import { createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
import { InstancesStandardMaterial, InstancesDepthMaterial } from '../materials/InstancesStandardMaterials';
import { computeFrenetFrames } from '../../helpers/curveHelpers';

const fences1 = (trackParams) => {
  const shape = new THREE.Shape([
    new THREE.Vector2(-0.5, -(trackParams.trackHalfWidth + trackParams.vergeWidth + 0.2)),
    new THREE.Vector2(-3, -(trackParams.trackHalfWidth + trackParams.vergeWidth + 0.2)),
    new THREE.Vector2(-3.5, -(trackParams.trackHalfWidth + trackParams.vergeWidth - 0.3)),
  ]);
  return shape;
};

const fences2 = (trackParams) => {
  const shape = new THREE.Shape([
    new THREE.Vector2(-0.5, (trackParams.trackHalfWidth + trackParams.vergeWidth + 0.2)),
    new THREE.Vector2(-3, (trackParams.trackHalfWidth + trackParams.vergeWidth + 0.2)),
    new THREE.Vector2(-3.5, (trackParams.trackHalfWidth + trackParams.vergeWidth - 0.3)),
  ]);
  return shape;
};

export const fencesCrossSection = (trackParams) => [fences1(trackParams), fences2(trackParams)];

export const decorateFences = (fences, scene, trackParams) => {
  const geometry = fencePostGeometry();

  // every other step gets a fencepost
  const pointsCount = Math.floor(trackParams.steps * 0.5);

  const material = new InstancesStandardMaterial({
    color: 0xaaaaaa,
    side: THREE.DoubleSide,
    userData: {
      faceToQuat: true,
    },
    shininess: 100,
    specular: 0xaaaaaa,
  });

  const depthMaterial = new InstancesDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
    userData: {
      faceToQuat: true,
    },
  });

  const points = trackParams.centerLine.getSpacedPoints(pointsCount);
  const { binormals } = computeFrenetFrames(trackParams.centerLine, pointsCount);

  const adjustedPoints = points.reduce((a, p, i) => (
    [
      ...a,
      p.clone().sub(binormals[i].clone().multiplyScalar(trackParams.trackHalfWidth + trackParams.vergeWidth + 0.4)),
      p.clone().sub(binormals[i].clone().multiplyScalar(-(trackParams.trackHalfWidth + trackParams.vergeWidth + 0.4))),
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
    if (i % 2 === 0) {
      return { x: 1, y: 1, z: 1 };
    }
    return { x: -1, y: 1, z: 1 };
  };

  const instancedMesh = createInstancedMesh({
    geometry,
    count: adjustedPoints.length,
    offset: new THREE.Vector3(0, 0, 0),
    name: `fencePostInstance-${0}`,
    material,
    depthMaterial,
    positions,
    quaternions,
    scaleFunc,
    shadow: {
      cast: true,
      receive: true,
    },
  });
  scene.add(instancedMesh);

  // signs

  const loader = new THREE.TextureLoader();
  const map = loader.load('./assets/textures/billboards_map.jpg');
  //const map = loader.load('./assets/textures/UV_Grid_Sm.jpg');

  //map.repeat.set(1, 0.5);
  //map.offset.set(0, 0.25);
  // map.wrapS = THREE.MirroredRepeatWrapping;
  // map.wrapT = THREE.MirroredRepeatWrapping;

  const signMaterial = new InstancesStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    userData: {
      faceToQuat: true,
    },
    shininess: 100,
    specular: 0xaaaaaa,
    map,
  });

  const signDepthMaterial = new InstancesDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
    userData: {
      faceToQuat: true,
    },
  });

  const signGeo = new THREE.PlaneBufferGeometry(3, 1);
  signGeo.rotateY(Math.PI * 0.5);
  signGeo.translate(0.25, 2, 0);
  const signPositions = [];
  const signQuaternions = [];
  
  for (let i = 0; i < 100; i++) {
    if (Math.random() > 0.3) {
      signPositions.push(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
      );
      signQuaternions.push(
        quaternions[i * 4],
        quaternions[i * 4 + 1],
        quaternions[i * 4 + 2],
        quaternions[i * 4 + 3],
      );
    }
  }

  const instancedSigns = createInstancedMesh({
    geometry: signGeo,
    count: 100,//adjustedPoints.length,
    //offset: new THREE.Vector3(0, 0, 1),
    name: `fenceSignInstance-${0}`,
    material: signMaterial,
    depthMaterial: signDepthMaterial,
    positions: signPositions,
    quaternions: signQuaternions,
    scaleFunc,
    shadow: {
      cast: true,
      receive: true,
    },
  });
  scene.add(instancedSigns);


};


const fencePostGeometry = () => {
  const h = 3;
  const d = 0.1;
  const vertices = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(d, 0, 0),
    new THREE.Vector3(0, h, 0),
    new THREE.Vector3(d, h, 0),
    new THREE.Vector3(0.5, h + 0.5, 0),
    new THREE.Vector3(0.5 + d, h + 0.5, 0),

    new THREE.Vector3(0, 0, d),
    new THREE.Vector3(0, h, d),
    new THREE.Vector3(0.5, h + 0.5, d),
  ];

  const faces = [
    new THREE.Face3(0, 1, 2),
    new THREE.Face3(1, 2, 3),
    new THREE.Face3(2, 3, 4),
    new THREE.Face3(3, 5, 4),

    new THREE.Face3(0, 2, 6),
    new THREE.Face3(6, 2, 7),

    new THREE.Face3(7, 2, 8),
    new THREE.Face3(2, 8, 4),
  ];

  const geometry = new THREE.Geometry();
  geometry.vertices = vertices;
  geometry.faces = faces;
  geometry.computeFaceNormals();
  geometry.computeFlatVertexNormals();

  const bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

  return bufferGeometry;
};
