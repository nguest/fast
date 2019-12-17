import * as THREE from 'three';

import Material from '../helpers/material';
import MeshHelper from '../helpers/meshHelper';
import Helpers from '../../utils/helpers';
import Config from '../../config';
import Texture from './texture';
import Model from './model';
import Interaction from '../managers/interaction';


// Loads in a single object from the config file
export default class ModelWithTextures {
  constructor(modelParams) {
    this.modelParams = modelParams;
  }

  load() {
    // Instantiate texture class
    this.texture = new Texture(this.modelParams.textureName);

    // Start loading the textures and then go on to load the model after the texture Promises have resolved
    this.texture.load().then(() => {
        this.manager = new THREE.LoadingManager();

        // Textures loaded, load model
        this.model = new Model(
            this.modelParams.scene, 
            this.modelParams.manager, 
            this.texture.textures, 
            this.modelParams.modelName,
            this.modelParams.position,
            this.modelParams.rotation
        );
        this.model.load();

        // onProgress callback
        this.manager.onProgress = (item, loaded, total) => {
        console.log(`${item}: ${loaded} ${total}`);
        };

        // All loaders done now
        this.manager.onLoad = () => {

        // Set up interaction manager with the app now that the model is finished loading
        new Interaction(this.renderer.threeRenderer, this.scene, this.camera.threeCamera, this.controls.threeControls);

        // Add dat.GUI controls if dev
        // if (Config.isDev) {
        //   new DatGUI(this, this.model.obj);
        // }

        console.log('loaded')

        // Everything is now fully loaded
        //Config.isLoaded = true;
        //this.container.querySelector('#loader').classList.add('loaded');// = 'none';

        };
    });
  }

  
}
