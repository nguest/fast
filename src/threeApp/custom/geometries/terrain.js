import * as THREE from 'three';
import { trackParams } from './trackParams';
import { computeFrenetFrames } from '../../helpers/curveHelpers';
import * as ClipperLib from '../../helpers/clipper';
import { LineGeometry } from '../../helpers/LineGeometry';
import { ShapeUtils } from '../../helpers/ShapeUtils';

export const terrainCrossSection = new THREE.Shape();
terrainCrossSection.moveTo(-100, 100);
//trackCrossSection.lineTo(0, 0);
terrainCrossSection.lineTo(20, 0);

export const getTerrainCurve = () => {
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
  const pointsCount = 100;

  const centerPoints = trackParams.centerLine.getSpacedPoints(pointsCount);

  const path = centerPoints.map(p => ({ X: p.x, Y: p.z }));

  const co = new ClipperLib.ClipperOffset(2, 0.25);
  co.AddPath(path, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
  const offsettedPaths = new ClipperLib.Paths();
  co.Execute(offsettedPaths, -20);
  console.log({ offsettedPaths });

  const co2 = new ClipperLib.ClipperOffset(2, 0.25);
  co2.AddPath(path, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
  const offsettedPaths2 = new ClipperLib.Paths();
  co.Execute(offsettedPaths2, -40);
  console.log({ offsettedPaths2 });


  // var material = new THREE.LineBasicMaterial({
  //   color: 0xffffff
  // });
  const material = new THREE.LineDashedMaterial({
    color: 0xffffff,
    linewidth: 1,
    scale: 0.1,
    dashSize: 3,
    gapSize: 1,
  });
  
  const points1 = offsettedPaths[0].map((p) => new THREE.Vector2(p.X, p.Y));
  const points2 = offsettedPaths2[0].map((p) => new THREE.Vector2(p.X, p.Y));
  console.log({ points1, points2 });
  
  const geometry1 = new THREE.BufferGeometry().setFromPoints([...points1, points1[0]]);
  const line = new THREE.Line(geometry1, material);
  scene.add(line);

  const geometry2 = new THREE.BufferGeometry().setFromPoints([...points2, points2[0]]);
  const line2 = new THREE.Line( geometry2, material);
  scene.add(line2);

  const shape1 = new THREE.Shape(points1.reverse())
  shape1.autoClose = true;
  const shape2 = new THREE.Shape(points2)

  console.log({  shape1, shape2
   });
  

  const shape = ShapeUtils.triangulateShape(points1.reverse(), []);

  const indices = shape.flat();//.slice(0, 870)

  console.log({ shape, indices });

  const vertices1 = points1.reduce((a, c) => {    
    return [...a, c.x, 20, c.y]
  }, [])
  const vertices2 = points1.reduce((a, c) => {
    console.log(a);
    
    return [...a, c.x, 20, c.y]
  }, [])

  const vertices = [...vertices1, ...vertices2]

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex( indices );
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices1, 3 ) );
  geometry.computeVertexNormals();
  console.log({ geometry });
  
  const count = shape.length;
  const mat = new THREE.MeshPhongMaterial({color: 0xff0000, side: THREE.DoubleSide})
  const mesh = new THREE.Mesh(geometry, mat)
  scene.add(mesh)
    
}