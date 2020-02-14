import { CatmullRomCurve3, CubicBezierCurve, Vector2, Vector3 } from 'three';
import { converLatLngToVector } from '../../helpers/latlngConverter';
//import { coordinates } from './nordschleife';
import { coordinates } from './SpaFrancorchamps';

const steps = 5000;//5000; // total extrusion segments
const startPoint = 30;

const trackPoints = converLatLngToVector(coordinates);

// rejig points array so startpoint is at array position 0
const section2 = trackPoints.splice(0, startPoint);
const adjustedTrackPoints = trackPoints.concat(section2).map((p) => p.clone().sub(trackPoints[0]));

const centerLine = new CatmullRomCurve3(adjustedTrackPoints);
centerLine.arcLengthDivisions = steps;
centerLine.closed = true;
centerLine.name = 'centerLine';

const widthCurve = new CubicBezierCurve(
  new Vector2(1, 0),
  new Vector2(1, 0),
  new Vector2(1, 0),
  new Vector2(1.5, 0),
  new Vector2(1.25, 0),
  new Vector2(1, 0),
  new Vector2(1, 0),
);

const getApexes = (centerLine) => {
  const pointsCount = 500;
  const { binormals, normals, tangents } = centerLine.computeFrenetFrames(pointsCount);

  const angles = tangents.map((t, i, arr) => {
    if (arr[i-1] && arr[i+1]) {
      return 0.5 * arr[i - 1].angleTo(arr[i + 1]);
    }
    return 0;
  });
  console.log({ angles })

  const apex = angles.reduce((agg, p, i, arr) => {
    if (
      angles[i-1]
      && angles[i+1]
      && p > 0.2
      && angles[i-1] < p
      && angles[i+1] < p
    ) {
      console.log({ p, agg })
      return [...agg, i]
    };
    return agg;
  }, []);
  console.log({ apex })
  return apex;
}


const widthFactor = widthCurve.getPoints(steps);

export const trackParams = {
  adjustedTrackPoints,
  centerLine,
  gateCount: 500,
  steps,
  widthFactor,
  trackHalfWidth: 5,
  vergeWidth: 8,
  treeDistance: 13.5,
};
