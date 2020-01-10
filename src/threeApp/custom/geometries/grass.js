import * as THREE from 'three';
import { trackParams } from './trackParams';

const grassCrossSection1 = new THREE.Shape();
grassCrossSection1.moveTo(0.1, -trackParams.trackHalfWidth + 0.3);
grassCrossSection1.lineTo(-1, -20);

const grassCrossSection2 = new THREE.Shape();
grassCrossSection2.moveTo(-1, 20);
grassCrossSection2.lineTo(0.1, trackParams.trackHalfWidth - 0.3);

export const grassCrossSection = [grassCrossSection1, grassCrossSection2];


const treesCrossSection1 = new THREE.Shape();
treesCrossSection1.moveTo(0.1, -trackParams.trackHalfWidth - 10);
treesCrossSection1.lineTo(-8, -trackParams.trackHalfWidth - 10);

const treesCrossSection2 = new THREE.Shape();
treesCrossSection2.moveTo(-0.1, trackParams.trackHalfWidth + 10);
treesCrossSection2.lineTo(-8, trackParams.trackHalfWidth + 10);

export const treesCrossSection = [treesCrossSection1, treesCrossSection2];
