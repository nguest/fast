import * as THREE from 'three';

// Sets up and places all lights in scene
export class Light {
  constructor(params, scene) {
    this.scene = scene;
    this.params = params;

    return this.createLight();
  }

  createLight() {
    this.light = new THREE[this.params.type]({ ...this.params });
    if (this.params.position) {
      this.light.position.set(...this.params.position);
    }
    this.light.intensity = this.params.intensity;
    this.light.visible = this.params.visible;
    this.light.name = this.params.type;
    this.light.penumbra = this.params.penumbra;
    this.light.angle = this.params.angle;

    if (this.params.addToScene) {
      this.addLight();
    }

    if (this.params.target) {
      const lightTarget = new THREE.Object3D();
      lightTarget.position.set(...this.params.target);
      this.scene.add(lightTarget);
      this.light.target = lightTarget;
    }

    if (this.params.helperEnabled && this.light.shadow && this.light.shadow.camera) {
      const { shadow } = this.params;
      this.light.castShadow = this.params.castShadow;
      this.light.shadow.bias = shadow.bias;
      this.light.shadow.mapSize = new THREE.Vector2(shadow.mapWidth, shadow.mapHeight);
      this.light.shadow.camera.near = shadow.camera.near;
      this.light.shadow.camera.far = shadow.camera.far;
      this.light.shadow.camera.top = shadow.camera.top;
      this.light.shadow.camera.bottom = shadow.camera.bottom;
      this.light.shadow.camera.right = shadow.camera.right;
      this.light.shadow.camera.left = shadow.camera.left;

      this.addLightHelper();
    }
    return this.light;
  }

  addLight() {
    if (this.params.addToScene) {
      this.scene.add(this.light);
    }
    return this.light;
  }

  addLightHelper() {
    this.helper = new THREE.CameraHelper(this.light.shadow.camera);
    this.scene.add(this.helper);
  }
}
