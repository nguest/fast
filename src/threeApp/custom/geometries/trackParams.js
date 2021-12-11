import { CatmullRomCurve3, CubicBezierCurve, Vector2 } from 'three';
import { converLatLngToVector } from '../../helpers/latlngConverter';
import { createRacingLine } from './racingLine';
import { trackOptions } from '../../sceneConfig/tracks';

export const computeTrackParams = (selectedTrack) => {
  const coordinates = trackOptions.find((t) => t.name === selectedTrack).coords;
  const startPoint = 1;

  const trackPoints = converLatLngToVector(coordinates.default);
console.log({ trackPoints });

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

  const trackHalfWidth = 5;

  const apexCurveCount = Math.floor(centerLine.getLength() / 15);

  const { apexes, racingLine } = createRacingLine(centerLine, apexCurveCount, trackHalfWidth);

  const gateCount = Math.floor(length / 16);

  return {
    adjustedTrackPoints,
    apexCurveCount,
    apexes,
    centerLine,
    gateCount,
    length,
    racingLine,
    steps,
    trackHalfWidth,
    treeDistance: 28,
    vergeWidth: 18,
    widthFactor,
  };
};
