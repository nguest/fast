import { CatmullRomCurve3, Vector3 } from 'three';
import { centerLine } from './centerLine';
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
  console.log({ centerLine })
  centerLine.getTangentAt(0.5);
  const { binormals } = centerLine.computeFrenetFrames(pointsCount);
  const positions = centerLine.getSpacedPoints(pointsCount);
  const treeLine = [];
  for (let i = 0; i < pointsCount; i++) {
    const left = positions[i].clone().add(binormals[i].clone().multiplyScalar(18))
    const right = positions[i].clone().add(binormals[i].clone().multiplyScalar(-18))

    treeLine.push(left, right);
  }
  //const treeLine = positions.map((p, idx) => p.sub(binormals[idx].multiplyScalar(14)))
  console.log({ positions, binormals })

  return treeLine;
}
