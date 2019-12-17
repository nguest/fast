import * as THREE from 'three';
import { promisifyLoader } from './helpers';

export default class Snow {
  constructor(scene) {
    //let sprite1 = new THREE.ImageLoader().load( './assets/textures/rock-diffuse.jpg' );
    //let sprite = sprite1;

    this.geometry = new THREE.Geometry();
    const materials = [];
    let particles;

    console.log(this.geometry)

    const TexturePromiseLoader = promisifyLoader(new THREE.TextureLoader());

    const sprite = TexturePromiseLoader.load( './assets/textures/rock-diffuse.jpg' );

    Promise.all([sprite]).then(([sprite]) => {

      let sprite1 = sprite;

    for ( let i = 0; i < 10000; i ++ ) {
      var vertex = new THREE.Vector3();
      vertex.x = Math.random() * 200 - 100;
      vertex.y = Math.random() * 200 - 100;
      vertex.z = Math.random() * 200 - 100;
      this.geometry.vertices.push( vertex );
    }
    const parameters = [
      [ [1.0, 0.2, 0.5], sprite1, 1 ],
      [ [0.95, 0.1, 0.5], sprite1, 0.5 ],
      [ [0.90, 0.05, 0.5], sprite1, 0.3 ],
    ];
    for ( let i = 0; i < parameters.length; i ++ ) {
     // const color  = parameters[i][0];
      const sprite = parameters[i][1];
      const size   = parameters[i][2];
      materials[i] = new THREE.PointsMaterial( { 
        size: size, 
        map: sprite, 
        blending: THREE.AdditiveBlending, 
        depthTest: false, 
        transparent : true
      });
      //materials[i].color.setHSL( color[0], color[1], color[2] );
      particles = new THREE.Points( this.geometry, materials[i] );
      particles.rotation.x = Math.random() * 6;
      particles.rotation.y = Math.random() * 6;
      particles.rotation.z = Math.random() * 6;
      scene.add(particles);
    }

    this.geometry.verticesNeedUpdate = true;
    console.log('aaa', this.geometry)

    const boxHelper =  new THREE.BoxHelper(particles, 0x0000ff);
    scene.add(boxHelper);

    return particles;
    //particleSystem.position.y = - height/2;
  })
   //e return this.particleSystem;

    //clock = new THREE.Clock();

  }

  update(delta) {
    this.geometry.verticesNeedUpdate = true; // gets auto-reset to false each frame;
    return this.geometry.vertices.forEach((v,i) => {
      v.y -= delta * 10;
    })
  }

  getVertices() {
    return this.geometry.vertices;
  }
}