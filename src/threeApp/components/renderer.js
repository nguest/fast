import * as THREE from 'three';

import { Config } from '../sceneConfig/general';

// Main webGL renderer class
export class Renderer {
  constructor(scene, container) {
    // Properties
    this.scene = scene;
    this.container = container;

    // Create WebGL renderer and set its antialias
    this.threeRenderer = new THREE.WebGLRenderer(Config.renderer);

    // WEBGL2?
    // const canvas = document.createElement( 'canvas' );
    // const context = canvas.getContext( 'webgl2', { alpha: false } );
    // this.threeRenderer = new THREE.WebGLRenderer({ canvas, context });

    // Set clear color to fog to enable fog or to hex color for no fog
    this.threeRenderer.setClearColor(scene.fog.color);

    this.threeRenderer.setPixelRatio(Config.dpr);//  window.devicePixelRatio);

    if (Config.gammaFactor) {
      this.threeRenderer.outputEncoding = THREE.GammaEncoding;
      this.threeRenderer.gammaFactor = Config.gammaFactor;
    }

    // Appends canvas
    container.appendChild(this.threeRenderer.domElement);

    // Shadow map options
    this.threeRenderer.shadowMap.enabled = true;
    this.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Get anisotropy for textures
    Config.maxAnisotropy = this.threeRenderer.capabilities.getMaxAnisotropy();

    // Enable clipping planes
    this.threeRenderer.localClippingEnabled = true;

    // Initial size update set to canvas container
    this.updateSize();

    // Listeners
    document.addEventListener('DOMContentLoaded', () => this.updateSize(), false);
    window.addEventListener('resize', () => this.updateSize(), false);
  }

  updateSize() {
    //this.threeRenderer.setSize(Config.container.width, Config.container.height);
  }

  render(scene, camera) {
    // Renders scene to canvas target
    this.threeRenderer.render(scene, camera);
  }
}

