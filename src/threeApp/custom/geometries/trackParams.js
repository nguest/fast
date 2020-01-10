import { CatmullRomCurve3, LineCurve, CubicBezierCurve, Vector2, Vector3 } from 'three';
import { converLatLngToVector } from '../../helpers/latlngConverter';
import { coordinates } from './nordschleife';

const steps = 2000; // total extrusion segments

const points = converLatLngToVector(coordinates);
const adjustedPoints = points.map((p) => p.clone().sub(points[0]));
const centerLine = new CatmullRomCurve3(adjustedPoints);
//centerLine.rotation.set(0, Math.PI/2, 0)
centerLine.closed = true;

console.log({ centerLine })
// const centerLine = new CatmullRomCurve3([
//   new Vector3(0, 0, 40),
//   new Vector3(0, -0.1, 0),
//   new Vector3(-5, 0, -150),
//   new Vector3(50, -2, -400),
//   new Vector3(0, 0, -850),
//   new Vector3(-100, 0, -1050),
//   new Vector3(-150, 0, -1200),
// ]);

const widthCurve = new CubicBezierCurve(
  new Vector2(1, 0),
  new Vector2(1, 0),
  new Vector2(1, 0),
  new Vector2(1.5, 0),
  new Vector2(1.25, 0),
  new Vector2(1, 0),
  new Vector2(1, 0),
);

const widthFactor = widthCurve.getPoints(steps);

export const trackParams = {
  centerLine,
  steps,
  widthFactor,
  trackHalfWidth: 5,
  vergeWidth: 3,
  treeDistance: 10.5,
};
