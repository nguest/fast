import { CatmullRomCurve3, Vector3 } from 'three';
import { trackParams } from './trackParams';
// export const centerLine = new CatmullRomCurve3([
//   new Vector3(0, 0, 40),
//   new Vector3(0, 0, 0),
//   new Vector3(-5, 0, -150),
//   new Vector3(50, 0, -400),
//   new Vector3(0, 0, -850),
//   new Vector3(-100, 0, -850),
//   new Vector3(-150, 0, -1200),
// ]);

export const getTreeline = () => {
  const pointsCount = 150;
  const { normals } = trackParams.centerLine.computeFrenetFrames(pointsCount);
  const positions = trackParams.centerLine.getSpacedPoints(pointsCount);
  const treeLine = [];
  for (let i = 0; i < pointsCount; i++) {
    const left = positions[i].clone().add(normals[i].clone().multiplyScalar(trackParams.treeDistance));
    const right = positions[i].clone().add(normals[i].clone().multiplyScalar(-trackParams.treeDistance));

    treeLine.push(left, right);
  }
  //const treeLine = positions.map((p, idx) => p.sub(binormals[idx].multiplyScalar(14)))
  console.log({ positions, normals })

  return treeLine;
}
