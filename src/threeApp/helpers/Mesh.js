import * as THREE from 'three';
import { promisifyLoader } from './helpers';
import Ammo from 'ammonext';

export default class Mesh {
  constructor({ 
    type,
    url, 
    params, 
    position = [0,0,0], 
    rotation = [0,0,0],
    scale = [1,1,1], 
    geoRotate,
    shadows = { receive: false, cast: true }, 
    material,
    mass,
    friction = 1,
    scene = this.scene,
    physics = {},
    hasPhysics = false,
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
    this.scene = scene;
    this.physicsWorld = physics.physicsWorld;
    this.addObjectToScene = add;

    if (!add) return;

    if (type === 'JSON') {
      this.initLoader(url);
    } else {
      const geometry = new THREE[type](...params);

      if (params === 'custom') {
        // must be custom type
        // do geometry calcs somehow
        if (!calculateVertices || !calculateFaces) {
          throw new Error('calculateVertices and calculateFaces Functions must be defined to calculate custom geometry')
        }
        const vertices = calculateVertices();
        const faces = calculateFaces();

        geometry.vertices = vertices;
        geometry.faces = faces;

        console.log({ 1: geometry, faces, vertices })

        geometry.computeVertexNormals();
        geometry.computeFaceNormals();
        geometry.computeBoundingBox();
        geometry.name = name;
        const faceVertexUvs = calculateUVs(geometry);
        geometry.faceVertexUvs[0] = faceVertexUvs;
        console.log({ 2: geometry, faces, vertices, bb: geometry.boundingBox })

        geometry.elementsNeedUpdate = true;
        geometry.verticesNeedUpdate = true;
        geometry.uvsNeedUpdate = true;
        
      }

      const mesh = this.orientObject(geometry);
      if (this.physicsWorld) this.calculatePhysics(mesh, params, physics, type);


    }
  }

  
  async initLoader(url) {
    const JSONPromiseLoader = promisifyLoader(new THREE.JSONLoader())
    const geometry = await JSONPromiseLoader.load(url).catch(() => console.log('error loading ' + url))
    return this.orientObject(geometry); 
  }

  orientObject(geometry) {
    geometry.elementsNeedUpdate = true
    geometry.verticesNeedUpdate = true;
    geometry.computeBoundingBox()

    if (this.geoRotate) {
      geometry.rotateX(this.geoRotate[0])
      geometry.rotateY(this.geoRotate[1])
      geometry.rotateZ(this.geoRotate[2])
    }
    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.position.set(...this.position);
    mesh.rotation.set(...this.rotation);
    mesh.scale.set(...this.scale);
    mesh.castShadow = this.shadows.cast;
    mesh.receiveShadow = this.shadows.receive;

    if (this.addObjectToScene) {
      // const faceNormalsHelper = new THREE.FaceNormalsHelper(mesh, 2, 0x00ff00, 1);
      // this.scene.add(faceNormalsHelper);
      this.scene.add(mesh);
      console.log('this.scene', this.scene, mesh )
    }
    return mesh;
  }

  calculatePhysics(mesh, params, physics, type) {
    //Ammojs Section
    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...this.rotation, 'XYZ'));
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(...this.position));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);
  
    let colShape;
    switch(type) {
      case 'SphereBufferGeometry':
        colShape = new Ammo.btSphereShape(params[0]); break;
      case 'BoxBufferGeometry':
        colShape = new Ammo.btBoxShape(new Ammo.btVector3(params[0] * 0.5, params[1] * 0.5, params[2] * 0.5)); break;
      case 'PlaneBufferGeometry':
        colShape = new Ammo.btBoxShape(new Ammo.btVector3(params[0], params[1], 1)); break;
      case 'Geometry':
        colShape = new Ammo.btBvhTriangleMeshShape(concaveGeometryProcessor(mesh.geometry), true, true); break;
        //colShape = new Ammo.btConvexHullShape(convexGeometryProcessor(mesh.geometry), true, true); break;
        //var btConvexHullShape = new Ammo.btConvexHullShape()
        //new Ammo.btBvhTriangleMeshShape
      default:
        colShape = null;
    }


    //colShape.setMargin(0.05);
  
    const localInertia = new Ammo.btVector3(0,0,0);
    colShape.calculateLocalInertia(physics.mass, localInertia);
  
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(physics.mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);
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

  const data = geometry.isBufferGeometry ?
    geometry.attributes.position.array :
    new Float32Array(geometry.faces.length * 9);

  if (!geometry.isBufferGeometry) {
    const vertices = geometry.vertices;

    for (let i = 0; i < geometry.faces.length; i++) {
      const face = geometry.faces[i];
      const vA = vertices[face.a];
      const vB = vertices[face.b];
      const vC = vertices[face.c];

      const i9 = i * 9;

      data[i9] = vA.x;;
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
  console.log({ data })
  //return data;
  let _vec3_1 = new Ammo.btVector3(0,0,0);//new THREE.Vector3();
  let _vec3_2 = new Ammo.btVector3(0,0,0);//new THREE.Vector3();
  let _vec3_3 = new Ammo.btVector3(0,0,0);//new THREE.Vector3();
  const triangle_mesh = new Ammo.btTriangleMesh();

  if (!data.length) return false;
  for (let i = 0; i < data.length / 9; i++) {
    _vec3_1.setX(data[i * 9]);
    _vec3_1.setY(data[i * 9 + 1]);
    _vec3_1.setZ(data[i * 9 + 2]);

    _vec3_2.setX(data[i * 9 + 3]);
    _vec3_2.setY(data[i * 9 + 4]);
    _vec3_2.setZ(data[i * 9 + 5]);

    _vec3_3.setX(data[i * 9 + 6]);
    _vec3_3.setY(data[i * 9 + 7]);
    _vec3_3.setZ(data[i * 9 + 8]);

    triangle_mesh.addTriangle(
      _vec3_1,
      _vec3_2,
      _vec3_3,
      false
    );
  }
  console.log({ _vec3_2 })

  return triangle_mesh;

  // shape = new Ammo.btBvhTriangleMeshShape(
  //   triangle_mesh,
  //   true,
  //   true
  // );

  // _noncached_shapes[description.id] = shape;

  //break;
}

const convexGeometryProcessor = (geometry) => {

  const data = geometry.isBufferGeometry
    ? geometry.attributes.position.array
    : new Float32Array(geometry.faces.length * 9);

  if (!geometry.isBufferGeometry) {
    const vertices = geometry.vertices;

    for (let i = 0; i < geometry.faces.length; i++) {
      const face = geometry.faces[i];
      const vA = vertices[face.a];
      const vB = vertices[face.b];
      const vC = vertices[face.c];

      const i9 = i * 9;

      data[i9] = vA.x;;
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
console.log({ data })
  const shape = new Ammo.btConvexHullShape();
  //const data = description.data;
  let _vec3_1 = new THREE.Vector3();

  for (let i = 0; i < data.length / 3; i++) {
    _vec3_1.setX(data[i * 3]);
    _vec3_1.setY(data[i * 3 + 1]);
    _vec3_1.setZ(data[i * 3 + 2]);

    shape.addPoint(_vec3_1);
  }
  return shape;
}



// case 'concave':
//     {
//       const triangle_mesh = new Ammo.btTriangleMesh();
//       if (!description.data.length) return false;
//       const data = description.data;

//       for (let i = 0; i < data.length / 9; i++) {
//         _vec3_1.setX(data[i * 9]);
//         _vec3_1.setY(data[i * 9 + 1]);
//         _vec3_1.setZ(data[i * 9 + 2]);

//         _vec3_2.setX(data[i * 9 + 3]);
//         _vec3_2.setY(data[i * 9 + 4]);
//         _vec3_2.setZ(data[i * 9 + 5]);

//         _vec3_3.setX(data[i * 9 + 6]);
//         _vec3_3.setY(data[i * 9 + 7]);
//         _vec3_3.setZ(data[i * 9 + 8]);

//         triangle_mesh.addTriangle(
//           _vec3_1,
//           _vec3_2,
//           _vec3_3,
//           false
//         );
//       }

//       shape = new Ammo.btBvhTriangleMeshShape(
//         triangle_mesh,
//         true,
//         true
//       );

//       _noncached_shapes[description.id] = shape;

//       break;
//     }
// function createBall(){
    
  //   let pos = {x: 0, y: 20, z: 0};
  //   let radius = 2;
  //   let quat = {x: 0, y: 0, z: 0, w: 1};
  //   let mass = 1;
  
  //   //threeJS Section
  //   let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0xff0505}));
  
  //   ball.position.set(pos.x, pos.y, pos.z);
    
  //   ball.castShadow = true;
  //   ball.receiveShadow = true;
  
  //   scene.add(ball);
  
  
  //   //Ammojs Section
  //   let transform = new Ammo.btTransform();
  //   transform.setIdentity();
  //   transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
  //   transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
  //   let motionState = new Ammo.btDefaultMotionState( transform );
  
  //   let colShape = new Ammo.btSphereShape( radius );
  //   colShape.setMargin( 0.05 );
  
  //   let localInertia = new Ammo.btVector3( 0, 0, 0 );
  //   colShape.calculateLocalInertia( mass, localInertia );
  
  //   let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
  //   let body = new Ammo.btRigidBody( rbInfo );
  
  
  //   physicsWorld.addRigidBody( body );
    
  //   ball.userData.physicsBody = body;
  //   rigidBodies.push(ball);
  // }