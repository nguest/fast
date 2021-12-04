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
import { createGates, detectGateCollisions } from './components/Gates';
import { computeTrackParams } from './custom/geometries/trackParams';

// Helpers
import { scaleBackground } from './helpers/helpers';
import { createSkyBoxFrom4x3 } from './helpers/skyBoxHelper';

// Assets, Materials, Objects Helpers
import { createMaterials, createObjects, createPhysicsWorld, loadAssets, resetObjects } from './helpers/mainHelpers';

// Lights
import { lightsIndex } from './sceneConfig/lights';

// Objects
import { createCar } from './helpers/car';

// Managers
import { Interaction } from './managers/Interaction';
import { DatGUI } from './managers/DatGUI';

// Stats
import { Stats } from './helpers/statsModule';
import { updateVehicle } from './custom/geometries/vehicle';

// -- End of imports
export class Main extends PureComponent {
  componentDidMount() {
    this.selectedTrack = this.props.selectedTrack;
    this.initialize();
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedTrack !== prevProps.selectedTrack) {
      this.renderer = null;
      this.physicsWorld = null;
      this.container.innerHTML = null;
      this.selectedTrack = this.props.selectedTrack;
      this.props.setIsLoading(true);

      this.initialize();
    }
  }

  initialize() {
    THREE.Cache.enabled = true;
    this.createPhysicsWorld();
    this.auxTrans = new Ammo.btTransform();
    this.tempVector = new THREE.Vector3();

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);
    this.renderer = new Renderer(this.scene, this.container);
    this.camera = new Camera(this.renderer.threeRenderer, this.container);
    this.controls = new Controls(this.camera.threeCamera, this.renderer, this.container);
    this.interaction = new Interaction(this.renderer, this.scene, this.camera, this.controls);
    this.clock = new THREE.Clock();
    this.frameCount = 0;
    this.totalFrames = 0;
    this.lights = this.createLights();
    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.showStatus({ message: `Loading file: ${itemsLoaded} of ${itemsTotal} files.` });
    };
    this.vehicleState = { vehicleSteering: 0 };
    this.trackParams = computeTrackParams(this.selectedTrack);
    this.props.setTrackParams(this.trackParams);
    this.gates = createGates(this.scene, this.trackParams);

    if (Config.showStats) {
      this.stats = Stats();
      this.container.appendChild(this.stats.dom);
    }
    if (Config.isDev) {
      const axesHelper = new THREE.AxesHelper(150);
      this.scene.add(axesHelper);
    }

    this.texturesAndFiles = loadAssets(this.manager);
    this.createMaterials(this.texturesAndFiles);
    this.appInitialized = true;
  }

  createLights() {
    return lightsIndex.map((light) => new Light(light, this.scene));
  }

  createMaterials = async (filesAndTextures) => {
    const { materials, assets } = await createMaterials(filesAndTextures);
    return this.createWorld(materials, assets);
  };

  createPhysicsWorld = () => {
    this.physicsWorld = createPhysicsWorld();
  };

  createWorld(materials, assets) {
    const { objects, instancedMeshes } = createObjects(materials, assets, this.trackParams, this.scene, this.manager, this.physicsWorld);
    this.objects = objects;
    this.instancedMeshes = instancedMeshes;

    // gstcalculate global envmap and skybox
    createSkyBoxFrom4x3({
      scene: this.scene,
      boxDimension: 8000,
      image: assets.Skybox,
      tileSize: 256,
      manager: this.manager,
    });

    this.manager.onLoad = () => {
      // all managed objects loaded
      this.props.setIsLoading(false);
      this.showStatus({ message: 'ALL OBJECTS LOADED' });

      // create decorated car
      const { chassisMesh, brakeLights } = createCar(this.scene);
      this.chassisMesh = chassisMesh;
      this.brakeLights = brakeLights;

      // reset objects to start
      this.resetObjects(0);

      // create followCam
      this.followCam = new Camera(this.renderer.threeRenderer, this.container, this.chassisMesh);

      // scale bg objects to track
      scaleBackground(this.scene);

      if (Config.isDev) this.gui = new DatGUI(this);

      // setup light camera goal
      this.localGoal = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 5, 0.1), materials.green);
      this.localGoal.position.set(0, 0, 50);
      this.chassisMesh.add(this.localGoal);

      this.worldGoal = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 0.1), materials.mappedFlat);
      this.scene.add(this.worldGoal);
      this.lights[1].target = this.worldGoal;

      // ----
      this.rabbit = new THREE.Mesh(new THREE.SphereBufferGeometry(2, 4, 4), materials.mappedFlat);
      this.racingLineSpline = new THREE.CatmullRomCurve3(this.trackParams.racingLine.map((p) => new THREE.Vector3(p.x, 0, p.z)));
      this.scene.add(this.marker);

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

    this.totalFrames++;

    // rabbit test
    const rlPoint = this.racingLineSpline.getPoint(this.totalFrames / 100000);
    this.rabbit.position.set(rlPoint.x, rlPoint.y, rlPoint.z);

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
      new THREE.Vector3(cameraOffset.x, cameraOffset.y + 0.6, cameraOffset.z), // set y fixed so car bounces
    );

    const { x, y, z } = this.chassisMesh.position;
    // this.tempVector.setFromMatrixPosition(this.goal.matrixWorld);
    // this.followCam.threeCamera.position.lerp(this.tempVector, 0.1);

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
      this.physicsWorld.stepSimulation(
        // process.env.NODE_ENV === 'development' ? 0.033 : deltaTime,
        0.033,
        10,
      ); // jerky if set to deltaTime??
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
    resetObjects(gate, this.physicsWorld, this.controls, this.trackParams, this.showGamePosition);
  }

  togglePause() {
    if (this.clock.running) {
      this.clock.stop();
      this.showStatus({ message: 'Paused' });
    } else {
      this.clock.start();
      this.showStatus({ message: '' });
    }
  }

  showStatus = (args) => {
    this.props.setStatus(args);
  };

  showGamePosition = (gate) => {
    if (gate && this.props.gamePosition.gate !== gate) {
      this.props.setGamePosition({
        gate,
        vehiclePosition: this.chassisMesh.position,
      });
    }
  };

  render() {
    return (
      <section
        ref={(ref) => {
          this.container = ref;
        }}
        style={{ width: '100%' }}
      />
    );
  }
}

Main.propTypes = {
  gamePosition: object,
  selectedTrack: string,
  setGamePosition: func,
  setIsLoading: func,
  setStatus: func,
  setTrackParams: func,
};
