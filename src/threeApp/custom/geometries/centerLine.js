import { CatmullRomCurve3, Vector3 } from 'three';

export const centerLine = new CatmullRomCurve3([
  new Vector3(0, 0, 40),
  new Vector3(0, 0, 0),
  new Vector3(-5, 0, -150),
  new Vector3(50, 0, -400),
  new Vector3(0, 0, -850),
  new Vector3(-100, 0, -850),
  new Vector3(-150, 0, -1200),
]);
