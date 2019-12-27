
/**
 * @author Lee Stemkoski updated by N Guest
 *
 * Usage:
 * (1) create a global variable:
 *      var keyboard = new KeyboardState();
 * (2) during main loop:
 *       keyboard.update();
 * (3) check state of keys:
 *       keyboard.down("A")    -- true for one update cycle after key is pressed
 *       keyboard.pressed("A") -- true as long as key is being pressed
 *       keyboard.up("A")      -- true for one update cycle after key is released
 *
 */

const k = () => ({
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'insert',
  46: 'delete',
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  219: '[',
  220: '\\',
  221: ']',
  222: "'",
});

const keyName = (keyCode) => (
  (k[keyCode] != null)
    ? k[keyCode]
    : String.fromCharCode(keyCode)
);

// initialization
export class Keyboard {
  constructor() {
    // bind keyEvents
    document.addEventListener('keydown', this.onKeyDown, false);
    document.addEventListener('keyup', this.onKeyUp, false);

    this.status = {};
  }

  onKeyUp = (event) => {
    const key = keyName(event.keyCode);
    if (this.status[key]) {
      this.status[key].pressed = false;
    }
  }

  onKeyDown = (event) => {
    const key = keyName(event.keyCode);
    if (!this.status[key]) {
      this.status[key] = { down: false, pressed: false, up: false, updatedPreviously: false };
    }
  }

  update() {
    Object.keys(this.status).forEach((key) => {
      // ensure that every keypress has "down" status exactly once
      if (!this.status[key].updatedPreviously) {
        this.status[key].down = true;
        this.status[key].pressed = true;
        this.status[key].updatedPreviously = true;
      } else {
        // updated previously
        this.status[key].down = false;
      }

      // key has been flagged as "up" since last update
      if (this.status[key].up) {
        delete this.status[key];
        // move on to next key
      }
      // key released
      if (this.status[key] && !this.status[key].pressed) {
        this.status[key].up = true;
      }
    });
  }

  down(kName) {
    return (this.status[kName] && this.status[kName].down);
  }

  pressed(kName) {
    return (this.status[kName] && this.status[kName].pressed);
  }

  up(kName) {
    return (this.status[kName] && this.status[kName].up);
  }

  debug() {
    const list = Object.keys(this.status).reduce((str, arg) => (`${str} ${arg}`), 'Keys active: ');
    console.log(list);
  }
}
