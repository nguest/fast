import * as THREE from 'three';


const pCount = 20;

const createBaseSpline = () => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -50),
   new THREE.Vector3(-5, 0, -150),
   new THREE.Vector3(50, 0, -200),
   new THREE.Vector3(0, 0, -250),
    new THREE.Vector3(-100, 0, -250),
    new THREE.Vector3(-150, 0, -200),
    new THREE.Vector3(-100, 0, -40),
  ]);

  const cp = curve.getPoints(pCount);

  const splineTube = curve.computeFrenetFrames( pCount, false );
  console.log({ splineTube })

  console.log({ a: curve.getTangentAt(1), b: curve.getPointAt(1) })
  //const tangents = cp.map((p, idx) => curve.getTangentAt(idx / pCount).normalize());
  const tangents = splineTube.binormals
  // const tangents = cp.map((p, idx) => {
  //   if (cp[idx - 1] && !isNaN(p.angleTo(cp[idx - 1]))) {
  //     return cp[idx].angleTo(cp[idx - 1])
  //   } 
  //   return 0;

  // })
 console.log({ tangents })
  //geometry.rotateX(-Math.PI * 0.5);
  return { cp, tangents };
}


export const calculateVertices = () => {
  const { cp, tangents } = createBaseSpline();
  console.log({ tangents })
  const vertices = [];
  // calculate vertices for each centerpoint
  for (let i = 0; i < cp.length; i++) {
    const v0 = new THREE.Vector3(cp[i].x - 10, cp[i].y + 0, cp[i].z + 0);
    const v1 = new THREE.Vector3(cp[i].x + 0, cp[i].y + 0, cp[i].z + 0);
    const v2 = new THREE.Vector3(cp[i].x + 10, cp[i].y + 0, cp[i].z + 0);

    //angle relative to neg z;
    const angle = tangents[i].angleTo(new THREE.Vector3(0,0,-1));// * 180/Math.PI;
    console.log({ angle })
    const dz = 10 * Math.cos(Math.PI * 0.5 - angle);
    const dx = 10 * (1 - Math.sin(Math.PI * 0.5 - angle))
    console.log(i, angle * 180/Math.PI, dx, dz )
    v0.add(new THREE.Vector3(dx, 0, dz))
    v2.add(new THREE.Vector3(-dx, 0, -dz))

    vertices.push(v0, v1, v2);
  }
  return vertices;
};

export const calculateFaces = () => {
  const o = 3;
  const faceIndices = [];
  /*
    0, 1, 3
    1, 4, 3

    1,2,4
    2,4,5

    3, 4, 6,
    4, 7, 6


  */
  for (let j = 0; j < pCount * o - 1; j += o) {
    for (let i = 0; i < o - 1; i++) {
      faceIndices.push(
        new THREE.Face3(
          j + i,
          j + 1 + i,
          j + o + i,
        ),
        new THREE.Face3(
          j + 1 + i,
          j + 1 + o + i,
          j + o + i,
        ),
      );
    }
  }
  return faceIndices;
};

export const planeUnwrapUVs = (geometry) => {
  const faceVertexUvs = [];
  for (let i = 0; i < geometry.faces.length; i += 2) {
    // calculate the x and z sizes of the first triangle of 2
    const i1 = geometry.faces[i].a;
    const i2 = geometry.faces[i].b;
    const i3 = geometry.faces[i].c;

    const v1 = geometry.vertices[i1];
    const v2 = geometry.vertices[i2];
    const v3 = geometry.vertices[i3];

    const k = 100; // scale factor
    const u = (v2.x - v1.x) / k;
    const v = (v3.z - v1.z) / k;

    // two triangles per face
    faceVertexUvs.push([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0, u),
      new THREE.Vector2(v, 0),
    ]);
    // geometry.faces[ 2 * i ].materialIndex = i;

    faceVertexUvs.push([
      new THREE.Vector2(0, u),
      new THREE.Vector2(v, u),
      new THREE.Vector2(v, 0),
    ]);
    // geometry.faces[ 2 * i + 1 ].materialIndex = i;
  }
  return faceVertexUvs;
};
