import Keyboard from '../components/Keyboard';
import { throttle } from '../helpers/helpers';
import Config from '../sceneConfig/general';

// Manages all input interactions
export default class Interaction {
  constructor(renderer, scene, camera, controls) {
    // Properties
    this.renderer = renderer.threeRenderer;
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;

    this.timeout = null;

    // Instantiate keyboard helper
    this.keyboard = new Keyboard();
    console.log({ key: this.keyboard, r:this.renderer })
    this.keyboard.update();
    this.keyboard.debug();


    // Listeners
    // Mouse events
    this.renderer.domElement.addEventListener('mousemove', (event) => throttle(this.onMouseMove(event), 250), false);
    this.renderer.domElement.addEventListener('mouseleave', (event) => this.onMouseLeave(event), false);
    this.renderer.domElement.addEventListener('mouseover', (event) => this.onMouseOver(event), false);

    // Keyboard events
    this.renderer.domElement.addEventListener('keydown', (event) => {
      // Only once
      if(event.repeat) {
        return;
      }


      if(this.keyboard.eventMatches(event, 'escape')) {
        console.log('Escape pressed');
      }

      if(this.keyboard.eventMatches(event, 'space')) {
        console.log('Space pressed');
      }
    });
  }

  onMouseOver(event) {
    event.preventDefault();

    Config.isMouseOver = true;
  }

  onMouseLeave(event) {
    event.preventDefault();

    Config.isMouseOver = false;
  }

  onMouseMove(event) {
    event.preventDefault();

    clearTimeout(this.timeout);

    this.timeout = setTimeout(function() {
      Config.isMouseMoving = false;
    }, 200);

    Config.isMouseMoving = true;
  }
}
