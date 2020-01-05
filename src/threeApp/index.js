// Global imports
import * as THREE from 'three';
import React, { PureComponent } from 'react';
import { func } from 'prop-types';

// import TWEEN from '@tweenjs/tween.js';
import Ammo from 'ammonext';
//import Ammo from 'ammo.js';

// Config
import { Config } from './sceneConfig/general';

// Components
import { Renderer } from './components/Renderer';
import { Camera } from './components/Camera';
import { Light } from './components/Light';
import { Controls } from './components/Controls';
import { Mesh } from './components/Mesh';
import { Forces } from './components/Forces';
import { createInstancedMesh } from './custom/geometries/trees';

// Helpers
import { promisifyLoader } from './helpers/helpers';
import { createSkyBoxFrom4x3 } from './helpers/skyBoxHelper';

// Assets & Materials
import { createMaterial } from './materials';
import { assetsIndex } from './sceneConfig/assets';
import { materialsIndex } from './sceneConfig/materials';

// Lights
import { lightsIndex } from './sceneConfig/lights';

// Objects
import { objectsIndex } from './sceneConfig/objects';

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
    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.showStatus(`Loading file: ${itemsLoaded} of ${itemsTotal} files.`);
    };
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
        material: materials[object.material],
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
    createInstancedMesh({ scene: this.scene });
  }

  createWorld(materials, assets) {
    this.createObjects(materials);

    const envCube = createSkyBoxFrom4x3({
      scene: this.scene,
      boxDimension: 1000,
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
      let car = this.scene.children.find((o) => o.name === 'car');
      car = this.decorateCar(car, envCube);
      if (this.followObj.children.length === 1) this.followObj.add(car);
      this.followCam = new Camera(this.renderer.threeRenderer, this.container, this.followObj);

      if (Config.isDev) this.gui = new DatGUI(this);
      console.log({ a: this.scene })
      this.animate();
    };
  }

  animate() {
    const deltaTime = this.clock.getDelta();
    const { rS } = this;

    if (Config.showStats) updateStatsStart(rS);
    if (Config.useFollowCam) {
      this.updateFollowCam();
      this.renderer.render(this.scene, this.followCam.threeCamera);
    } else {
      this.renderer.render(this.scene, this.camera.threeCamera);
    }


    if (Config.showStats) updateStatsEnd(rS);
    // TWEEN.update();
    this.interaction.keyboard.update();
    if (this.interaction.keyboard.down('space')) {
      console.log('space PRESSED');
      this.togglePause();
    }

    this.updateShadowCamera();
    this.controls.update();
    this.updatePhysics(deltaTime);
    requestAnimationFrame(this.animate.bind(this)); // Bind the main class instead of window object
  }

  updateShadowCamera() {
    const posn = this.followObj.position.add(new THREE.Vector3(...lightsIndex[1].position));
    this.light[1].position.set(posn.x, posn.y, posn.z);
    this.light[1].target = this.followObj;
  }

  updateFollowCam() {
    const relativeCameraOffset = new THREE.Vector3(...Config.followCam.position);

    const cameraOffset = relativeCameraOffset.applyMatrix4(this.followObj.matrixWorld);
    //this.followCam.threeCamera.position.copy(cameraOffset);
    this.followCam.threeCamera.position.copy(new THREE.Vector3(cameraOffset.x, cameraOffset.y, cameraOffset.z));

    //this.followCam.threeCamera.add( this.followObj);
    const { x, y, z } = this.followObj.position;
    this.followCam.threeCamera.lookAt(x, y, z);
  }

  updatePhysics(deltaTime) {
    // Step world
    this.physicsWorld.stepSimulation(deltaTime, 10);

    // Update rigid bodies
    for (let i = 0; i < this.physicsWorld.bodies.length; i++) {
      if (this.physicsWorld.bodies[i].name === 'chassisMesh') {
        updateVehicle(deltaTime, this.physicsWorld.bodies[i], this.interaction, this.brakeLights, this.showStatus);
      } else {
        const objThree = this.physicsWorld.bodies[i];
        const objPhys = objThree.userData.physicsBody;
        const motionState = objPhys.getMotionState();
        if (motionState) {
          motionState.getWorldTransform(this.auxTrans);
          const p = this.auxTrans.getOrigin();
          const q = this.auxTrans.getRotation();

          objThree.position.set(p.x(), p.y(), p.z());
          objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
      }
    }
  }

  decorateCar(car, envCube) {
    car.traverse((child) => {
      if (child.isMesh) {
        if (child.name === 'ty_rims_0') {
          //child.position.set(0, 4, 0);
          //rim = child;
        }
        if (child.name === 'gum001_carpaint_0') { // body
          // child.material.color = new THREE.Color(0x0000ff);
          //child.material.emissive = new THREE.Color(0x550000);
          child.material.reflectivity = 1;
          child.material.envMap = envCube;
          //child.material.roughness = 0;//.48608993902439024

          child.material.clearcoat = 1.0,
					child.material.clearcoatRoughness = 0.1;
          child.material.roughness = 0.5;
          child.material.metalness = 0.9;
          //child.material.metalness= 1;//0.41634908536585363
          console.log({ matttt: child.material })
        }
        if (child.name === 'gum012_glass_0') {
          child.material.envMap = envCube;
        }
        if (child.name === 'gum_details_glossy_0') {
          this.brakeLights = child;
        }
      }
    });
    car.position.set(0, -0.5, 0);
    return car;
  }

  resetObjects() {
    // reset three objects
    this.objects.forEach((o) => {
      o.setInitialState();
    });

    // reset physics world
    if (this.physicsWorld) {
      for (let i = 0; i < this.physicsWorld.bodies.length; i++) {
        const objThree = this.objects[i];
        const objPhys = objThree.mesh.userData.physicsBody;
        if (objPhys) { // && objPhys.getMotionState()) {
          const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...objThree.rotation, 'XYZ'));
          const transform = new Ammo.btTransform();
          transform.setIdentity();
          transform.setOrigin(new Ammo.btVector3(...objThree.position));
          transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

          const zeroVector = new Ammo.btVector3(0, 0, 0);
          objPhys.setLinearVelocity(zeroVector);
          objPhys.setAngularVelocity(zeroVector);
          objPhys.setWorldTransform(transform);
        }
      }
      // // reset some internal cached data in the broadphase
      // this.physicsWorld.getBroadphase().resetPool(this.physicsWorld.getDispatcher());
      // this.physicsWorld.getConstraintSolver().reset();
    }
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
    this.props.setStatus(message);
  }

  render() {
    return <section ref={(ref) => { this.container = ref; }} />;
  }
}

Main.propTypes = {
  setIsLoading: func,
  setStatus: func,
};
