import * as THREE from 'three';

import { Config } from '../sceneConfig/general';

// Class that creates and updates the main camera
export class Camera {
  constructor(renderer, container) {
    this.renderer = renderer;
    this.container = container;

    this.threeCamera = new THREE.PerspectiveCamera(
      Config.camera.fov,
      window.innerWidth / window.innerHeight,
      Config.camera.near,
      Config.camera.far,
    );
    this.threeCamera.position.set(Config.camera.posX, Config.camera.posY, Config.camera.posZ);
    this.threeCamera.up = new THREE.Vector3(0, 1, 0);


    this.updateSize();

    // Listeners
    window.addEventListener('resize', () => this.updateSize(), false);
    document.addEventListener('DOMContentLoaded', () => this.updateSize(), false);
  }

  updateSize() {
    this.threeCamera.aspect = window.innerWidth / window.innerHeight;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Always call updateProjectionMatrix on camera change
    this.threeCamera.updateProjectionMatrix();
  }
}
