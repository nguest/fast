import * as THREE from 'three';

export const decorateCar = (car, brakelights, envCube) => {
  let brakeLights;
  car.traverse((child) => {
    if (child.isMesh) {
      //console.log(child.name)
      if (child.name === 'ty_rims_0') {
        //child.position.set(0, 4, 0);
        //rim = child;
      }
      if (child.name === 'gum001_carpaint_0') { // body
        //child.material.color = new THREE.Color(0x0000ff);
        //child.material.emissive = new THREE.Color(0x550000);
        child.material.reflectivity = 1;
        child.material.envMap = envCube;
        //child.material.roughness = 0;//.48608993902439024
        child.material.clearcoat = 1.0,
        child.material.clearcoatRoughness = 0.2;
        child.material.roughness = 0.5;
        child.material.metalness = 0.7;
        child.material.specular = 0xffffff;
        child.castShadow = true;
        child.receiveShadow = true;
      }
      if (child.name === 'gum012_glass_0') { // glass
        child.material = new THREE.MeshPhongMaterial({
          color: 0x666666,
          //specular: 0xffffff,
          reflectivity: 1,
          envMap: envCube,
        });
      }
      if (child.name === 'gum_details_glossy_0') { // brakelights
        child.material.emissive = new THREE.Color(0x550000);
        brakeLights = child;
      }
      if (child.name === 'gum005_details_glossy_ncl1_1_0') {
        child.material = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          specular: 0xffffff,
          reflectivity: 1,
        });
      }
    }
  });

  const shadowPlane = new THREE.PlaneBufferGeometry(200, 500);
  shadowPlane.translate(0, -15, 5);
  const material = new THREE.MeshLambertMaterial({ 
    color: 0x000000,
    transparent: true,
    opacity: 0.7,
    map: new THREE.TextureLoader().load(('./assets/textures/carShadow_map.png'))
  });
  const mesh = new THREE.Mesh(shadowPlane, material);
  car.add(mesh);

  car.position.set(0, -0.5, 0);
  return { car, brakeLights };
};
