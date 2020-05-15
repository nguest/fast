import * as THREE from 'three';
import { getSpacedPoints, computeFrenetFrames } from '../../helpers/curveHelpers';
import { splineMethod } from './splineMethod';

export const racingLineCrossSection = () => (new THREE.Shape([
  new THREE.Vector2(-0, 1.5),
  new THREE.Vector2(-0, -1.5),
]));

// line materials
const mat = {
  red: new THREE.LineBasicMaterial({ color: 0xff0000 }),
  pink: new THREE.LineBasicMaterial({ color: 0xff5555 }),
  green: new THREE.LineBasicMaterial({ color: 0x55ff55 }),
  yellow: new THREE.LineBasicMaterial({ color: 0xffff77 }),
};

export const createRacingLine = (centerLine, cpCount, trackHalfWidth) => {
  const wpCount = 7; // width section pointscount
  //const cpCount = Math.floor(centerLine.getLength() / 15); // segments in track direction
  const { binormals, tangents } = computeFrenetFrames(centerLine, cpCount);
  const cpPoints = getSpacedPoints(centerLine, cpCount);

  const t2 = performance.now();
  const { racingLineSpline, edgeTouches, apexIndices } = splineMethod(cpPoints, binormals, tangents, trackHalfWidth);
  const t3 = performance.now();
  console.info(`SplineMethod took ${t3 - t2} ms with ${cpCount} nodes`);
  const apexes = apexIndices.map((apexDets) => ({
    p: cpPoints[apexDets.idx],
    binormal: binormals[apexDets.idx],
    ...apexDets,
  }));
  return { apexes, racingLine: racingLineSpline };

  // add line objects

  // render centerline
  const cpGeometry = new THREE.BufferGeometry().setFromPoints(cpPoints);
  const cpLineObj = new THREE.Line(cpGeometry, mat.red);

  cpGeometry.computeBoundingSphere();
  const c = cpLineObj.geometry.boundingSphere;
  camera.threeCamera.position.set(c.center.x, 1000, c.center.z);
  camera.threeCamera.lookAt(c.center.x, 0, c.center.z);

  scene.add(cpLineObj);

  // render track edges
  const s = trackHalfWidth;

  const olPointsL = cpPoints.map((cp, i) => cp.clone().sub(binormals[i].clone().multiplyScalar(s)));
  const olGeometryL = new THREE.BufferGeometry().setFromPoints(olPointsL);
  const olObjL = new THREE.Line(olGeometryL, mat.red);
  scene.add(olObjL);
  const olPointsR = cpPoints.map((cp, i) => cp.clone().sub(binormals[i].clone().multiplyScalar(-s)));
  const olGeometryR = new THREE.BufferGeometry().setFromPoints(olPointsR);
  const olObjR = new THREE.Line(olGeometryR, mat.red);
  scene.add(olObjR);

  const segments = cpPoints.map((cp, i) => ([
    cp.clone().sub(binormals[i].clone().multiplyScalar(s)),
    cp.clone().sub(binormals[i].clone().multiplyScalar(-s)),
  ]));
  segments.forEach((segment) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([...segment]);
    const slObj = new THREE.Line(geometry, mat.pink);
    scene.add(slObj);
  });

  // const segments2 = matrix.map((cp) => ([
  //   ...cp,
  // ]));
  // segments2.forEach((segment) => {
  //   const geometry = new THREE.BufferGeometry().setFromPoints([...segment]);
  //   const slObj = new THREE.Line(geometry, mat.green);
  //   scene.add(slObj);
  // });

  // render spline path
  const splinePoints = racingLineSpline.reduce((out, p, i) => (
    [...out, racingLineSpline[(i + 1) % racingLineSpline.length]]
  ), []);
  splinePoints.unshift(racingLineSpline[0]);
  const geometry = new THREE.BufferGeometry().setFromPoints(splinePoints);
  const splineObj = new THREE.Line(geometry, mat.yellow);
  scene.add(splineObj);

  // render edgeTouches
  Object.keys(edgeTouches).forEach((k) => {
    const apex = edgeTouches[k];
    const sphereGeo = new THREE.SphereBufferGeometry(2, 10, 5);
    const sphere = new THREE.Mesh(sphereGeo, mat.yellow);
    const apexMarkerPosn = cpPoints[apex.idx].clone().add(binormals[apex.idx].clone().multiplyScalar(trackHalfWidth * apex.dir));
    sphere.position.set(apexMarkerPosn.x, apexMarkerPosn.y, apexMarkerPosn.z);
    scene.add(sphere);
  });

  apexes.forEach((apex) => {
    const sphereGeo = new THREE.SphereBufferGeometry(2.5, 10, 5);
    const sphere = new THREE.Mesh(sphereGeo, mat.red);
    const apexMarkerPosn = cpPoints[apex.idx].clone().add(binormals[apex.idx].clone().multiplyScalar(trackHalfWidth * apex.dir));    
    sphere.position.set(apexMarkerPosn.x, apexMarkerPosn.y, apexMarkerPosn.z);
    scene.add(sphere);
  });
};
