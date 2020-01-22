import * as THREE from 'three';

export const createMaterial = ({
  bumpMap,
  color,
  customMaterial,
  emissive = 0x000000,
  envMap,
  flatShading = false,
  lightMap,
  map,
  metalness,
  name,
  normalMap,
  opacity = 1,
  roughness,
  shininess = 30,
  side,
  specular,// = 0x000000,
  transparent,
  type,
  wireframe = false,
  vertexShader,
  fragmentShader,
}, assets) => {
  let material;
  if (customMaterial) {
    material = customMaterial({ 
      map: assets[map.name],
      normalMap: assets[normalMap.name],
      shininess: 5,
    });
    material.uniforms.map.value.repeat.set(...map.repeat);
    material.uniforms.map.value.wrapS = THREE.RepeatWrapping;
    material.uniforms.map.value.wrapT = THREE.RepeatWrapping;
    material.uniforms.normalMap.value.wrapS = THREE.RepeatWrapping;
    material.uniforms.normalMap.value.wrapT = THREE.RepeatWrapping;
    material.name = name;

    // ({
    //   color,
    //   emissive,
    //   flatShading,
    //   name,
    //   shininess,
    //   side: THREE[side],
    //   specular,
    //   transparent,
    //   wireframe,
    //   vertexShader,
    //   fragmentShader,
    // });
    material.needsUpdate = true;
    material.uniformsNeedUpdate = true;
    return material;
  }
  material = new THREE[type]({
    color,
    flatShading,
    name,
    side: THREE[side],
    wireframe,
    opacity,
  });

  material.shininess = material.shininess !== undefined ? shininess : material.shininess;
  material.emissive = material.emissive !== undefined ? new THREE.Color(emissive) : new THREE.Color(material.emissive);
  material.specular = material.specular !== undefined ? new THREE.Color(specular) : new THREE.Color(material.specular);
  material.transparent = material.transparent !== undefined ? transparent : false;
  material.roughness = material.roughness !== undefined ? roughness : material.roughness;
  material.metalness = material.metalness !== undefined ? metalness : material.metalness;

  if (map) {
    material.map = assets[map.name];
    material.map.wrapT = THREE[map.wrapping] || THREE.RepeatWrapping;
    material.map.wrapS = THREE[map.wrapping] || THREE.RepeatWrapping;
    material.map.preMultiplyAlpha = true;
    if (map.repeat) material.map.repeat.set(...map.repeat);
    if (map.offset) material.map.repeat.set(...map.offset);
  }
  if (normalMap) {
    material.normalMap = assets[normalMap.name];
    material.normalMap.wrapT = THREE[normalMap.wrapping] || THREE.RepeatWrapping;
    material.normalMap.wrapS = THREE[normalMap.wrapping] || THREE.RepeatWrapping;
    if (normalMap.repeat) material.normalMap.repeat.set(...normalMap.repeat);
    if (normalMap.offset) material.normalMap.repeat.set(...normalMap.offset);
    if (normalMap.normalScale && material.normalScale) material.normalScale.set(...normalMap.normalScale);
  }
  if (bumpMap) {
    material.bumpMap = assets[bumpMap.name];
    material.bumpMap.wrapT = THREE[bumpMap.wrapping] || THREE.RepeatWrapping;
    material.bumpMap.wrapS = THREE[bumpMap.wrapping] || THREE.RepeatWrapping;
    if (bumpMap.repeat) material.normalMap.repeat.set(...bumpMap.repeat);
    if (bumpMap.offset) material.normalMap.repeat.set(...bumpMap.offset);
    if (bumpMap.bumpScale) material.bumpScale = bumpMap.bumpScale;

   // if (normalMap.normalScale) material.normalScale.set(...bumpMap.normalScale);
  }
  if (lightMap) {
    material.lightMap = assets[lightMap.name];
    material.lightMap.wrapT = THREE[lightMap.wrapping] || THREE.RepeatWrapping;
    material.lightMap.wrapS = THREE[lightMap.wrapping] || THREE.RepeatWrapping;
    if (lightMap.repeat) material.lightMap.repeat.set(...lightMap.repeat);
    if (lightMap.offset) material.lightMap.offset.set(...lightMap.offset);
    material.lightMapIntensity = 1 || lightMap.intensity;
    //if (lightMap.bumpScale) material.bumpScale = bumpMap.bumpScale;

   // if (normalMap.normalScale) material.normalScale.set(...bumpMap.normalScale);
  }
  if (envMap) {
    material.envMap = assets[envMap.name];
  }

  return material;
};
