import * as THREE from 'three';
import { trackParams } from './trackParams';

const grassCrossSection1 = new THREE.Shape();
grassCrossSection1.moveTo(-trackParams.trackHalfWidth + 0.3, 0.1);
grassCrossSection1.lineTo(-20, -1);

const grassCrossSection2 = new THREE.Shape();
grassCrossSection2.moveTo(20, -1);
grassCrossSection2.lineTo(trackParams.trackHalfWidth - 0.3, 0.1);

export const grassCrossSection = [grassCrossSection1, grassCrossSection2];
