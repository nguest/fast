import * as THREE from 'three';

import { Config } from '../sceneConfig/general';

// Class that creates and updates the main camera
export class Camera {
  constructor(renderer, container, followObj) {
    this.renderer = renderer;
    this.container = container;

    if (followObj) {
      this.threeCamera = new THREE.PerspectiveCamera(
        Config.followCam.fov,
        window.innerWidth / window.innerHeight,
        Config.followCam.near,
        Config.followCam.far,
      );
      const camPosition = followObj.position.clone().add(new THREE.Vector3(...Config.followCam.position));
      this.threeCamera.position.copy(camPosition);
    } else {
      this.threeCamera = new THREE.PerspectiveCamera(
        Config.camera.fov,
        window.innerWidth / window.innerHeight,
        Config.camera.near,
        Config.camera.far,
      );
      this.threeCamera.position.set(...Config.camera.position);
    }
    this.threeCamera.up = new THREE.Vector3(0, 1, 0);


    this.updateSize();

    // Listeners
    window.addEventListener('resize', () => this.updateSize(), false);
    document.addEventListener('DOMContentLoaded', () => this.updateSize(), false);
  }

  updateSize() {
    //this.threeCamera.aspect = window.innerWidth / window.innerHeight;
    //this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.setPixelRatio();
    // 2560 1440
    this.renderer.setSize(Config.res.x * 0.5, Config.res.y * 0.5);
    this.threeCamera.aspect = Config.res.x / Config.res.y;

    // Always call updateProjectionMatrix on camera change
    this.threeCamera.updateProjectionMatrix();
  }
}
