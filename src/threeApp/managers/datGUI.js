import * as dat from 'dat.gui';

import { Config } from '../sceneConfig/general';

// Manages all dat.GUI interactions
export class DatGUI {
  constructor(main) {
    const gui = new dat.GUI();

    this.camera = main.camera.threeCamera;
    this.controls = main.controls;
    this.light = main.light;
    this.meshes = main.scene.children.filter((child) => child.constructor.name === 'Mesh');

    /* Global */
    gui.close();

    gui.useLocalStorage = true;
    gui.remember(Config);

    /* Camera */
    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.open();
    cameraFolder.add(Config, 'useFollowCam').name('Follow Cam').onChange((value) => {
      Config.useFollowCam = value;
    });
    const cameraFOVGui = cameraFolder.add(Config.camera, 'fov', 0, 180).name('Camera FOV');
    cameraFOVGui.onChange((value) => {
      this.controls.enableRotate = false;
      this.camera.fov = value;
    });
    cameraFOVGui.onFinishChange(() => {
      this.camera.updateProjectionMatrix();
      this.controls.enableRotate = true;
    });
    const cameraAspectGui = cameraFolder.add(Config.camera, 'aspect', 0, 4).name('Camera Aspect');
    cameraAspectGui.onChange((value) => {
      this.controls.enableRotate = false;
      this.camera.aspect = value;
    });
    cameraAspectGui.onFinishChange(() => {
      this.camera.updateProjectionMatrix();

      this.controls.enableRotate = true;
    });
    const cameraFogColorGui = cameraFolder.addColor(Config.fog, 'color').name('Fog Color');
    cameraFogColorGui.onChange((value) => {
      main.scene.fog.color.setHex(value);
    });
    const cameraFogNearGui = cameraFolder.add(Config.fog, 'near', 0.000, 0.010).name('Fog Near');
    cameraFogNearGui.onChange((value) => {
      this.controls.enableRotate = false;
      main.scene.fog.density = value;
    });
    cameraFogNearGui.onFinishChange(() => {
      this.controls.enableRotate = true;
    });

    /* Controls */
    const controlsFolder = gui.addFolder('Controls');
    controlsFolder.add(Config.controls, 'autoRotate').name('Auto Rotate').onChange((value) => {
      this.controls.autoRotate = value;
    });
    const controlsAutoRotateSpeedGui = controlsFolder
      .add(Config.controls, 'autoRotateSpeed', -1, 1).name('Rotation Speed');
    controlsAutoRotateSpeedGui.onChange((value) => {
      this.controls.enableRotate = false;
      this.controls.autoRotateSpeed = value;
    });
    controlsAutoRotateSpeedGui.onFinishChange(() => {
      this.controls.enableRotate = true;
    });

    /* Lights */
    const lightFolder = gui.addFolder('Lights');
    this.light.forEach((light) => {
      lightFolder.add(light, 'intensity').name(light.name).onChange((value) => {
        light.intensity = value;
      });
    });

    /* Meshes */
    const meshFolder = gui.addFolder('Meshes');
    this.meshes.forEach((mesh) => {
      meshFolder.add(mesh, 'visible').name(mesh.name || 'No name').onChange((value) => {
        mesh.visible = value;
      });
    });
  }
}
