import * as THREE from 'three';
import Ammo from 'ammonext';

import { promisifyLoader } from '../helpers/helpers';

export default class Mesh {
  constructor({
    type,
    url,
    params,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    geoRotate,
    shadows = { receive: false, cast: true },
    material,
    mass,
    scene = this.scene,
    physics = {},
    add,
    name,
    calculateFaces,
    calculateVertices,
    calculateUVs,
  }) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.geoRotate = geoRotate;
    this.shadows = shadows;
    this.material = material;
    this.mass = mass;
    this.name = name;
    this.scene = scene;
    this.physicsWorld = physics.physicsWorld;
    this.addObjectToScene = add;
    this.setInitialState = this.setInitialState.bind(this);

    if (!add) return;

    if (type === 'JSON') {
      this.initLoader(url);
    } else {
      const geometry = new THREE[type](...params);

      if (params === 'custom') {
        // must be custom type
        if (!calculateVertices || !calculateFaces) {
          throw new Error(
            'calculateVertices and calculateFaces Functions must be defined to calculate custom geometry'
          );
        }
        const vertices = calculateVertices();
        const faces = calculateFaces();

        geometry.vertices = vertices;
        geometry.faces = faces;
        geometry.computeVertexNormals();
        geometry.computeFaceNormals();
        geometry.computeBoundingBox();
        geometry.name = name;
        const faceVertexUvs = calculateUVs(geometry);
        geometry.faceVertexUvs[0] = faceVertexUvs;

        geometry.elementsNeedUpdate = true;
        geometry.verticesNeedUpdate = true;
        geometry.uvsNeedUpdate = true;
      }

      const mesh = this.orientObject(geometry);
      if (this.physicsWorld) this.calculatePhysics(mesh, params, physics, type);
    }
  }

  async initLoader(url) { /* eslint-disable-line */
    const JSONPromiseLoader = promisifyLoader(new THREE.JSONLoader());
    const geometry = await JSONPromiseLoader.load(url).catch(() => console.log(`error loading ${url}`));
    return this.orientObject(geometry);
  }

  orientObject(geometry) {
    if (this.geoRotate) {
      geometry.rotateX(this.geoRotate[0]);
      geometry.rotateY(this.geoRotate[1]);
      geometry.rotateZ(this.geoRotate[2]);
    }
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(...this.position);
    this.mesh.rotation.set(...this.rotation);
    this.mesh.scale.set(...this.scale);
    this.mesh.castShadow = this.shadows.cast;
    this.mesh.receiveShadow = this.shadows.receive;
    this.mesh.name = this.name;

    if (this.addObjectToScene) {
      this.setInitialState();
      this.scene.add(this.mesh);
    }
    return this.mesh;
  }

  setInitialState() {
    this.mesh.position.set(...this.position);
    this.mesh.rotation.set(...this.rotation);
    this.mesh.scale.set(...this.scale);
  }

  calculatePhysics(mesh, params, physics, type) {
    // Ammojs Section
    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...this.rotation, 'XYZ'));
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(...this.position));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape;
    switch (type) {
    case 'SphereBufferGeometry':
      colShape = new Ammo.btSphereShape(params[0]); break;
    case 'BoxBufferGeometry':
      colShape = new Ammo.btBoxShape(new Ammo.btVector3(params[0] * 0.5, params[1] * 0.5, params[2] * 0.5)); break;
    case 'PlaneBufferGeometry':
      colShape = new Ammo.btBoxShape(new Ammo.btVector3(params[0], params[1], 1)); break;
    case 'Geometry':
      colShape = new Ammo.btBvhTriangleMeshShape(concaveGeometryProcessor(mesh.geometry), true, true); break;
    case 'convextHull':
      colShape = new Ammo.btConvexHullShape(convexGeometryProcessor(mesh.geometry), true, true); break;
    default:
      colShape = null;
    }

    colShape.setMargin(0.05);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(physics.mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(physics.mass, motionState, colShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);
    body.setFriction(physics.friction || 0);
    body.setRestitution(physics.restitution || 1);
    body.setDamping(physics.damping || 0, physics.damping || 0);

    this.physicsWorld.addRigidBody(body, 1, 1);
    mesh.userData.physicsBody = body;
    this.physicsWorld.bodies.push(mesh);
  }
}

const concaveGeometryProcessor = (geometry) => {
  if (!geometry.boundingBox) geometry.computeBoundingBox();

  const data = geometry.isBufferGeometry
    ? geometry.attributes.position.array
    : new Float32Array(geometry.faces.length * 9);

  if (!geometry.isBufferGeometry) {
    const { vertices } = geometry;

    for (let i = 0; i < geometry.faces.length; i++) {
      const face = geometry.faces[i];
      const vA = vertices[face.a];
      const vB = vertices[face.b];
      const vC = vertices[face.c];

      const i9 = i * 9;

      data[i9] = vA.x;
      data[i9 + 1] = vA.y;
      data[i9 + 2] = vA.z;

      data[i9 + 3] = vB.x;
      data[i9 + 4] = vB.y;
      data[i9 + 5] = vB.z;

      data[i9 + 6] = vC.x;
      data[i9 + 7] = vC.y;
      data[i9 + 8] = vC.z;
    }
  }

  const vec1 = new Ammo.btVector3(0, 0, 0);
  const vec2 = new Ammo.btVector3(0, 0, 0);
  const vec3 = new Ammo.btVector3(0, 0, 0);
  const triangleMesh = new Ammo.btTriangleMesh();

  if (!data.length) return false;
  for (let i = 0; i < data.length / 9; i++) {
    vec1.setX(data[i * 9]);
    vec1.setY(data[i * 9 + 1]);
    vec1.setZ(data[i * 9 + 2]);

    vec2.setX(data[i * 9 + 3]);
    vec2.setY(data[i * 9 + 4]);
    vec2.setZ(data[i * 9 + 5]);

    vec3.setX(data[i * 9 + 6]);
    vec3.setY(data[i * 9 + 7]);
    vec3.setZ(data[i * 9 + 8]);

    triangleMesh.addTriangle(
      vec1,
      vec2,
      vec3,
      false
    );
  }

  return triangleMesh;
};

export const convexGeometryProcessor = (geometry) => {
  const data = geometry.isBufferGeometry
    ? geometry.attributes.position.array
    : new Float32Array(geometry.faces.length * 9);

  if (!geometry.isBufferGeometry) {
    const { vertices } = geometry;

    for (let i = 0; i < geometry.faces.length; i++) {
      const face = geometry.faces[i];
      const vA = vertices[face.a];
      const vB = vertices[face.b];
      const vC = vertices[face.c];

      const i9 = i * 9;

      data[i9] = vA.x;
      data[i9 + 1] = vA.y;
      data[i9 + 2] = vA.z;

      data[i9 + 3] = vB.x;
      data[i9 + 4] = vB.y;
      data[i9 + 5] = vB.z;

      data[i9 + 6] = vC.x;
      data[i9 + 7] = vC.y;
      data[i9 + 8] = vC.z;
    }
  }

  const shape = new Ammo.btConvexHullShape();
  const vec1 = new Ammo.btVector3(0, 0, 0);

  for (let i = 0; i < data.length / 3; i++) {
    vec1.setX(data[i * 3]);
    vec1.setY(data[i * 3 + 1]);
    vec1.setZ(data[i * 3 + 2]);

    shape.addPoint(vec1);
  }
  return shape;
};
