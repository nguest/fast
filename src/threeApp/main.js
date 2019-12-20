// Global imports
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import Ammo from 'ammonext';

// Config
import Config from './config';

// Components
import Renderer from './components/renderer';
import Camera from './components/camera';
import Light from './components/light';
import Controls from './components/controls';

// Helpers
import { promisifyLoader, klein } from './helpers/helpers';
import Mesh from './helpers/Mesh';

// Assets & Materials
import { createMaterial } from './materials/material';
import { assetsIndex } from './assetsIndex';
import { materialsIndex } from './materialsIndex';

// Objects
import { objectsIndex } from './objectsIndex';

// Managers
import Interaction from './managers/interaction';
import DatGUI from './managers/datGUI';

// Stats
import { createStats, updateStatsStart, updateStatsEnd } from './helpers/stats';

// -- End of imports

let auxTrans = new Ammo.btTransform();

export default class Main {
  constructor(container, cb) {

    console.log({ Ammo })
    this.container = container;
    this.clock = new THREE.Clock();
    this.cb = cb;

    this.createPhysicsWorld();

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    if (window.devicePixelRatio) {
      Config.dpr = window.devicePixelRatio;
    }

    this.renderer = new Renderer(this.scene, container);
    this.camera = new Camera(this.renderer.threeRenderer, container);
    this.controls = new Controls(this.camera.threeCamera, this.renderer, container);
    this.interaction = new Interaction(this.renderer, this.scene, this.camera, this.controls);
    this.light = new Light(this.scene);

    // Create and place lights in scene
    const lights = ['ambient', 'directional', 'point', 'hemi'];
    lights.forEach(light => (
      this.light.place(light)
    ));

    if(Config.isDev) {
      this.rS = createStats();
      this.gui = new DatGUI(this);
    }

    const texturesAndFiles = this.loadAssets();
    this.createMaterials(texturesAndFiles);
  }

  loadAssets() {
    const FilePromiseLoader = promisifyLoader(new THREE.FileLoader());
    const filesPromises = Object.values(assetsIndex.files).map((file) => (
      FilePromiseLoader.load(file.path)
    ));

    const TexturePromiseLoader = promisifyLoader(new THREE.TextureLoader());
    const texturesPromises = Object.values(assetsIndex.textures).map((texture) => (
      TexturePromiseLoader.load(texture.path)
    ));
    this.texturesAndFiles = { filesPromises, texturesPromises };

    return this.texturesAndFiles;
  }

  createMaterials(filesAndTextures) {
    const { filesPromises, texturesPromises } = filesAndTextures;
    Promise.all([...filesPromises, ...texturesPromises])
      .then((r) => {
        const assets = r.reduce((agg, asset, idx) => {
          const fileNames = [...Object.keys(assetsIndex.files), ...Object.keys(assetsIndex.textures)]
          return {
            ...agg,
            [fileNames[idx]]: asset,
          };
        }, {});
 
        const materials = materialsIndex.reduce((agg,materialParams) => ({
            ...agg,
            [materialParams.name]: createMaterial(materialParams, assets)
          }), {});

        return this.createWorld(materials);
      })
  }

  createPhysicsWorld() {
    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration();
    let dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration);
    let overlappingPairCache    = new Ammo.btDbvtBroadphase();
    let solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    let physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(...Config.gravity));
    physicsWorld.bodies = [];
    this.physicsWorld = physicsWorld;
  }

  createObjects = (materials) => {
    objectsIndex({materials}).forEach((object) => {
      new Mesh({
        ...object,
        type: object.type, 
        params: object.params,
        position: object.position,
        rotation: object.rotation,
        material: object.material,
        scene: this.scene,
        physics: {
          physicsWorld: this.physicsWorld,
          mass: object.physics.mass,
          friction: object.physics.friction,
          restitution: object.physics.restitution,
          damping: object.physics.damping,
        },
        shadows: object.shadows,
      });
    });
  }

  createWorld(materials) {
    this.createObjects(materials);
    this.addEventListeners();
    this.animate();
  }

  animate() {
    const deltaTime = this.clock.getDelta();
    const rS = this.rS;

    //if (Config.isDev) updateStatsStart(rS)
    this.renderer.render(this.scene, this.camera.threeCamera);
    //if (Config.isDev) updateStatsEnd(rS)
    
    //TWEEN.update();
    this.controls.update();
    this.updatePhysics(deltaTime);
    requestAnimationFrame(this.animate.bind(this)); // Bind the main class instead of window object
  }

  updatePhysics(deltaTime) {
    // Step world
    this.physicsWorld.stepSimulation(deltaTime, 10);
  
    // Update rigid bodies
    for (let i = 0; i < this.physicsWorld.bodies.length; i++) { 
      const objThree = this.physicsWorld.bodies[i];
      const objPhys = objThree.userData.physicsBody;
      const motionState = objPhys.getMotionState();
      if (motionState) {
        motionState.getWorldTransform(auxTrans);
        let p = auxTrans.getOrigin();
        let q = auxTrans.getRotation();

        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }
    }
  }

  addEventListeners() {
    this.container.addEventListener('keydown', this.keydown, false);
  }

  keydown = (e) => {
    console.log(e.keyCode)
    switch(e.keyCode) {
      case 32: // spacebar
        e.preventDefault();
        if (this.clock.running) {
          this.clock.stop();
          this.showStatus('Paused');
        } else {
           this.clock.start();
           this.showStatus('');
        }
        break;
      default:
        return null;
    }
  }

  showStatus = (message) => {
    this.cb.setStatus(message);
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