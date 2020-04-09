import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Config } from '../sceneConfig/general';

// Controls based on orbit controls
export class Controls {
  constructor(camera, container) {
    // Orbit controls first needs to pass in THREE to constructor
    const orbitControls = new OrbitControls(camera, container.container);
    this.threeControls = orbitControls;

    this.init();
    return orbitControls;
  }

  init() {
    this.threeControls.target.set(...Config.controls.target);
    this.threeControls.autoRotate = Config.controls.autoRotate;
    this.threeControls.autoRotateSpeed = Config.controls.autoRotateSpeed;
    this.threeControls.rotateSpeed = Config.controls.rotateSpeed;
    this.threeControls.zoomSpeed = Config.controls.zoomSpeed;
    this.threeControls.minDistance = Config.controls.minDistance;
    this.threeControls.maxDistance = Config.controls.maxDistance;
    this.threeControls.minPolarAngle = Config.controls.minPolarAngle;
    this.threeControls.maxPolarAngle = Config.controls.maxPolarAngle;
    this.threeControls.enableDamping = Config.controls.enableDamping;
    this.threeControls.enableZoom = Config.controls.enableZoom;
    this.threeControls.dampingFactor = Config.controls.dampingFactor;
  }
}
