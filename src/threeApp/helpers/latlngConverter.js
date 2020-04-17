import { Vector3 } from 'three';

export const converLatLngToVector = (coordinates) => {
  const zeroX = Math.min(...coordinates.map((c) => c[0]));
  const zeroY = Math.min(...coordinates.map((c) => c[2]));
  const zeroZ = Math.max(...coordinates.map((c) => c[1]));

  const zeroPoint = [zeroX, zeroZ, zeroY];
  return coordinates.map((p) => {
    const x = distanceBetweenTwoPoints([p[0], 0], [zeroPoint[0], 0]);
    const y = p[2] - zeroPoint[2];
    const z = distanceBetweenTwoPoints([0, p[1]], [0, zeroPoint[1]]);

    return new Vector3(x, y, z);
  });
};

// Haversine formula: http://www.movable-type.co.uk/scripts/latlong.html

const distanceBetweenTwoPoints = (point1, point2) => {
  const lon1 = point1[0];
  const lat1 = point1[1];
  const lon2 = point2[0];
  const lat2 = point2[1];

  const R = 6371e3; // metres
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (x) => (x * Math.PI) / 180;
