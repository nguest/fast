import * as THREE from 'three';

const cp = [
  {
    "x": 0,
    "y": 0,
    "z": 0
  },
  {
    "x": -10,
    "y": -10,
    "z": -300
  },
  {
    "x": -20,
    "y": -20,
    "z": -500
  },
]

export const calculateVertices = () => {
  
  const vertices = [];
    // calculate vertices for each centerpoint
  for (let i = 0; i < cp.length; i++) {
    vertices.push(
      new THREE.Vector3(cp[i].x - 200,  cp[i].y + 20,     cp[i].z + 0),
      new THREE.Vector3(cp[i].x - 150,  cp[i].y + 6,   cp[i].z + 0),
      new THREE.Vector3(cp[i].x + 0,    cp[i].y + 0,     cp[i].z + 0),
      new THREE.Vector3(cp[i].x + 150,  cp[i].y + 6,   cp[i].z + 0),
      new THREE.Vector3(cp[i].x + 200,  cp[i].y + 20,    cp[i].z + 0),
    )
  }
  return vertices;
}

export const calculateFaces = () => {
  const o = 5;
  const faceIndices = [];
  for (let i = 0; i < 2 - 1; i++) {
    for (let j = 0; j < o - 1; j++) {
      faceIndices.push(
        new THREE.Face3(j + (i * o), j + 1 + (i * o), j + o + (i * o)),
        new THREE.Face3(j + 1 + (i * o), j + 1 + o + (i * o), j + o + (i * o)),
      );
    }
  }
  return faceIndices;
}

export const planeUnwrapUVs = (geometry) => {
  let faceVertexUvs = [];
  for (var i = 0; i < geometry.faces.length; i+=2) {
    // calculate the x and z sizes of the first triangle of 2
    const i1 = geometry.faces[i].a;
    const i2 = geometry.faces[i].b;
    const i3 = geometry.faces[i].c;

    const v1 = geometry.vertices[i1];
    const v2 = geometry.vertices[i2]
    const v3 = geometry.vertices[i3]

    const k = 100; // scale factor
    const u = (v2.x - v1.x) / k;
    const v = (v3.z - v1.z) / k;

    // two triangles per face
    faceVertexUvs.push([
      new THREE.Vector2( 0, 0 ),
      new THREE.Vector2( 0, u ),
      new THREE.Vector2( v, 0 ),    
    ]);
    //geometry.faces[ 2 * i ].materialIndex = i;

    faceVertexUvs.push([
      new THREE.Vector2( 0, u ),
      new THREE.Vector2( v, u ),
      new THREE.Vector2( v, 0 ),
    ]);
    //geometry.faces[ 2 * i + 1 ].materialIndex = i;
  }
  return faceVertexUvs;
}