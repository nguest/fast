import * as THREE from 'three';

const trackKerbCrossSection1 = new THREE.Shape();
trackKerbCrossSection1.moveTo(-0.2, -11);
trackKerbCrossSection1.lineTo(0, -10);

const trackKerbCrossSection2 = new THREE.Shape();
trackKerbCrossSection2.moveTo(-0.2, 11);
trackKerbCrossSection2.lineTo(0, 10);

const test = new THREE.Shape();
test.moveTo(-5, 0);
test.lineTo(-1, 3);
test.lineTo(-2, 4);
test.lineTo(-2.5, 5);
test.lineTo(-5, 6);

const test2 = new THREE.Shape();
test2.moveTo(-5, 7);
test2.lineTo(-1, 8);
test2.lineTo(-5, 10);

export const trackKerbCrossSection = [trackKerbCrossSection1, trackKerbCrossSection2];
//export const trackEdgeCrossSection = [test, test2];

/*
The first 9 elements in the positions array contain the x,y,z coordinates of the 3 vertices of the first face.
The next 9 element specify the vertices of the 2nd face. – WestLangley Feb 11 '16 at 20:32
*/