import * as THREE from 'three';
import { getSpacedPoints, computeFrenetFrames } from '../../helpers/curveHelpers';
import { signedTriangleArea } from '../../helpers/apexHelpers';
import { Vector3 } from 'three';
//import createApexes from './track';
// import { createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
// import { InstancesStandardMaterial, InstancesDepthMaterial } from '../materials/InstancesStandardMaterials';
// import { MeshSurfaceSampler } from '../../helpers/MeshSurfaceSampler';

export const racingLineCrossSection = () => (new THREE.Shape([
  new THREE.Vector2(-0, 1),
  new THREE.Vector2(-0, -1),
]));


export const racingLineCurve = (trackParams) => {
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
  
  // const signedArea = signedTriangleArea(points[i - 1], points[i], points[i + 1]);
  // const dir = Math.sign(signedArea);
  const shiftedPoints = points.reduce((a, p, i) => {
    //console.log((trackParams.trackHalfWidth) * angles[i] * 100);
    let averageAngle = 0;
    if (angles[i+1]) {
      //averageAngle = (angles[i-1] + angles[i] + angles[i+1])/3;
      averageAngle = getAverageAngle(i, angles)
      //console.log({averageAngle})
    }
    
    const shiftK = Math.min(
      trackParams.trackHalfWidth * Math.tan(averageAngle) * 40,
      trackParams.trackHalfWidth,
    );

    const point = p.sub(
      binormals[i]
        .clone()
        .multiplyScalar(shiftK),
    );
    return [...a, point];
  }, []);

  const curve = new THREE.CatmullRomCurve3(shiftedPoints);
  curve.closed = true;
  curve.arcLengthDivisions = steps;

  return curve;
}

// export const racingLineCurve2 = (trackParams) => {
//   const apexes = trackParams.apexes;
//   const centerLine = trackParams.centerLine;
//   const steps = trackParams.steps;

//   const apexPoints = apexes.map((apex, i) => {
//     const apexMarkerPosn = apex.p
//       // .sub(
//       //   apex.binormal
//       //     .clone()
//       //     .multiplyScalar((trackParams.trackHalfWidth - 1) * apex.dir),
//       // );
//     const position = new THREE.Vector3(apexMarkerPosn.x, apexMarkerPosn.y + 0.1, apexMarkerPosn.z);
//     return position;
//   });

//   const rawCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0), ...apexPoints]);
//   rawCurve.closed = true;
//   rawCurve.arcLengthDivisions = steps;
//   //const rawCurve.getSpaced
//   const apexSpacedPoints = getSpacedPoints(rawCurve, steps);
//   const centerLineSpacedPoints = getSpacedPoints(centerLine, steps);
//   const spacedPoints = apexSpacedPoints.map((p, i) => new THREE.Vector3(p.x, centerLineSpacedPoints[i].y + 0.2, p.z));
//   console.log({ centerLineSpacedPoints, spacedPoints });
  
//   // TODO: need same steps as centerline and adjust height to be above track
//   const curve = new THREE.CatmullRomCurve3(spacedPoints);
//   curve.closed = true;
//   return curve;
// }


const getAverageAngle = (i, angles, spread = 20) => {
  angles[i] + angles[i+1]

  return new Array(spread).fill(0).reduce((a, c, idx) => {
    let arrI = i + idx - spread;
    if (arrI < 0) arrI += angles.length;
    if (arrI > angles.length) arrI -= angles.length;
    return a + angles[arrI]/spread;
  }, 0);
}

export const racingLine = (trackParams) => {
  const centerLine = trackParams.centerLine;
  const steps = 10;//trackParams.steps;
  ///const { binormals, tangents } = computeFrenetFrames(centerLine, steps);
  //const cpPoints = centerLine.getSpacedPoints(steps);
  const wpCount = 7;

  const b = [
    new THREE.Vector3(0,0,10),
    // new THREE.Vector3(0,0,0),
    new THREE.Vector3(10,0,-10),
    // new THREE.Vector3(0,0,-20),
    // new THREE.Vector3(0,0,-30),
    new THREE.Vector3(0,0,-40),
  ];
  const cx = new THREE.CatmullRomCurve3(b);
  const cpPoints = cx.getSpacedPoints(wpCount);
  const { binormals, tangents } = computeFrenetFrames(cx, wpCount);
  console.log({ binormals, cpPoints });
  

  const matrix = cpPoints.map((cp) => {
    return new Array(wpCount).fill(null).map((wp, i) => {
      const s = (trackParams.trackHalfWidth * 2) / (wpCount - 1);
      return cp.clone().sub(binormals[i].clone().multiplyScalar(s * (i - (Math.floor(wpCount / 2)))));
    });
  });

  console.log({ matrix });

  const segmentValue = (pMinus1, p, pPlus1) => {
    const alpha = 0.01;
    const beta = 0.5;
    //Beta * Cos( P ) – Alpha * ( A + B );
    const v1 = p.clone().sub(pMinus1.clone());
    const v2 = pPlus1.clone().sub(p.clone());
    const theta = v1.angleTo(v2);
    //debugger;
    //console.log(beta * Math.cos(theta));
    //console.log('1::', pMinus1, p, pPlus1)
    return beta * Math.cos(theta);
    
    
    return beta * Math.cos(theta);// - alpha * (v1.length() + v2.length());
  }


  const nodes = [];

  for (let i = cpPoints.length - 2; i >= 1; i -= 1) {
    // each node on i - 1;
    let brv = 0;
    let bnn = 0;
    //nodes[i] = [];

    for (let j = 0; j < wpCount; j++) {
      // for each node on i
      for (let k = 0; k < wpCount; k++) {
        let trv;
        if (nodes[i+1] && nodes[i+1].routeValue) {
          trv = segmentValue(matrix[i-1][j], matrix[i][j], matrix[i+1][j]) + nodes[i+1].routeValue;
        } else {
          trv = segmentValue(matrix[i-1][j], matrix[i][j], matrix[i+1][j])
        }
        
        if (trv > brv) {
          brv = trv;
          bnn = j;
          nodes[i] = { routeValue: brv, nextNode: bnn };
          //console.log(i, '  ', nodes[i]);
          
        }
      }

    }
  }
  console.log({ nodes });
  
};

/*
For each node Prev on Line 5
{
    For each node Next on Line 7
    {
        This Route Value = SegmentValue( Prev to Cur to Nex) + Next’s RVM[1].m_routeValue;
 
        If (This Route Value &gt; Best Route Value So Far)
        {
            Best Route Value So Far = This Route Value;
            Best Next Node So Far = Next ;
        }
    }
    Cur’s RVM [ Prev ].m_routeValue = Best Route Value So Far;
    Cur’s RVM [ Prev ].m_routeNextNode = Best Next Node So Far;
}
*/