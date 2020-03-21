import * as THREE from 'three';
import { trackParams } from './trackParams';
import { getSpacedPoints, computeFrenetFrames } from '../../helpers/curveHelpers';
import { signedTriangleArea } from '../../helpers/apexHelpers';
//import createApexes from './track';
// import { createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
// import { InstancesStandardMaterial, InstancesDepthMaterial } from '../materials/InstancesStandardMaterials';
// import { MeshSurfaceSampler } from '../../helpers/MeshSurfaceSampler';

export const racingLineCrossSection = new THREE.Shape([
  new THREE.Vector2(-0, 1),
  new THREE.Vector2(-0, -1),
]);


export const racingLineCurve = () => {
  const centerLine = trackParams.centerLine;
  const steps = trackParams.steps;
  const { binormals, tangents } = computeFrenetFrames(centerLine, steps);
  const points = centerLine.getSpacedPoints(steps);

  const angles = tangents.map((t, i, arr) => {
    if (arr[i - 1] && arr[i + 1]) {
      const signedArea = signedTriangleArea(points[i - 1], points[i], points[i + 1]);
      const dir = Math.sign(signedArea);
      return 0.5 * arr[i - 1].angleTo(arr[i + 1]) * dir;
    }
    return 0;
  });


  console.log('MX', Math.max(...angles), Math.min(...angles));
  console.log({ binormals, points });
  
  // const signedArea = signedTriangleArea(points[i - 1], points[i], points[i + 1]);
  // const dir = Math.sign(signedArea);
  const shiftedPoints = points.reduce((a, p, i) => {
    //console.log((trackParams.trackHalfWidth) * angles[i] * 100);
    if (i % 2 === 1) {
      let averageAngle = 0;
      if (angles[i+1]) {
        averageAngle = (angles[i-1] + angles[i] + angles[i+1])/3;
      }
     
      const shiftK = Math.min(
        trackParams.trackHalfWidth * Math.tan(averageAngle) * 20,
        trackParams.trackHalfWidth,
      );

      const point = p.sub(
        binormals[i]
          .clone()
          .multiplyScalar(shiftK),
      );
      return [...a, point];
    }
    return a;
  }, []);

  const curve = new THREE.CatmullRomCurve3(shiftedPoints);
  curve.closed = true;
  curve.arcLengthDivisions = steps;

  return curve;
}

export const racingLineCurve2 = () => {
  const apexes = trackParams.apexes;
  const centerLine = trackParams.centerLine;
  const steps = trackParams.steps;

  const apexPoints = apexes.map((apex, i) => {
    const apexMarkerPosn = apex.p
      // .sub(
      //   apex.binormal
      //     .clone()
      //     .multiplyScalar((trackParams.trackHalfWidth - 1) * apex.dir),
      // );
    const position = new THREE.Vector3(apexMarkerPosn.x, apexMarkerPosn.y + 0.1, apexMarkerPosn.z);
    return position;
  });

  const rawCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0), ...apexPoints]);
  rawCurve.closed = true;
  rawCurve.arcLengthDivisions = steps;
  //const rawCurve.getSpaced
  const apexSpacedPoints = getSpacedPoints(rawCurve, steps);
  const centerLineSpacedPoints = getSpacedPoints(centerLine, steps);
  const spacedPoints = apexSpacedPoints.map((p, i) => new THREE.Vector3(p.x, centerLineSpacedPoints[i].y + 0.2, p.z));
  console.log({ centerLineSpacedPoints, spacedPoints });
  
  // TODO: need same steps as centerline and adjust height to be above track
  const curve = new THREE.CatmullRomCurve3(spacedPoints);
  curve.closed = true;
  return curve;
}
