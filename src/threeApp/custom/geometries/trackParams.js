import { CatmullRomCurve3, CubicBezierCurve, Vector2 } from 'three';
import { converLatLngToVector } from '../../helpers/latlngConverter';
import { createApexes } from '../../helpers/apexHelpers';
import { trackOptions } from '../../sceneConfig/tracks';

export const computeTrackParams = (selectedTrack) => {
  const coordinates = trackOptions.find((t) => t.name === selectedTrack).coords;
  const startPoint = 30;

  const trackPoints = converLatLngToVector(coordinates.default);

  // rejig points array so startpoint is at array position 0
  const section2 = trackPoints.splice(0, startPoint);
  const adjustedTrackPoints = trackPoints.concat(section2).map((p) => p.clone().sub(trackPoints[0]));

  // create centerLine from adjustedTrackPoints and compute steps
  const centerLine = new CatmullRomCurve3(adjustedTrackPoints);
  const length = Math.floor(centerLine.getLength());
  const steps = Math.floor(length * 0.5); // total extrusion segments

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
  const widthFactor = widthCurve.getPoints(steps);

  const apexes = createApexes({ centerLine, length });

  const gateCount = Math.floor(length / 16);

  return {
    apexes,
    adjustedTrackPoints,
    centerLine,
    length,
    gateCount,
    steps,
    widthFactor,
    trackHalfWidth: 5,
    vergeWidth: 8,
    treeDistance: 18,
  };
};

// const startPoint = 30;

// const trackPoints = converLatLngToVector(coordinates);

// // rejig points array so startpoint is at array position 0
// const section2 = trackPoints.splice(0, startPoint);
// const adjustedTrackPoints = trackPoints.concat(section2).map((p) => p.clone().sub(trackPoints[0]));

// // create centerLine from adjustedTrackPoints and compute steps
// const centerLine = new CatmullRomCurve3(adjustedTrackPoints);
// const length = Math.floor(centerLine.getLength());
// const steps = Math.floor(length * 0.5); // total extrusion segments

// centerLine.arcLengthDivisions = steps;
// centerLine.closed = true;
// centerLine.name = 'centerLine';

// const widthCurve = new CubicBezierCurve(
//   new Vector2(1, 0),
//   new Vector2(1, 0),
//   new Vector2(1, 0),
//   new Vector2(1.5, 0),
//   new Vector2(1.25, 0),
//   new Vector2(1, 0),
//   new Vector2(1, 0),
// );
// const widthFactor = widthCurve.getPoints(steps);

// const apexes = createApexes({ centerLine, length });

// export const trackParams = {
//   apexes,
//   adjustedTrackPoints,
//   centerLine,
//   length,
//   gateCount: 500,
//   steps,
//   widthFactor,
//   trackHalfWidth: 5,
//   vergeWidth: 8,
//   treeDistance: 18,
// };
