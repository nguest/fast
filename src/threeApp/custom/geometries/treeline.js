import { trackParams } from './trackParams';

export const getTreeline = () => {
  const pointsCount = 2000;
  const { binormals, normals, tangents } = trackParams.centerLine.computeFrenetFrames(pointsCount);
  const positions = trackParams.centerLine.getSpacedPoints(pointsCount);
  const treeLineLeft = [];
  for (let i = 0; i < pointsCount; i++) {
    treeLineLeft.push(
      positions[i].add(binormals[i].clone().multiplyScalar(trackParams.treeDistance * trackParams.widthFactor[i].x))
    );
  }

  return { treeLineLeft, binormals, normals, tangents };
};
