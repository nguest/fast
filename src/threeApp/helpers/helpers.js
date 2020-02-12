import * as THREE from 'three';
import { trackParams } from '../custom/geometries/trackParams';
import { computeFrenetFrames } from './curveHelpers';


export const promisifyLoader = (loader, onProgress) => {
  const promiseLoader = (url) => (
    new Promise((resolve, reject) => {
      loader.load(url, resolve, onProgress, reject);
    })
  );
  return {
    originalLoader: loader,
    load: promiseLoader,
  };
};

export const rand = (v) => (v * (Math.random() - 0.5));

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

export const getPosQuatFromGamePosition = (gate) => {
  const gatePositions = trackParams.centerLine.getSpacedPoints(trackParams.gateCount);
  const { binormals, normals, tangents } = computeFrenetFrames(trackParams.centerLine, trackParams.gateCount);

  const axis = new THREE.Vector3(0, 0, 1);
  const quat = new THREE.Quaternion().setFromUnitVectors(axis, tangents[gate].clone().normalize());

  return {
    position: gatePositions[gate],
    quat,
  };
};

export const getObjByName = (scene, name) => scene.children.find((object) => object.name === name);

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
