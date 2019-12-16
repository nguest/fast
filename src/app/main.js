// Global imports -
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

// Local imports -

// Components
import Renderer from './components/renderer';
import Camera from './components/camera';
import Light from './components/light';
import Controls from './components/controls';

// Helpers
import { promisifyLoader, klein } from './helpers/helpers';
import Mesh from './helpers/Mesh';

// Materials
import ShaderMaterial from './materials/ShaderMaterial';
import { createMaterial } from './materials/material';

// Managers
// import Interaction from './managers/interaction';
// import DatGUI from './managers/datGUI';

// data
import Config from './config';

// stats
import { createStats, updateStatsStart, updateStatsEnd } from './helpers/stats';
import { assetsIndex } from './assetsIndex';
import { materialsIndex } from './materialsIndex';
// -- End of imports


export default class Main {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    if (window.devicePixelRatio) {
      Config.dpr = window.devicePixelRatio;
    }

    this.renderer = new Renderer(this.scene, container);

    this.camera = new Camera(this.renderer.threeRenderer, container);
    this.controls = new Controls(this.camera.threeCamera, this.renderer, container);
    this.light = new Light(this.scene);

    // Create and place lights in scene
    const lights = ['ambient', 'directional', 'point', 'hemi'];
    lights.forEach(light => (
      this.light.place(light)
    ));

    if(Config.isDev) {
      this.rS = createStats();
    }

    const texturesAndFiles = this.loadAssets();
    this.createMaterials(texturesAndFiles)
  }

  loadAssets() {
    const FilePromiseLoader = promisifyLoader(new THREE.FileLoader());
    const filesPromises = Object.values(assetsIndex.files).map((file) => (
      FilePromiseLoader.load(file.path)
    ))
    //const vertexShader = FilePromiseLoader.load('./materials/meshphong_vert.glsl');
    //const fragmentShader = FilePromiseLoader.load('./app/assets/meshphong_frag.js');

    const TexturePromiseLoader = promisifyLoader(new THREE.TextureLoader());
    const texturesPromises = Object.values(assetsIndex.textures).map((texture) => (
      TexturePromiseLoader.load(texture.path)
    ));
    this.texturesAndFiles = { filesPromises, texturesPromises };

    return this.texturesAndFiles;
  }

  createMaterials(filesAndTextures) {
    const { filesPromises, texturesPromises } = filesAndTextures;
    Promise.all([...filesPromises, ...texturesPromises])
      .then((r) => {
        const assets = r.reduce((agg, asset, idx) => {
          const fileNames = [...Object.keys(assetsIndex.files), ...Object.keys(assetsIndex.textures)]
          return {
            ...agg,
            [fileNames[idx]]: asset,
          };
        }, {});
 
        const materials = materialsIndex.reduce((agg,materialParams) => ({
            ...agg,
            [materialParams.name]: createMaterial(materialParams, assets)
          }), {});

        return this.createWorld(materials);
      })
  }

  createWorld(materials) {

    const sphere = new Mesh({ 
      type: 'SphereBufferGeometry', 
      params: [20,20,10], 
      material: materials.snowShaderMat,
      scene: this.scene,
    });
    
    const box = new Mesh({ 
      type: 'BoxBufferGeometry', 
      params: [40,40,40], 
      position: [-50, 0, -70],
      material: materials.redShiny,
      scene: this.scene,
    });

    const torus = new Mesh({ 
      type: 'TorusKnotBufferGeometry', 
      params: [12, 6, 80, 16 ], 
      position: [50,5,0],
      material: materials.snowShaderMat,
      scene: this.scene,
    });

    const parametric = new Mesh({ 
      type: 'ParametricBufferGeometry', 
      params: [ klein, 25, 25 ],
      geoRotate: [0.4,0,-0.3],
      position: [-50,0,0],
      scale: [3,3,3],
      material: materials.redShiny,
      scene: this.scene,
    });

    // const rock = new Mesh({ 
    //   type: 'JSON',
    //   url: './assets/models/rock.json',
    //   position: [0,0,-50],
    //   scale: [3,3,3],
    //   material: materials.snowShaderMat,
    //   scene: this.scene,
    // });

      const ground = new Mesh({ 
        type: 'PlaneBufferGeometry', 
        params: [ 150, 150, 10, 10 ],
        rotation: [-Math.PI/2, 0, 0],
        position: [0,-20,0],
        shadows: { receive: true, cast: false },
        material: materials.whiteFlat,
        scene: this.scene,
      });

//////////////////---------------------------------

    //this.snow = new Snow(this.scene);

    this.animate();
  }

  animate() {
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    const rS = this.rS;

    if (Config.isDev) updateStatsStart(rS)
    this.renderer.render(this.scene, this.camera.threeCamera);
    if (Config.isDev) updateStatsEnd(rS)
    
    if (this.snow) this.snow.update(delta);

    TWEEN.update();
    this.controls.update();

    // RAF
    requestAnimationFrame(this.animate.bind(this)); // Bind the main class instead of window object
  }

  
}