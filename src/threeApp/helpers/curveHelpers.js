import { Vector3, Matrix4 } from 'three';
import { MathUtils } from './MathUtils';

/*
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Extensible curve object
*/

// export const getPoint = (/* t, optionalTarget */) => {
//   console.warn('THREE.Curve: .getPoint() not implemented.');
//   return null;
// };

// Get point at relative position in curve according to arc length
// - u [0 .. 1]

export const getPointAt = (curve, u, optionalTarget) => {
  const t = getUtoTmapping(curve, u);
  return getPoint(curve, t, optionalTarget);
};

// Get sequence of points using getPoint( t )

export const getPoints = (curve, divisions) => {
  if (divisions === undefined) divisions = 5;

  const points = [];

  for (let d = 0; d <= divisions; d++) {
    points.push(getPoint(curve, d / divisions));
  }

  return points;
};

// Get sequence of points using getPointAt( u )

export const getSpacedPoints = (curve, divisions) => {
  if (divisions === undefined) divisions = 5;

  const points = [];

  for (let d = 0; d <= divisions; d++) {
    points.push(getPointAt(curve, d / divisions));
  }

  return points;
};

// Get total curve arc length

export const getLength = (curve) => {
  const lengths = getLengths(curve);
  return lengths[lengths.length - 1];
};

// Get list of cumulative segment lengths

export const getLengths = (curve, divisions) => {
  const arcLengthDivisions = 200;
  if (divisions === undefined) divisions = arcLengthDivisions;
  let cacheArcLengths;
  if (cacheArcLengths
    && (cacheArcLengths.length === divisions + 1)
    && !curve.needsUpdate) {
    return cacheArcLengths;
  }

  const cache = [];
  let current; let
    last = getPoint(curve, 0);
  let p; let
    sum = 0;

  cache.push(0);

  for (p = 1; p <= divisions; p++) {
    current = getPoint(curve, p / divisions);
    sum += current.distanceTo(last);
    cache.push(sum);
    last = current;
  }

  cacheArcLengths = cache;

  return cache; // { sums: cache, sum: sum }; Sum is in the last element.
};

export const updateArcLengths = (curve) => {
  curve.needsUpdate = true;
  getLengths(curve);
};

// Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equidistant

export const getUtoTmapping = (curve, u, distance) => {
  const arcLengths = getLengths(curve);

  let i = 0; const
    il = arcLengths.length;

  let targetArcLength; // The targeted u distance value to get

  if (distance) {
    targetArcLength = distance;
  } else {
    targetArcLength = u * arcLengths[il - 1];
  }

  // binary search for the index with largest value smaller than target u distance

  let low = 0; let high = il - 1; let
    comparison;

  while (low <= high) {
    i = Math.floor(low + (high - low) / 2); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats

    comparison = arcLengths[i] - targetArcLength;

    if (comparison < 0) {
      low = i + 1;
    } else if (comparison > 0) {
      high = i - 1;
    } else {
      high = i;
      break;

      // DONE
    }
  }

  i = high;

  if (arcLengths[i] === targetArcLength) {
    return i / (il - 1);
  }

  // we could get finer grain at lengths, or use simple interpolation between two points

  const lengthBefore = arcLengths[i];
  const lengthAfter = arcLengths[i + 1];

  const segmentLength = lengthAfter - lengthBefore;

  // determine where we are between the 'before' and 'after' points

  const segmentFraction = (targetArcLength - lengthBefore) / segmentLength;

  // add that fractional amount to t

  const t = (i + segmentFraction) / (il - 1);

  return t;
};

// Returns a unit vector tangent at t
// In case any sub curve does not implement its tangent derivation,
// 2 points a small delta apart will be used to find its gradient
// which seems to give a reasonable approximation

export const getTangent = (curve, t) => {
  const delta = 0.0001;
  let t1 = t - delta;
  let t2 = t + delta;

  // Capping in case of danger

  if (t1 < 0) t1 = 0;
  if (t2 > 1) t2 = 1;

  const pt1 = getPoint(curve, t1);
  const pt2 = getPoint(curve, t2);

  const vec = pt2.clone().sub(pt1);
  vec.y = 0; //!!! make tangents 2D
  //console.log({ vec })
  return vec.normalize();
};

export const getTangentAt = (curve, u) => {
  const t = getUtoTmapping(curve, u);
  return getTangent(curve, t);
};

export const computeFrenetFrames = (curve, segments, closed) => {
  // see http://www.cs.indiana.edu/pub/techreports/TR425.pdf

  const normal = new Vector3();

  const tangents = [];
  const normals = [];
  const binormals = [];

  const vec = new Vector3();
  const mat = new Matrix4();

  let i; let u; let
    theta;

  // compute the tangent vectors for each segment on the curve

  for (i = 0; i <= segments; i++) {
    u = i / segments;

    tangents[i] = getTangentAt(curve, u);
    tangents[i].normalize();
  }

  // select an initial normal vector perpendicular to the first tangent vector,
  // and in the direction of the minimum tangent xyz component

  normals[0] = new Vector3();
  binormals[0] = new Vector3();
  let min = Number.MAX_VALUE;
  const tx = Math.abs(tangents[0].x);
  const ty = Math.abs(tangents[0].y);
  const tz = Math.abs(tangents[0].z);

  if (tx <= min) {
    min = tx;
    normal.set(1, 0, 0);
  }

  if (ty <= min) {
    min = ty;
    normal.set(0, 1, 0);
  }

  if (tz <= min) {
    normal.set(0, 0, 1);
  }

  vec.crossVectors(tangents[0], normal).normalize();

  normals[0].crossVectors(tangents[0], vec);
  binormals[0].crossVectors(tangents[0], normals[0]);


  // compute the slowly-varying normal and binormal vectors for each segment on the curve

  for (i = 1; i <= segments; i++) {
    normals[i] = normals[i - 1].clone();

    binormals[i] = binormals[i - 1].clone();

    vec.crossVectors(tangents[i - 1], tangents[i]);

    if (vec.length() > Number.EPSILON) {
      vec.normalize();

      theta = Math.acos(MathUtils.clamp(tangents[i - 1].dot(tangents[i]), -1, 1)); // clamp for floating pt errors

      normals[i].applyMatrix4(mat.makeRotationAxis(vec, theta));
    }

    binormals[i].crossVectors(tangents[i], normals[i]);
  }

  // if the curve is closed, postprocess the vectors so the first and last normal vectors are the same
 // if (curve.name === 'centerLine') console.log({ curve });

  if (curve.closed === true) {
    theta = Math.acos(MathUtils.clamp(normals[0].dot(normals[segments]), -1, 1));
    theta /= segments;

    if (tangents[0].dot(vec.crossVectors(normals[0], normals[segments])) > 0) {
      theta = -theta;
    }

    for (i = 1; i <= segments; i++) {
      // twist a little...
      normals[i].applyMatrix4(mat.makeRotationAxis(tangents[i], theta * i));
      binormals[i].crossVectors(tangents[i], normals[i]);
    }

    // !!! manually set first and last identical?
    normals[segments] = normals[0];
    binormals[segments] = binormals[0];
    tangents[segments] = tangents[0];



  }

  return {
    tangents,
    normals,
    binormals,
  };
};

export const CubicPoly = () => {
  let c0 = 0; let c1 = 0; let c2 = 0; let c3 = 0;

  /*
   * Compute coefficients for a cubic polynomial
   *   p(s) = c0 + c1*s + c2*s^2 + c3*s^3
   * such that
   *   p(0) = x0, p(1) = x1
   *  and
   *   p'(0) = t0, p'(1) = t1.
   */
  function init(x0, x1, t0, t1) {
    c0 = x0;
    c1 = t0;
    c2 = -3 * x0 + 3 * x1 - 2 * t0 - t1;
    c3 = 2 * x0 - 2 * x1 + t0 + t1;
  }

  return {

    initCatmullRom(x0, x1, x2, x3, tension) {
      init(x1, x2, tension * (x2 - x0), tension * (x3 - x1));
    },

    initNonuniformCatmullRom(x0, x1, x2, x3, dt0, dt1, dt2) {
      // compute tangents when parameterized in [t1,t2]
      let t1 = (x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1;
      let t2 = (x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2;

      // rescale tangents for parametrization in [0,1]
      t1 *= dt1;
      t2 *= dt1;

      init(x1, x2, t1, t2);
    },

    calc(t) {
      const t2 = t * t;
      const t3 = t2 * t;
      return c0 + c1 * t + c2 * t2 + c3 * t3;
    },

  };
};

//

const tmp = new Vector3();
const px = new CubicPoly(); const py = new CubicPoly(); const
  pz = new CubicPoly();

export const getPoint = (curve, t, optionalTarget) => {
  const point = optionalTarget || new Vector3();
  const { points } = curve;
  const l = points.length;

  const p = (l - (curve.closed ? 0 : 1)) * t;
  let intPoint = Math.floor(p);
  let weight = p - intPoint;

  if (curve.closed) {
    intPoint += intPoint > 0 ? 0 : (Math.floor(Math.abs(intPoint) / l) + 1) * l;
  } else if (weight === 0 && intPoint === l - 1) {
    intPoint = l - 2;
    weight = 1;
  }

  let p0; let p1; let p2; let p3; // 4 points

  if (curve.closed || intPoint > 0) {
    p0 = points[(intPoint - 1) % l];
  } else {
    // extrapolate first point
    tmp.subVectors(points[0], points[1]).add(points[0]);
    p0 = tmp;
  }

  p1 = points[intPoint % l];
  p2 = points[(intPoint + 1) % l];

  if (curve.closed || intPoint + 2 < l) {
    p3 = points[(intPoint + 2) % l];
  } else {
    // extrapolate last point
    tmp.subVectors(points[l - 1], points[l - 2]).add(points[l - 1]);
    p3 = tmp;
  }

  if (curve.curveType === 'centripetal' || curve.curveType === 'chordal') {
    // init Centripetal / Chordal Catmull-Rom
    const pow = curve.curveType === 'chordal' ? 0.5 : 0.25;
    let dt0 = Math.pow(p0.distanceToSquared(p1), pow);
    let dt1 = Math.pow(p1.distanceToSquared(p2), pow);
    let dt2 = Math.pow(p2.distanceToSquared(p3), pow);

    // safety check for repeated points
    if (dt1 < 1e-4) dt1 = 1.0;
    if (dt0 < 1e-4) dt0 = dt1;
    if (dt2 < 1e-4) dt2 = dt1;

    px.initNonuniformCatmullRom(p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2);
    py.initNonuniformCatmullRom(p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2);
    pz.initNonuniformCatmullRom(p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2);
  } else if (this.curveType === 'catmullrom') {
    px.initCatmullRom(p0.x, p1.x, p2.x, p3.x, this.tension);
    py.initCatmullRom(p0.y, p1.y, p2.y, p3.y, this.tension);
    pz.initCatmullRom(p0.z, p1.z, p2.z, p3.z, this.tension);
  }

  point.set(
    px.calc(weight),
    py.calc(weight),
    pz.calc(weight),
  );

  return point;
};
