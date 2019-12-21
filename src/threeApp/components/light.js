import * as THREE from 'three';

// Sets up and places all lights in scene
export default class Light {
  constructor(params, scene) {
    this.scene = scene;
    this.params = params;

    return this.createLight();
  }

  createLight() {
    console.log({ P: this.params })
    this.light = new THREE[this.params.type]({...this.params});
    console.log({ aaa: this.light })
    
    if (this.params.position) {
      this.light.position.set(...this.params.position);
    }
    this.light.visible = this.params.visible;

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
      const shadow = this.params.shadow;
      this.light.castShadow = this.params.castShadow;
      this.light.shadow.bias = shadow.bias;
      this.light.shadow.mapSize = new THREE.Vector2(shadow.mapWidth, shadow.mapHeight);
      this.light.shadow.camera.near = shadow.camera.near
      this.light.shadow.camera.far = shadow.camera.far
      this.light.shadow.camera.top = shadow.camera.top
      this.light.shadow.camera.bottom = shadow.camera.bottom
      this.light.shadow.camera.right = shadow.camera.right
      this.light.shadow.camera.left = shadow.camera.left

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
    console.log({t: this.light.shadow.camera})
    this.helper = new THREE.CameraHelper(this.light.shadow.camera);
    this.scene.add(this.helper);
  }
}

//   init() {
//     // Ambient
//     this.ambientLight = new THREE.AmbientLight(Config.ambientLight.color);
//     this.ambientLight.visible = Config.ambientLight.enabled;

//     // Point light
//     this.pointLight = new THREE.PointLight(Config.pointLight.color, Config.pointLight.intensity, Config.pointLight.distance);
//     this.pointLight.position.set(Config.pointLight.x, Config.pointLight.y, Config.pointLight.z);
//     this.pointLight.visible = Config.pointLight.enabled;

//     // Directional light
//     this.directionalLight = new THREE.DirectionalLight(Config.directionalLight.color, Config.directionalLight.intensity);
//     this.directionalLight.position.set(Config.directionalLight.x, Config.directionalLight.y, Config.directionalLight.z);
//     this.directionalLight.visible = Config.directionalLight.enabled;

//     // Shadow map
//     this.directionalLight.castShadow = Config.shadow.enabled;
//     this.directionalLight.shadow.bias = Config.shadow.bias;
//     this.directionalLight.shadow.camera.near = Config.shadow.near;
//     this.directionalLight.shadow.camera.far = Config.shadow.far;
//     this.directionalLight.shadow.camera.left = Config.shadow.left;
//     this.directionalLight.shadow.camera.right = Config.shadow.right;
//     this.directionalLight.shadow.camera.top = Config.shadow.top;
//     this.directionalLight.shadow.camera.bottom = Config.shadow.bottom;
//     this.directionalLight.shadow.mapSize.width = Config.shadow.mapWidth;
//     this.directionalLight.shadow.mapSize.height = Config.shadow.mapHeight;

//     // Shadow camera helper
//     this.directionalLightHelper = new THREE.CameraHelper(this.directionalLight.shadow.camera);
//     this.directionalLightHelper.visible = Config.shadow.helperEnabled;

//     // Hemisphere light
//     this.hemiLight = new THREE.HemisphereLight(Config.hemiLight.color, Config.hemiLight.groundColor, Config.hemiLight.intensity);
//     this.hemiLight.position.set(Config.hemiLight.x, Config.hemiLight.y, Config.hemiLight.z);
//     this.hemiLight.visible = Config.hemiLight.enabled;
//   }

//   place(lightName) {
//     switch(lightName) {
//       case 'ambient':
//         this.scene.add(this.ambientLight);
//         break;

//       case 'directional':
//         this.scene.add(this.directionalLight);
//         this.scene.add(this.directionalLightHelper);
//         break;

//       case 'point':
//         this.scene.add(this.pointLight);
//         break;

//       case 'hemi':
//         this.scene.add(this.hemiLight);
//         break;
//       default:
//         break;
//     }
//   }
// }
