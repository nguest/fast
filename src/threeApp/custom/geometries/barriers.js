import * as THREE from 'three';

const barrierCrossSection1 = new THREE.Shape();
barrierCrossSection1.moveTo(-0.25, -15);
barrierCrossSection1.lineTo(-1.5, -15);
const barrierCrossSection2 = new THREE.Shape();
barrierCrossSection2.moveTo(-0.25, 15);
barrierCrossSection2.lineTo(-1.5, 15);

export const barrierCrossSection = [barrierCrossSection1, barrierCrossSection2];
