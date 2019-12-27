import { Keyboard } from './Keyboard';
import { throttle } from '../helpers/helpers';
import { Config } from '../sceneConfig/general';

const onMouseOver = (e) => {
  e.preventDefault();

  Config.isMouseOver = true;
};

const onMouseLeave = (e) => {
  e.preventDefault();

  Config.isMouseOver = false;
};


// Manages all input interactions
export class Interaction {
  constructor(renderer, scene, camera, controls) {
    this.renderer = renderer.threeRenderer;
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;

    this.timeout = null;

    // Instantiate keyboard
    this.keyboard = new Keyboard();

    // Listeners
    // Mouse events
    this.renderer.domElement.addEventListener('mousemove', (e) => throttle(this.onMouseMove(e), 250), false);
    this.renderer.domElement.addEventListener('mouseleave', (e) => onMouseLeave(e), false);
    this.renderer.domElement.addEventListener('mouseover', (e) => onMouseOver(e), false);
  }

  onMouseMove(event) {
    event.preventDefault();

    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      Config.isMouseMoving = false;
    }, 200);

    Config.isMouseMoving = true;
  }
}
