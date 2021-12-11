import * as THREE from 'three';
import { getSpacedPoints, computeFrenetFrames } from '../../helpers/curveHelpers';

// export const createApexes = (scene, trackParams) => {
//   const threshold = 0.05; // 0.12;
//   const pointsCount = Math.floor(trackParams.length * 0.05);
//   const { binormals, tangents } = computeFrenetFrames(trackParams.centerLine, pointsCount);
//   const points = trackParams.centerLine.getSpacedPoints(pointsCount);

//   const angles = tangents.map((t, i, arr) => {
//     if (arr[i - 1] && arr[i + 1]) {
//       return 0.5 * arr[i - 1].angleTo(arr[i + 1]);
//     }
//     return 0;
//   });

//   const apexes = angles.reduce((agg, theta, i) => {
//     if (
//       angles[i - 1]
//       && angles[i + 1]
//       && (theta > threshold)
//       && angles[i - 1] < theta
//       && angles[i + 1] < theta
//     ) {
//       const signedArea = signedTriangleArea(points[i - 1], points[i], points[i + 1]);
//       const dir = Math.sign(signedArea);

//       return [
//         ...agg,
//         { i, p: points[i], dir, binormal: binormals[i] },
//       ];
//     }
//     return agg;
//   }, []);
//   console.log({ apexes });

//   apexes.forEach((apex, i) => {
//     const geometry = new THREE.SphereBufferGeometry(2, 10, 5);
//     const material = new THREE.MeshPhongMaterial({ color: 0xff8822, wireframe: true })
//     const sphere = new THREE.Mesh(geometry, material);
//     const apexMarkerPosn = apex.p.sub(apex.binormal.clone().multiplyScalar(trackParams.trackHalfWidth * apex.dir));
//     sphere.position.set(apexMarkerPosn.x, apexMarkerPosn.y + 1, apexMarkerPosn.z);
//   });

//   return apexes;
// };

export const createApexMarkers = (scene, trackParams) => {
  const apexes = trackParams.apexes; /* eslint-disable-line */
  const map = new THREE.TextureLoader().load('./assets/textures/location_map.png');
  const spriteMaterial = new THREE.SpriteMaterial({ map });

  // create apex sprites
  apexes.forEach((apex) => {
    const sprite = new THREE.Sprite(spriteMaterial);
    const apexMarkerPosn = apex.p.sub(apex.binormal.clone().multiplyScalar(-trackParams.trackHalfWidth * apex.dir));
    sprite.position.set(apexMarkerPosn.x, apexMarkerPosn.y + 1, apexMarkerPosn.z);

    scene.add(sprite);
  });

  // create distance markers

  const textures = ['50', '100', '200'].map((markerVal, i) => {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 150, 100);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 150, 100);
    ctx.fillStyle = '#000000';
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(markerVal, 75, 80);
    document.body.appendChild(canvas);
    canvas.style.position = 'absolute';
    canvas.style.left = `${i * 160}px`;
    return {
      map: new THREE.CanvasTexture(canvas),
      markerVal,
    };
  });

  const x = new THREE.Vector3(1, 0, 0);
  const up = new THREE.Vector3(0, 1, 0);

  const { apexCurveCount, length, steps, centerLine, trackHalfWidth } = trackParams;
  const segLen = length / steps;
  const idxScaleFactor = steps / apexCurveCount;
  const cpPoints = centerLine.getSpacedPoints(steps);
  const { binormals } = centerLine.computeFrenetFrames(steps, true);
  const STRAIGHT_LENGTH_MIN = 300;

  apexes.forEach((apex, i) => {
    if (
      apexes[i - 1]
      && (apex.idx - apexes[i - 1].idx) * idxScaleFactor * segLen > STRAIGHT_LENGTH_MIN
    ) {
      // valid to make markers
      textures.forEach((texture) => {
        const markeridx = Math.round(apex.idx * idxScaleFactor - (parseInt(texture.markerVal, 10) / segLen));
        const markerPosn = cpPoints[markeridx]
          .clone()
          .sub(binormals[markeridx].clone().multiplyScalar(-(trackHalfWidth + 0.75) * apex.dir));
        const markerGeo = new THREE.PlaneBufferGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x999999 });
        material.map = texture.map;
        const marker = new THREE.Mesh(markerGeo, material);
        marker.position.set(markerPosn.x, markerPosn.y + 0.5, markerPosn.z);
        const angleX = binormals[markeridx].angleTo(x);
        marker.quaternion.setFromAxisAngle(up, angleX - Math.PI);
        marker.castShadow = true;
        scene.add(marker);
      });
    }
  });
};

export const signedTriangleArea = (a, b, c) => (
  a.x * b.z - a.z * b.x + a.z * c.x - a.x * c.z + b.x * c.z - c.x * b.z
);
