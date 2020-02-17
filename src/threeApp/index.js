// Global imports
import * as THREE from 'three';
import React, { PureComponent } from 'react';
import { func, object, number } from 'prop-types';

// import TWEEN from '@tweenjs/tween.js';
import Ammo from 'ammonext';

// Config
import { Config } from './sceneConfig/general';

// Components
import { Renderer } from './components/Renderer';
import { Camera } from './components/Camera';
import { Light } from './components/Light';
import { Controls } from './components/Controls';
import { Mesh } from './components/Mesh';
// import { Forces } from './components/Forces';
import { createTrees } from './custom/geometries/trees';
import { Sky } from './components/Sky';
import { createGates, detectGateCollisions } from './components/Gates';
import { createTrackDecals, createApexes } from './custom/geometries/track';
import { decorateGrass } from './custom/geometries/grass';
import { trackParams } from './custom/geometries/trackParams';

// Helpers
import { promisifyLoader, getPosQuatFromGamePosition, getObjByName, scaleBackground } from './helpers/helpers';
import { createSkyBoxFrom4x3 } from './helpers/skyBoxHelper';

// Assets & Materials
import { createMaterial } from './materials';
import { assetsIndex } from './sceneConfig/assets';
import { materialsIndex } from './sceneConfig/materials';

// Lights
import { lightsIndex } from './sceneConfig/lights';

// Objects
import { objectsIndex } from './sceneConfig/objects';
import { decorateCar } from './helpers/car';

// Managers
import { Interaction } from './managers/Interaction';
import { DatGUI } from './managers/DatGUI';

// Stats
import { Stats } from './helpers/statsModule';
import { updateVehicle } from './custom/geometries/vehicle';

// -- End of imports

const zeroVector = new Ammo.btVector3(0, 0, 0);

export class Main extends PureComponent {
  componentDidMount() {
    this.initialize();
  }

  // componentDidUpdate(prevProps) {
  //   if (prevProps.gamePosition !== this.props.gamePosition) {
  //     console.log({p: this.props.gamePosition });
  //     this.resetObjects(this.props.gamePosition)
  //   }
  // }

  initialize() {
    this.createPhysicsWorld();
    this.auxTrans = new Ammo.btTransform();
    this.temp = new THREE.Vector3();

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    this.renderer = new Renderer(this.scene, this.container);
    this.camera = new Camera(this.renderer.threeRenderer, this.container);
    this.controls = new Controls(this.camera.threeCamera, this.renderer, this.container);
    this.interaction = new Interaction(this.renderer, this.scene, this.camera, this.controls);
    this.clock = new THREE.Clock();
    this.lights = this.createLights();
    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.showStatus(`Loading file: ${itemsLoaded} of ${itemsTotal} files.`);
    };
    this.vehicleState = { vehicleSteering: 0 };
    // this.sky = new Sky(this.scene);
    this.gates = createGates(this.scene);

    // this.skyBox = new SkyBox(this.scene);

    if (Config.showStats) {
      this.stats = new Stats();
      this.container.appendChild(this.stats.dom);
    }
    if (Config.isDev) {
      const axesHelper = new THREE.AxesHelper(150);
      this.scene.add(axesHelper);
    }

    const texturesAndFiles = this.loadAssets();
    this.createMaterials(texturesAndFiles);
    this.appInitialized = true;
  }

  loadAssets() {
    const imageLoader = new THREE.ImageBitmapLoader(this.manager);
    imageLoader.options = { preMultiplyAlpha: 'preMultiplyAlpha' };
    const ImagePromiseLoader = promisifyLoader(imageLoader);
    const imagePromises = Object.values(assetsIndex.images).map((file) => (
      ImagePromiseLoader.load(file.path)
    ));

    const TexturePromiseLoader = promisifyLoader(new THREE.TextureLoader(this.manager));
    const texturesPromises = Object.values(assetsIndex.textures).map((texture) => (
      TexturePromiseLoader.load(texture.path)
    ));
    this.texturesAndFiles = { imagePromises, texturesPromises };

    return this.texturesAndFiles;
  }

  createLights() {
    return lightsIndex.map((light) => new Light(light, this.scene));
  }

  createMaterials(filesAndTextures) {
    const { imagePromises, texturesPromises } = filesAndTextures;
    Promise.all([...imagePromises, ...texturesPromises])
      .then((r) => {
        const assets = r.reduce((agg, asset, idx) => {
          const fileNames = [
            ...Object.keys(assetsIndex.images),
            ...Object.keys(assetsIndex.textures),
          ];
          return {
            ...agg,
            [fileNames[idx]]: asset,
          };
        }, {});

        const materials = materialsIndex.reduce((agg, materialParams) => ({
          ...agg,
          [materialParams.name]: createMaterial(materialParams, assets),
        }), {});
        console.log({ materials });
        return this.createWorld(materials, assets);
      });
  }

  createPhysicsWorld() {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    // var worldMin=new Ammo.btVector3(-1000,-1000,-1000);
    // var worldMax=new Ammo.btVector3(1000,1000,1000);
    // var overlappingPairCache= new Ammo.btAxisSweep3(worldMin,worldMax);

    const physicsWorld = new Ammo.btDiscreteDynamicsWorld(
      dispatcher, overlappingPairCache, solver, collisionConfiguration,
    );
    physicsWorld.setGravity(new Ammo.btVector3(...Config.gravity));
    physicsWorld.bodies = [];
    this.physicsWorld = physicsWorld;
  }

  createObjects = (materials) => {
    this.objects = objectsIndex.map((obj) => {
      const params = {
        ...obj,
        type: obj.type,
        params: obj.params,
        position: obj.position,
        rotation: obj.rotation,
        material: Array.isArray(obj.material)
          ? obj.material.map((m) => materials[m])
          : materials[obj.material],
        scene: this.scene,
        shadows: obj.shadows,
        manager: this.manager,
      };

      if (obj.physics) {
        params.physics = {
          physicsWorld: this.physicsWorld,
          mass: obj.physics.mass,
          friction: obj.physics.friction,
          restitution: obj.physics.restitution,
          damping: obj.physics.damping,
        };
      }
      return new Mesh(params).getMesh();
    });
    createTrees({ scene: this.scene });
    createTrackDecals(getObjByName(this.scene, 'track'), this.scene, materials.mappedFlat);
    console.log({ 'this.scene': this.scene.children.filter((o) => o.userData.type !== 'gate') });
    decorateGrass(getObjByName(this.scene, 'grass'), this.scene);

    this.instancedMeshes = this.scene.children.filter((o) => o.userData.type === 'instancedMesh');

    createApexes(this.scene);
    const helper = new THREE.GridHelper(10, 2, 0xffffff, 0xffffff);
    this.scene.add(helper);
  }

  createWorld(materials, assets) {
    this.createObjects(materials);

    // calculate global envmap and skybox
    const envCube = createSkyBoxFrom4x3({
      scene: this.scene,
      boxDimension: 10000,
      imageFile: './assets/textures/skybox1.png',
      image: assets.Skybox,
      tileSize: 1024,
      manager: this.manager,
    });

    this.manager.onLoad = () => { // all managed objects loaded
      this.props.setIsLoading(false);
      this.showStatus('ALL OBJECTS LOADED');

      // set chassisMesh in position, attach car and decorate
      this.chassisMesh = getObjByName(this.scene, 'chassisMesh');
      const baseCar = getObjByName(this.scene, 'car');
      console.log({ baseCar, a: this.chassisMesh })
      const { car, brakeLights } = decorateCar(baseCar, this.brakeLights, envCube);
      this.brakeLights = brakeLights;
      if (this.chassisMesh.children.length === 1) this.chassisMesh.add(car);
      this.resetObjects(0);

      // create followCam
      this.followCam = new Camera(this.renderer.threeRenderer, this.container, this.chassisMesh);

      // scale bg objects to track
      scaleBackground(this.scene);

      if (Config.isDev) this.gui = new DatGUI(this);

      // this.goal = new THREE.Object3D();
      // this.goal.position.set(0, 1.5, -7);
      // this.chassisMesh.add(this.goal);

      this.animate();
    };
  }

  animate() {
    const deltaTime = this.clock.getDelta();

    if (Config.showStats) this.stats.update();

    if (Config.useFollowCam) {
      this.updateFollowCam();
      this.renderer.render(this.scene, this.followCam.threeCamera);
    } else {
      this.renderer.render(this.scene, this.camera.threeCamera);
    }

    // TWEEN.update();
    this.interaction.keyboard.update();
    this.updateShadowCamera();
    if (!Config.useFollowCam) this.controls.update();
    this.updatePhysics(deltaTime);
    const collidee = detectGateCollisions(this.chassisMesh, this.gates);
    this.showGamePosition(collidee);

    requestAnimationFrame(this.animate.bind(this)); // Bind the main class instead of window object
  }

  updateShadowCamera() {
    const posn = this.chassisMesh.position.add(new THREE.Vector3(...lightsIndex[1].position));
    this.lights[1].position.set(posn.x, posn.y, posn.z);
    this.lights[1].target = this.chassisMesh;
  }

  updateFollowCam() {
    const { vehicleSteering } = this.vehicleState;

    const relativeCameraOffset = new THREE.Vector3(
      Config.followCam.position[0] + vehicleSteering * 20,
      Config.followCam.position[1],
      Config.followCam.position[2],
    );
    const cameraOffset = relativeCameraOffset.applyMatrix4(this.chassisMesh.matrixWorld);
    this.followCam.threeCamera.position.copy(
      new THREE.Vector3(cameraOffset.x, cameraOffset.y, cameraOffset.z),
    );

    const { x, y, z } = this.chassisMesh.position;
    // this.temp.setFromMatrixPosition(this.goal.matrixWorld);
    // this.followCam.threeCamera.position.lerp(this.temp, 0.1);

    this.followCam.threeCamera.lookAt(x, y + 0.5, z);

    // update instancedMeshes so frustrum culling works correctly
    // https://stackoverflow.com/questions/51025071/instance-geometry-frustum-culling
    this.instancedMeshes.forEach((mesh) => {
      mesh.geometry.boundingSphere.center.set(x, y, z);
    });
  }

  updatePhysics(deltaTime) {
    // Step world
    this.physicsWorld.stepSimulation(0.033, 0); // jerky if set to deltaTime??
    // Update rigid bodies (just vehicle)
    this.vehicleState = updateVehicle(
      deltaTime,
      this.physicsWorld.bodies[3],
      this.interaction,
      this.brakeLights,
      this.showStatus,
    );
  }

  resetObjects(gate) {
    console.log('resetObjects: ', gate);
    this.showGamePosition(gate);
    if (!this.physicsWorld) return;

    const { position, quat } = getPosQuatFromGamePosition(gate);
    const objThree = this.physicsWorld.bodies.find((o) => o.name === 'chassisMesh');
    const objPhys = objThree.userData.physicsBody;

    const body = objPhys.getRigidBody();
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y + 1, position.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

    body.setLinearVelocity(zeroVector);
    body.setAngularVelocity(zeroVector);
    body.setWorldTransform(transform);
  }

  togglePause() {
    if (this.clock.running) {
      this.clock.stop();
      this.showStatus('Paused');
    } else {
      this.clock.start();
      this.showStatus('');
    }
  }

  showStatus = (message) => {
    // debounce this!!
    //this.props.setStatus(message);
  }

  showGamePosition = (gate) => {
    if (gate && this.props.gamePosition.gate !== gate) {
      this.props.setGamePosition({
        gate,
        vehiclePosition: this.chassisMesh.position,
      });
    }
  }

  render() {
    return <section ref={(ref) => { this.container = ref; }} style={{ width: '100%' }} />;
  }
}

Main.propTypes = {
  setIsLoading: func,
  setStatus: func,
  gamePosition: object,
  setGamePosition: func,
};



  // resetObjects1() {
  //   // reset three objects
  //   this.objects.forEach((o) => {
  //     o.setInitialState();
  //   });

  //   // reset physics world
  //   if (this.physicsWorld) {
  //     for (let i = 0; i < this.physicsWorld.bodies.length; i++) {
  //       const objThree = this.objects[i];
  //       const objPhys = objThree.mesh.userData.physicsBody;
  //       if (objPhys) { // && objPhys.getMotionState()) {
  //         const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...objThree.rotation, 'XYZ'));
  //         const transform = new Ammo.btTransform();
  //         transform.setIdentity();
  //         transform.setOrigin(new Ammo.btVector3(...objThree.position));
  //         transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

  //         const zeroVector = new Ammo.btVector3(0, 0, 0);
  //         objPhys.setLinearVelocity(zeroVector);
  //         objPhys.setAngularVelocity(zeroVector);
  //         objPhys.setWorldTransform(transform);
  //       }
  //     }
  //     // // reset some internal cached data in the broadphase
  //     // this.physicsWorld.getBroadphase().resetPool(this.physicsWorld.getDispatcher());
  //     // this.physicsWorld.getConstraintSolver().reset();
  //   }
  // }