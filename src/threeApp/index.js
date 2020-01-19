// Global imports
import * as THREE from 'three';
import React, { PureComponent } from 'react';
import { func, number } from 'prop-types';

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

// Helpers
import { promisifyLoader, getPosRotFromGamePosition } from './helpers/helpers';
import { createSkyBoxFrom4x3 } from './helpers/skyBoxHelper';

// Assets & Materials
import { createMaterial } from './materials';
import { assetsIndex } from './sceneConfig/assets';
import { materialsIndex } from './sceneConfig/materials';

// Lights
import { lightsIndex } from './sceneConfig/lights';

// Objects
import { objectsIndex } from './sceneConfig/objects';
import { createSun } from './custom/geometries/sun';
import { decorateCar } from './helpers/car';

// Managers
import { Interaction } from './managers/Interaction';
import { DatGUI } from './managers/DatGUI';

// Stats
import { createStats, updateStatsStart, updateStatsEnd } from './helpers/stats';
import { updateVehicle } from './custom/geometries/vehicle';

// -- End of imports

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

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    if (window.devicePixelRatio) Config.dpr = window.devicePixelRatio;

    this.renderer = new Renderer(this.scene, this.container);
    this.camera = new Camera(this.renderer.threeRenderer, this.container);
    this.controls = new Controls(this.camera.threeCamera, this.renderer, this.container);
    this.interaction = new Interaction(this.renderer, this.scene, this.camera, this.controls);
    this.clock = new THREE.Clock();
    this.light = this.createLights();
    //this.clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 1);// Config.followCam.clipDistance);
    //this.renderer.clippingPlanes = [this.clippingPlane];
    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.showStatus(`Loading file: ${itemsLoaded} of ${itemsTotal} files.`);
    };
    this.vehicleState = { vehicleSteering: 0 };
    this.sky = new Sky(this.scene);
    this.gates = createGates(this.scene);

    // this.skyBox = new SkyBox(this.scene);

    if (Config.showStats) this.rS = createStats();
    if (Config.isDev) {
      const axesHelper = new THREE.AxesHelper(150);
      this.scene.add(axesHelper);
    }

    const texturesAndFiles = this.loadAssets();
    this.createMaterials(texturesAndFiles);
    this.appInitialized = true;
  }

  loadAssets() {
    const imageLoader = new THREE.
    Loader(this.manager);
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
        return this.createWorld(materials, assets);
      });
  }

  createPhysicsWorld() {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    const physicsWorld = new Ammo.btDiscreteDynamicsWorld(
      dispatcher, overlappingPairCache, solver, collisionConfiguration,
    );
    physicsWorld.setGravity(new Ammo.btVector3(...Config.gravity));
    physicsWorld.bodies = [];
    this.physicsWorld = physicsWorld;
  }

  createObjects = (materials) => {
    this.objects = objectsIndex.map((object) => {
      const params = {
        ...object,
        type: object.type,
        params: object.params,
        position: object.position,
        rotation: object.rotation,
        material: Array.isArray(object.material)
          ? object.material.map((m) => materials[m])
          : materials[object.material],
        scene: this.scene,
        shadows: object.shadows,
        manager: this.manager,
      };

      if (object.physics) {
        params.physics = {
          physicsWorld: this.physicsWorld,
          mass: object.physics.mass,
          friction: object.physics.friction,
          restitution: object.physics.restitution,
          damping: object.physics.damping,
        };
      }
      return new Mesh(params).getMesh();
    });
    createTrees({ scene: this.scene });
    console.log({ 'this.scene': this.scene.children.filter(o => o.userData.type !== 'gate') })

    //createSun(this.camera, this.scene);
    // const sunSphere = new THREE.Mesh(
    //   new THREE.SphereBufferGeometry( 100, 16, 8 ),
    //   new THREE.MeshBasicMaterial( { color: 0xffffff } )
    // );
    // sunSphere.position.y = - 700000;
    // sunSphere.visible = false;
    // this.scene.add( sunSphere );
    var helper = new THREE.GridHelper( 10, 2, 0xffffff, 0xffffff );
    this.scene.add( helper );
  }

  createWorld(materials, assets) {
    this.createObjects(materials);

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
      console.info('ALL OBJECTS LOADED');
      this.followObj = this.scene.children.find((o) => o.name === 'chassisMesh');
      const baseCar = this.scene.children.find((o) => o.name === 'car');
      const { car, brakeLights } = decorateCar(baseCar, this.brakeLights, envCube);
      this.brakeLights = brakeLights;

      if (this.followObj.children.length === 1) this.followObj.add(car);
      this.followCam = new Camera(this.renderer.threeRenderer, this.container, this.followObj);

      if (Config.isDev) this.gui = new DatGUI(this);

      this.animate();
    };
  }

  animate() {
    const deltaTime = this.clock.getDelta();
    const { rS } = this;

    if (Config.showStats) updateStatsStart(rS);

    if (Config.useFollowCam) {
      this.updateFollowCam();
      //this.updateClipping();
      this.renderer.render(this.scene, this.followCam.threeCamera);
    } else {
      this.renderer.render(this.scene, this.camera.threeCamera);
    }

    if (Config.showStats) updateStatsEnd(rS);

    // TWEEN.update();
    this.interaction.keyboard.update();
    this.updateShadowCamera();
    this.controls.update();
    this.updatePhysics(deltaTime);
    const collidee = detectGateCollisions(this.followObj, this.gates);
    this.showGamePosition(collidee);

    requestAnimationFrame(this.animate.bind(this)); // Bind the main class instead of window object
  }

  updateShadowCamera() {
    const posn = this.followObj.position.add(new THREE.Vector3(...lightsIndex[1].position));
    this.light[1].position.set(posn.x, posn.y, posn.z);
    this.light[1].target = this.followObj;
  }

  updateFollowCam() {
    const { vehicleSteering } = this.vehicleState;

    const relativeCameraOffset = new THREE.Vector3(
      Config.followCam.position[0] + vehicleSteering * 20,
      Config.followCam.position[1],
      Config.followCam.position[2],
    );
    const cameraOffset = relativeCameraOffset.applyMatrix4(this.followObj.matrixWorld);
    this.followCam.threeCamera.position.copy(
      new THREE.Vector3(cameraOffset.x, cameraOffset.y, cameraOffset.z),
    );

    const { x, y, z } = this.followObj.position;
    this.followCam.threeCamera.lookAt(x, y, z);

    // update instancedMeshes so frustrum culling works correctly https://stackoverflow.com/questions/51025071/instance-geometry-frustum-culling
    const instancedMeshes = this.scene.children.filter((o) => o.userData.type === 'instancedMesh');
    instancedMeshes.forEach((mesh) => mesh.geometry.boundingSphere.center.set(x, y, z));
  }

  updateClipping() {
    this.clippingPlane.constant = new THREE.Vector3(0, -10, 0);
    // -this.followObj.position.z + Config.followCam.clipDistance;
  }

  updatePhysics(deltaTime) {
    // Step world
    this.physicsWorld.stepSimulation(deltaTime, 10);

    // Update rigid bodies
    for (let i = 0; i < this.physicsWorld.bodies.length; i++) {
      if (this.physicsWorld.bodies[i].name === 'chassisMesh') {
        this.vehicleState = updateVehicle(
          deltaTime,
          this.physicsWorld.bodies[i],
          this.interaction,
          this.brakeLights,
          this.showStatus,
        );
      } 
      // else {
      //   const objThree = this.physicsWorld.bodies[i];
      //   const objPhys = objThree.userData.physicsBody;
      //   const motionState = objPhys.getMotionState();
      //   if (motionState) {
      //     motionState.getWorldTransform(this.auxTrans);
      //     const p = this.auxTrans.getOrigin();
      //     const q = this.auxTrans.getRotation();

      //     objThree.position.set(p.x(), p.y(), p.z());
      //     objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      //   }
      // }
    }
  }

  resetObjects(gamePosition) {
    console.log('gamePosition', gamePosition);
    this.showGamePosition(gamePosition);
    if (!this.physicsWorld) return;

    const { p, r } = getPosRotFromGamePosition(gamePosition);
    const objThree = this.physicsWorld.bodies.find((o) => o.name === 'chassisMesh');
    const objPhys = objThree.userData.physicsBody;

    const body = objPhys.getRigidBody();
    //const motionState = body.getMotionState();
    const transform = new Ammo.btTransform();
    transform.setIdentity();

    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r, 0, 'XYZ'));
    transform.setOrigin(new Ammo.btVector3(p.x, p.y + 1, p.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

    const zeroVector = new Ammo.btVector3(0, 0, 0);

    body.setLinearVelocity(zeroVector);
    body.setAngularVelocity(zeroVector);
    body.setWorldTransform(transform);
  }

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
    this.props.setStatus(message);
  }

  showGamePosition = (gamePosition) => {
    if (gamePosition && this.props.gamePosition !== gamePosition) {
      this.props.setGamePosition(gamePosition);
    }
  }

  render() {
    return <section ref={(ref) => { this.container = ref; }} />;
  }
}

Main.propTypes = {
  setIsLoading: func,
  setStatus: func,
  gamePosition: number,
  setGamePosition: func,
};
