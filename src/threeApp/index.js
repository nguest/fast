// Global imports
import * as THREE from 'three';
import React, { PureComponent } from 'react';
import { func, object, string } from 'prop-types';

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
import { createTrees } from './custom/geometries/trees';
// import { Sky } from './components/Sky';
import { createGates, detectGateCollisions } from './components/Gates';
import { decorateTrack, createApexMarkers } from './custom/geometries/track';
import { decorateGrass } from './custom/geometries/grass';
import { computeTrackParams } from './custom/geometries/trackParams';
import { createTerrain } from './custom/geometries/terrain';
import { decorateTerrainSmall } from './custom/geometries/terrainSmall';


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
    this.selectedTrack = this.props.selectedTrack;
    this.initialize();
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedTrack !== prevProps.selectedTrack) {
      this.renderer = null;
      this.container.innerHTML = null;
      this.selectedTrack = this.props.selectedTrack;

      this.props.setIsLoading(true);
      //this.container = null;
      this.initialize();
    }
    
  }

  initialize() {
    console.log({ tP: this.props });
    
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
    this.frameCount = 0;
    this.lights = this.createLights();
    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.showStatus(`Loading file: ${itemsLoaded} of ${itemsTotal} files.`);
    };
    this.vehicleState = { vehicleSteering: 0 };
    // this.sky = new Sky(this.scene);
    this.trackParams = computeTrackParams(this.selectedTrack);
    this.props.setTrackParams(this.trackParams);
    this.gates = createGates(this.scene, this.trackParams);

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
    this.objects = objectsIndex(this.trackParams).map((obj) => {
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
    createTrees(this.scene, this.trackParams);
    decorateTrack(getObjByName(this.scene, 'track'), this.scene, this.trackParams, materials.roadRacingLine);
    decorateGrass(getObjByName(this.scene, 'grassL'), this.scene, this.trackParams);
    //decorateTerrainSmall(getObjByName(this.scene, 'terrainSmall'), this.scene);
    createApexMarkers(this.scene, this.trackParams);
   // createRacingLine(apexes);
    //createTerrain(this.scene)

    this.instancedMeshes = this.scene.children.filter((o) => o.userData.type === 'instancedMesh');
    console.info({ 'this.scene': this.scene.children.filter((o) => o.userData.type !== 'gate') });

    const helper = new THREE.GridHelper(10, 2, 0xffffff, 0xffffff);
    this.scene.add(helper);
  }

  createWorld(materials, assets) {
    this.createObjects(materials);

    // calculate global envmap and skybox
    createSkyBoxFrom4x3({
      scene: this.scene,
      boxDimension: 8000,
      image: assets.Skybox,
      tileSize: 512,
      manager: this.manager,
    });

    this.manager.onLoad = () => { // all managed objects loaded
      this.props.setIsLoading(false);
      this.showStatus('ALL OBJECTS LOADED');

      // set chassisMesh in position, attach car and decorate
      this.chassisMesh = getObjByName(this.scene, 'chassisMesh');
      const baseCar = getObjByName(this.scene, 'porsche_911gt2');
      const { car, brakeLights } = decorateCar(baseCar, this.brakeLights, this.scene);
      this.brakeLights = brakeLights;
      this.chassisMesh.add(car);
      this.resetObjects(0);

      // create followCam
      this.followCam = new Camera(this.renderer.threeRenderer, this.container, this.chassisMesh);

      // scale bg objects to track
      scaleBackground(this.scene);

      if (Config.isDev) this.gui = new DatGUI(this);

      // setup light camera goal
      this.localGoal = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 0.1), materials.green);
      this.localGoal.position.set(0, 0, 50);
      this.chassisMesh.add(this.localGoal);

      this.worldGoal = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 0.1), materials.mappedFlat);
      this.scene.add(this.worldGoal);
      this.lights[1].target = this.worldGoal;
      console.log({ t: this });
      
      this.animate();
    };
  }

  animate() {
    const deltaTime = this.clock.getDelta();
    if (this.frameCount >= 10) this.frameCount = 0;
    this.frameCount++;

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
    this.updatePhysics(deltaTime, this.frameCount);
    const collidee = detectGateCollisions(this.chassisMesh, this.gates);
    this.showGamePosition(collidee);

    requestAnimationFrame(this.animate.bind(this)); // Bind the main class instead of window object
  }

  updateShadowCamera() {
    // get the vehicleGoal position, copy it to the worldGoal to avoid local rotations of shadow camera
    const targetPosn = this.localGoal.getWorldPosition(new THREE.Vector3());
    this.worldGoal.position.copy(targetPosn);
    const lightPosition = this.worldGoal.position.clone().add(new THREE.Vector3(...lightsIndex[1].position));
    this.lights[1].position.copy(lightPosition);
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

    this.followCam.threeCamera.lookAt(x, y + 0.6, z);

    // update instancedMeshes so frustrum culling works correctly
    // https://stackoverflow.com/questions/51025071/instance-geometry-frustum-culling
    this.instancedMeshes.forEach((mesh) => {
      mesh.geometry.boundingSphere.center.set(x, y, z);
    });
  }

  updatePhysics(deltaTime) {
    // Step world
    if (this.physicsWorld.bodies[4]) {

    this.physicsWorld.stepSimulation(0.033, 0); // jerky if set to deltaTime??
    // Update rigid bodies (just vehicle)
      this.vehicleState = updateVehicle(
        deltaTime,
        this.physicsWorld.bodies[4],
        this.interaction,
        this.brakeLights,
        this.showStatus,
        this.frameCount,
      );
    }
  }

  resetObjects(gate) {
    console.log('resetObjects: ', gate);
    this.showGamePosition(gate);
    if (!this.physicsWorld) return;
    const { position, quat } = getPosQuatFromGamePosition(gate, this.trackParams);
    this.controls.target.copy(position);
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
    this.props.setStatus(message);
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
    console.log({ t: this });
    
    return <section ref={(ref) => { this.container = ref; }} style={{ width: '100%' }} />;
  }
}

Main.propTypes = {
  setIsLoading: func,
  setStatus: func,
  gamePosition: object,
  setGamePosition: func,
  selectedTrack: string,
};
