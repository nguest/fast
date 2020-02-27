import * as THREE from 'three';

export const decorateCar = (car, brakelights, scene) => {
  let brakeLights = new THREE.Mesh();
  car.traverse((child) => {
    if (child.isMesh) {
      // FIRST CAR
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
    }
  });

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
  const mesh = new THREE.Mesh(shadowPlane, material);
  mesh.name = 'shadowPlane';
  car.add(mesh);
  console.log({ 2: car })

  car.position.set(0, -0.5, 0);
  return { car, brakeLights };
};
