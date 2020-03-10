import * as THREE from 'three';
import { trackParams } from './trackParams';
import { computeFrenetFrames } from '../../helpers/curveHelpers';
import * as ClipperLib from '../../helpers/clipper';

export const terrainCrossSection = new THREE.Shape([
  new THREE.Vector2(-2, trackParams.trackHalfWidth + 4),
  new THREE.Vector2(0, trackParams.trackHalfWidth + 2),
]);
