import * as THREE from 'three';

const grassCrossSection1 = new THREE.Shape();
grassCrossSection1.moveTo(0.1, -7.9);
grassCrossSection1.lineTo(-1, -20);

const grassCrossSection2 = new THREE.Shape();
grassCrossSection2.moveTo(-1, 20);
grassCrossSection2.lineTo(0.1, 7.9);

export const grassCrossSection = [grassCrossSection1, grassCrossSection2];
