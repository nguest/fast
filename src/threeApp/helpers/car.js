export const decorateCar = (car, brakelights, envCube) => {
  let brakeLights;
  car.traverse((child) => {
    if (child.isMesh) {
      if (child.name === 'ty_rims_0') {
        //child.position.set(0, 4, 0);
        //rim = child;
      }
      if (child.name === 'gum001_carpaint_0') { // body
        // child.material.color = new THREE.Color(0x0000ff);
        //child.material.emissive = new THREE.Color(0x550000);
        child.material.reflectivity = 1;
        child.material.envMap = envCube;
        //child.material.roughness = 0;//.48608993902439024

        child.material.clearcoat = 1.0,
        child.material.clearcoatRoughness = 0.1;
        child.material.roughness = 0.5;
        child.material.metalness = 0.9;
        child.material.specular = 0xffffff;
      }
      if (child.name === 'gum012_glass_0') {
        child.material.envMap = envCube;
      }
      if (child.name === 'gum_details_glossy_0') {
        brakeLights = child;
      }
    }
  });
  car.position.set(0, -0.5, 0);
  return { car, brakeLights };
}