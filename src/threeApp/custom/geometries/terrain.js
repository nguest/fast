import * as THREE from 'three';
import { computeFrenetFrames } from '../../helpers/curveHelpers';
import * as ClipperLib from '../../helpers/clipper';
import { LineGeometry } from '../../helpers/LineGeometry';
import { ShapeUtils } from '../../helpers/ShapeUtils';

export const terrainCrossSection = (trackParams) => {
  const shape = new THREE.Shape();
  shape.moveTo(-100, 100);
//trackCrossSection.lineTo(0, 0);
  shape.lineTo(20, 0);
  return shape;
};

export const getTerrainCurve = (trackParams) => {
  const pointsCount = 100;
  const { binormals, normals, tangents } = computeFrenetFrames(trackParams.centerLine, pointsCount);
  const positions = trackParams.centerLine.getSpacedPoints(pointsCount);

  const leftPositions = [];
  const rightPositions = [];
  for (let i = 0; i < pointsCount; i++) {
    leftPositions.push(
      positions[i].clone().sub(binormals[i].clone().multiplyScalar(-50 * trackParams.widthFactor[i].x))
    );
    // rightPositions.push(
    //   positions[i].clone().add(binormals[i].clone().multiplyScalar(trackParams.treeDistance * trackParams.widthFactor[i].x))
    // );
  }

  const terrainCurveLeft = new THREE.CatmullRomCurve3(leftPositions);
  //const terrainCurveLeft = new THREE.CubicBezierCurve3(...leftPositions);

  //const treeCurveRight = new THREE.CatmullRomCurve3(rightPositions);

  return terrainCurveLeft;
};

export const createTerrain = (scene) => {

  const { outerPoints, innerPoints } = computeOffsetPaths([-20, -100]);

  // create correct form of shape for triangulation- hole points must be reverse direction
  const innerShape = new THREE.Shape(innerPoints.reverse());
  innerShape.autoClose = true;
  const outerShape = new THREE.Shape(outerPoints);
  outerShape.holes = [innerShape];
  outerShape.autoClose = true;

  const { shape, holes } = outerShape.extractPoints();

  const { nearestIndex, adjustedCenterPoints } = getNearestZeroIndex(shape, outerPoints);
  console.log({ nearestIndex, adjustedCenterPoints, shape });
  

  // triangulate shape and receive face indices
  const indices = ShapeUtils.triangulateShape([...shape, ...holes[0]].flat(), [holes]).flat();

  const verticesOuter = shape.reduce((a, c, i) => ([...a, c.x, adjustedCenterPoints[i].y - 20, c.y]), []);
  const verticesInner = holes[0].reduce((a, c, i) => ([...a, c.x, 100, c.y]), []);

  console.log({ verticesOuter });
  

  const vertices = verticesOuter.concat(verticesInner);

  // create buffergeo from vertices and computed face indices:
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();

  const mat = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide, wireframe: false });
  const mesh = new THREE.Mesh(geometry, mat);
  //scene.add(mesh);
};

// http://jsclipper.sourceforge.net/6.4.2.2/index.html?p=sources_as_text/starter_offset.txt
const computeOffsetPaths = ([outerOffset, innerOffset]) => {
  const pointsCount = 100;
  // compute offset paths from centerline
  const centerPoints = trackParams.centerLine.clone().getSpacedPoints(pointsCount);

  const centerPath = centerPoints.map(p => ({ X: p.x, Y: p.z }));

  const co = new ClipperLib.ClipperOffset(2, 0.25);
  co.AddPath(centerPath, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
  const offsettedPaths = new ClipperLib.Paths();
  co.Execute(offsettedPaths, outerOffset);

  const co2 = new ClipperLib.ClipperOffset(2, 0.25);
  co2.AddPath(centerPath, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
  const offsettedPaths2 = new ClipperLib.Paths();
  co.Execute(offsettedPaths2, innerOffset);

  // map offsetted paths to points arrays - for some reason they are clockwise
  const outerPoints = offsettedPaths[0].map((p) => new THREE.Vector2(p.X, p.Y)).reverse();
  const innerPoints = offsettedPaths2[0].map((p) => new THREE.Vector2(p.X, p.Y)).reverse();

  return { outerPoints, innerPoints };
};

const getNearestZeroIndex = (shape, outerPoints) => {
  const outerPointsCount = shape.length;
  const centerPoints = trackParams.centerLine.getSpacedPoints(outerPointsCount);
  console.log({ outerPointsCount, centerPoints });
  const dist = centerPoints.reduce((a, c, i) => {
    const d = outerPoints[0].distanceTo(new THREE.Vector2(c.x, c.z));
    if (d < a.d) {
      return { d, i };
    }
    return a;
  }, { d: 100000, i: 0 });
  console.log({ dist });

  const section2 = centerPoints.splice(0, dist.i);
  console.log({ section2, centerPoints });
  
  const adjustedCenterPoints = centerPoints.concat(section2);//.map((p) => p.clone().sub(trackPoints[0]));
  
  return { nearestIndex: dist.i, adjustedCenterPoints };

}