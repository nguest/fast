import * as THREE from 'three';
import { getObjByName, getObjectsByType } from './helpers';

export const decorateCar = (car, scene) => {
  // add wheels to base meshes
  const wheel = getObjByName(scene, 'wheel');
  const wheelMeshes = getObjectsByType(scene, 'wheelMesh');
  wheelMeshes.forEach((mesh, i) => {
    if (i === 0) {
      mesh.add(wheel);
    } else {
      mesh.add(wheel.clone());
    }
  });

  // decorate car(s)
  let brakeLights = new THREE.Mesh();
  car.traverse((child) => {
    console.log({ [child.name]: child });
    
    if (child.isMesh) {
      // FIRST CAR
      if (child.name === 'gum001_carpaint_0') { // body
        child.material.reflectivity = 1;
        child.material.envMap = scene.environment;
        child.material.clearcoat = 1.0;
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
          reflectivity: 0.8,
          envMap: scene.environment,
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

      // SECOND CAR
      if (child.material.name === 'CarpaintMat') {
        // child.material = {
        //   ...child.material,
        //   color:  0xffffff,
        // }
      }
      let carbonMat;
      if (child.material.name === 'CarbonMat') {
        carbonMat = child.material;
      }
      if (child.material.name === 'GlassMat') {
        child.material = new THREE.MeshPhongMaterial({ color: 0x444444, envMap: scene.environment, reflectivity: 1.0 });
      }
      if (child.material.name === 'CarbonMat') {
        child.material = new THREE.MeshPhongMaterial({ color: 0x444444, envMap: scene.environment, reflectivity: 0.7 });
      }
      if (child.material.name === 'CarpaintMat') {
        child.receiveShadow = true;
      }
      if (child.name === 'Rearlight_Glass_02') { // brakelights
        child.material.emissive = new THREE.Color(0x550000);
        brakeLights = child;
      }
      if (child.name === 'ShadowMesh') {
        child.castShadow = true;
      }


      if (child.material.name === 'CarbonWithMapMat') {
        //child.material = new THREE.MeshPhongMaterial({ color: 0xff0000, envMap: scene.environment, reflectivity: 0.7 });
        //child.material.color = new THREE.Color(0xff4444);
        ///console.log({ CCCCCCCCC: child.material });
        //console.log({ child });
        child.material.envMap = scene.environment;
        child.material.reflectivity = 0.7;
        //child.material.alphaTest = 0.5
        //child.material.transparent = true;
        //child.material.opacity = 0.6;
        //child.material.depthWrite= false;
        // child.material.depthTest= false
        //child.material.map = new THREE.TextureLoader().load('./assets/objects/porsche911_gt2/Textures/porsche_map.png')
      }
    }
  });

  const shadowPlaneMesh = createShadow();
  car.add(shadowPlaneMesh);

  car.position.set(0, -0.5, 0);
  return { car, brakeLights };
};

// set chassisMesh in position, attach car and decorate;
export const createCar = (scene) => {
  const chassisMesh = getObjByName(scene, 'chassisMesh');
  const baseCar = getObjByName(scene, 'porsche_911gt2');
  const { car, brakeLights } = decorateCar(baseCar, scene);
  chassisMesh.add(car);
  return { chassisMesh, brakeLights };
};

// create false shadow underneath car
const createShadow = () => {
  const shadowPlane = new THREE.PlaneBufferGeometry(200, 470);
  shadowPlane.translate(0, 0, -5);
  const material = new THREE.MeshLambertMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    map: new THREE.TextureLoader().load(('./assets/textures/carShadow_map.png')),
  });
  const shadowPlaneMesh = new THREE.Mesh(shadowPlane, material);
  shadowPlaneMesh.name = 'shadowPlane';
  return shadowPlaneMesh;
};
