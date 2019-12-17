import * as THREE from 'three';
import { promisifyLoader } from './helpers';
import Ammo from 'ammonext';
import { thisExpression } from '@babel/types';

export default class Mesh {
  constructor({ 
    type,
    url, 
    params, 
    position = [0,0,0], 
    rotation = [0,0,0],
    scale = [1,1,1], 
    geoRotate = [0,0,0],
    shadows = { receive: false, cast: true }, 
    material,
    mass,
    friction = 1,
    scene = this.scene,
    physics = {},
    hasPhysics = false,
    add = true,
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

    if (type === 'JSON') {
      this.initLoader(url);
    } else {
      const geometry = new THREE[type](...params);

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
    if (this.geoRotate) {
      geometry.rotateX(this.geoRotate[0])
      geometry.rotateY(this.geoRotate[1])
      geometry.rotateZ(this.geoRotate[2])
    }
    console.log({ rotation: this.rotation })
    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.position.set(...this.position);
    mesh.rotation.set(...this.rotation);
    mesh.scale.set(...this.scale);
    mesh.castShadow = this.shadows.cast;
    mesh.receiveShadow = this.shadows.receive;

    if (this.addObjectToScene) {
      this.scene.add(mesh);
    }
    return mesh;
  }

  calculatePhysics(mesh, params, physics, type) {
      //Ammojs Section
      console.log({  t: this.geoRotate})
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
      default:
        colShape = null;
    }


    colShape.setMargin(0.05);
  
    const localInertia = new Ammo.btVector3(0,0,0);
    colShape.calculateLocalInertia(physics.mass, localInertia);
  
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(physics.mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);
    body.setFriction(physics.friction || 0);
    body.setRestitution(physics.restitution || 1);
    body.setDamping(physics.damping || 0, physics.damping || 0);
  
    this.physicsWorld.addRigidBody(body);
    mesh.userData.physicsBody = body;
    this.physicsWorld.bodies.push(mesh);
  }
}
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