import * as THREE from 'three';
import { promisifyLoader } from './helpers';

export default class Mesh {
  constructor({ 
    type,
    url, 
    params, 
    position = [0,0,0], 
    rotation = [0,0,0], 
    scale = [1,1,1], 
    geoRotate = [0,0,0],
    shadows = {receive: false, cast: true }, 
    material,
    scene = this.scene,
    add = true,
  }) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.geoRotate = geoRotate;
    this.shadows = shadows;
    this.material = material;
    this.scene = scene;
    this.addObjectToScene = add;
    if (type === 'JSON') {
      this.initLoader(url);
    } else {

      const geometry = new THREE[type](...params);
      console.log({ geometry, type })

      return this.orientObject(geometry);
    }
  }
  
  async initLoader(url) {
    const JSONPromiseLoader = promisifyLoader(new THREE.JSONLoader())
    const geometry = await JSONPromiseLoader.load(url).catch(() => console.log('error loading ' + url))
    return this.orientObject(geometry); 
  }

  orientObject(geometry) {
    if (this.geoRotate) {
      geometry.rotateX(this.geoRotate[0])
      geometry.rotateY(this.geoRotate[1])
      geometry.rotateZ(this.geoRotate[2])
    }
    const mesh = new THREE.Mesh( geometry, this.material );
    mesh.position.set(...this.position);
    mesh.rotation.set(...this.rotation);
    mesh.scale.set(...this.scale);
    mesh.castShadow = this.shadows.cast;
    mesh.receiveShadow = this.shadows.receive;

    if (this.addObjectToScene) {
      this.scene.add(mesh);
    }
  }
}
