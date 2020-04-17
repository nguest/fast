import * as THREE from 'three';
//import { trackParams } from '../custom/geometries/trackParams';
import { computeFrenetFrames } from './curveHelpers';


export const promisifyLoader = (loader, onProgress) => {
  const promiseLoader = (url) => (
    new Promise((resolve, reject) => {
      loader.load(url, resolve, onProgress, reject);
    }).catch((error) => console.log(error, url))
  );
  return {
    originalLoader: loader,
    load: promiseLoader,
  };
};

export const rand = (v) => (v * (Math.random() - 0.5));

// https://github.com/mattdesl/three-quaternion-from-normal
export const getQuatFromNormal = (normal, quat) => {
  const quaternion = quat || new THREE.Quaternion();
  const axis = new THREE.Vector3();
  // vector is assumed to be normalized
  if (normal.y > 0.99999) {
    quaternion.set(0, 0, 0, 1);
  } else if (normal.y < -0.99999) {
    quaternion.set(1, 0, 0, 0);
  } else {
    axis.set(normal.z, 0, -normal.x).normalize();
    const radians = Math.acos(normal.y);
    quaternion.setFromAxisAngle(axis, radians);
  }
  return quaternion;
};

export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
};

export const getPosQuatFromGamePosition = (gate, trackParams) => {
  const gatePositions = trackParams.centerLine.getSpacedPoints(trackParams.gateCount);
  const { tangents } = computeFrenetFrames(trackParams.centerLine, trackParams.gateCount);

  const axis = new THREE.Vector3(0, 0, 1);
  const quat = new THREE.Quaternion().setFromUnitVectors(axis, tangents[gate].clone().normalize());

  return {
    position: gatePositions[gate],
    quat,
  };
};

export const getObjByName = (scene, name) => scene.children.find((object) => object.name === name);

export const getObjectsByType = (scene, type) => scene.children.filter((object) => object.userData.type === type);

export const scaleBackground = (scene) => {
  const track = getObjByName(scene, 'track');
  track.geometry.computeBoundingSphere();
  track.geometry.computeBoundingBox();
  const { boundingBox, boundingSphere } = track.geometry;

  const skyline = getObjByName(scene, 'skyline');
  skyline.position.set(boundingSphere.center.x, boundingSphere.center.y, boundingSphere.center.z);
  skyline.scale.setScalar(boundingSphere.radius * 2);

  const groundPlane = getObjByName(scene, 'groundPlane');
  groundPlane.position.set(boundingSphere.center.x, boundingBox.min.y - 1, boundingSphere.center.z);
  groundPlane.scale.setScalar(boundingSphere.radius * 2);
};
