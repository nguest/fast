import Ammo from 'ammonext';
import TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';

import Config from '../sceneConfig/general';

// e.g. physics.applyCentralImpulse(v)
// applyImpulse
// applyTorque
// applyCentralForce
// applyForce
// setAngularVelocity
// setLinearVelocity
// setLinearFactor
// setDamping

export default class Forces {
  constructor(scene, physicsWorld, name) {
    const mover = physicsWorld.bodies.find((o) => o.name === name);
    this.scene = scene;
    this.mover = mover;
    this.physicsMover = mover.userData.physicsBody;
    this.initialize();
  }

  initialize() {
    /* Init */
    //this.mover.setInitialState();

    // for dev so we can see the target
    this.targetObject = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.2, 1, 8),
    );
    if (Config.isDev) this.scene.add(this.targetObject);

    // initialize camera
    // this.camera.position.set(0, 10, 22 );
    // this.camera.native.lookAt(0,-20,-60);
    // if (isDev) {
    //   const helper = new THREE.CameraHelper( this.camera.native );
    //   this.scene.add( helper );
    // }

    // initialize yawObject
    this.yawObject = new THREE.Object3D();
    this.yawObject.position.set(this.mover.position);
    //this.yawObject.add(this.camera.native);
    this.scene.add(this.yawObject);

      console.log({p:this.physicsMover  })
    //let vN = this.physicsMover.getLinearVelocity();//.clone();
    // vN.normalize();
    // console.log({ vN })
    let origin = this.mover.position;

    // this.arrowHelper = new THREE.ArrowHelper( vN, origin, length, hex );
    // this.scene.add( this.arrowHelper );
    this.quat = new THREE.Quaternion();
    
    //this.createSkis();

    this.tRight = new TWEEN.Tween(this.yawObject.rotation)
      .to({z: -0.5}, 1000)
      .onUpdate(() => {})
      .easing(TWEEN.Easing.Sinusoidal.In);

    this.tLeft = new TWEEN.Tween(this.yawObject.rotation)
      .to({z: 0.5}, 1000)
      .onUpdate(() => {})
      .easing(TWEEN.Easing.Sinusoidal.In);

    this.tReturn = new TWEEN.Tween(this.yawObject.rotation)
      .to({z: 0}, 600)
      .onUpdate(() => {})
      .easing(TWEEN.Easing.Linear.None);

    //this.scene.add(this.yawObject);
    
    // Moves.
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
  }

  applyCentralImpulse(v) {
    this.physicsMover.applyCentralImpulse(v);
  }

  setLinearVelocity(v) {
    this.physicsMover.setLinearVelocity(v);
  }

  updateInteraction(interaction) {
    if (interaction.keyboard.pressed('Q')) {
      this.applyCentralImpulse(new Ammo.btVector3(0, 0, -5));
    }
    if (interaction.keyboard.pressed('C')) {
      this.applyCentralImpulse(new Ammo.btVector3(0, 0, 5));
    }
    if (interaction.keyboard.pressed('Z')) {
      console.log('z pressed')
      this.applyCentralImpulse(new Ammo.btVector3(-5, 0, 0));
    }
    if (interaction.keyboard.pressed('X')) {
      this.applyCentralImpulse(new Ammo.btVector3(5, 0, 0));
    }
  }
}
