import * as THREE from 'three';
import { patchShader } from './extend';
import { Config } from '../sceneConfig/general';

export const createMaterial = ({
  blending = 'NormalBlending',
  bumpMap,
  clipping,
  color,
  customMaterial,
  dithering,
  emissive = 0x000000,
  envMap,
  flatShading = false,
  lightMap,
  map,
  metalness,
  name,
  normalMap,
  opacity = 1,
  polygonOffset,
  polygonOffsetFactor,
  roughness,
  shininess = 30,
  side,
  smartAlpha = false,
  specular,// = 0x000000,
  transparent,
  type,
  useVertexColors = false,
  wireframe = false,
  vertexShader,
  fragmentShader,
}, assets) => {
  let material;
  if (customMaterial) {
    if (typeof customMaterial === 'function') {
      material = customMaterial({
        map: assets[map.name],
        normalMap: assets[normalMap.name],
        shininess: 5,
        color,
      });
      material.uniforms.map.value.repeat.set(...map.repeat);
      material.uniforms.map.value.wrapS = THREE.RepeatWrapping;
      material.uniforms.map.value.wrapT = THREE.RepeatWrapping;
      material.uniforms.normalMap.value.wrapS = THREE.RepeatWrapping;
      material.uniforms.normalMap.value.wrapT = THREE.RepeatWrapping;
      material.name = name;
    } else {
      material = customMaterial;
      material.name = name;

      if (map) {
        material.map = assets[map.name];
        material.map.wrapT = THREE[map.wrapping] || THREE.RepeatWrapping;
        material.map.wrapS = THREE[map.wrapping] || THREE.RepeatWrapping;
        material.minFilter = THREE.NearestMipmapNearestFilter;
        material.map.anisotropy = Config.maxAnisotropy;
        if (map.repeat) material.map.repeat.set(...map.repeat);
        if (map.offset) material.map.repeat.set(...map.offset);
      }
    }

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
    dithering: true,
  });

  material.blending = THREE[blending],

  material.shininess = material.shininess !== undefined ? shininess : material.shininess;
  material.emissive = material.emissive !== undefined ? new THREE.Color(emissive) : new THREE.Color(material.emissive);
  material.specular = material.specular !== undefined ? new THREE.Color(specular) : new THREE.Color(material.specular);
  material.transparent = material.transparent !== undefined ? transparent : false;
  material.roughness = material.roughness !== undefined ? roughness : material.roughness;
  material.metalness = material.metalness !== undefined ? metalness : material.metalness;
  material.polygonOffset = material.polygonOffset !== undefined ? polygonOffset : material.polygonOffset;
  material.polygonOffsetFactor = material.polygonOffsetFactor !== undefined ? polygonOffsetFactor : material.polygonOffsetFactor;

  if (smartAlpha) {
    material.onBeforeCompile = (shader) => {
      patchShader(shader, {
        fragment: {
          'gl_FragColor = vec4( outgoingLight, diffuseColor.a );':
          `if ( diffuseColor.a < 0.95 ) discard; // remove low alpha values
          gl_FragColor = vec4( outgoingLight * diffuseColor.a, diffuseColor.a );`,
        },
      });
    };
  }

  if (clipping) {
    material.onBeforeCompile = (shader) => {
      patchShader(shader, {
        uniforms: {
          clipDistance: Config.clipDistance,//200.0,
        },
        header: 'uniform float clipDistance;',
        vertex: {
          project_vertex: {
            '@gl_Position = projectionMatrix * mvPosition;':
            `
            gl_Position = projectionMatrix * mvPosition;
            if (gl_Position.z > clipDistance) gl_Position.w = 0.0/0.0;
            `,
          },
        },
      });
    };
  }

  /*
  [map, normalMap, bumpMap, lightMap].forEach((texture) => {
    if (texture) {
        material[texture] = assets[texture.name]
        material[texture].wrapT = THREE[texture.wrapping] || THREE.RepeatWrapping;
        material[texture].wrapS = THREE[texture.wrapping] || THREE.RepeatWrapping;
        if (texture.repeat) material[texture].repeat.set(...texture.repeat);
        if (texture.offset) material[texture].offset.set(...texture.offset);
    }
  })

  */
  if (map) {
    material.map = assets[map.name];
    material.map.wrapT = THREE[map.wrapping] || THREE.RepeatWrapping;
    material.map.wrapS = THREE[map.wrapping] || THREE.RepeatWrapping;
    material.map.preMultiplyAlpha = true;
    if (map.repeat) material.map.repeat.set(...map.repeat);
    if (map.offset) material.map.offset.set(...map.offset);
    if (map.rotation) material.map.rotation = map.rotation;
    material.map.anisotropy = Config.maxAnisotropy;
  }
  if (normalMap) {
    material.normalMap = assets[normalMap.name];
    material.normalMap.wrapT = THREE[normalMap.wrapping] || THREE.RepeatWrapping;
    material.normalMap.wrapS = THREE[normalMap.wrapping] || THREE.RepeatWrapping;
    if (normalMap.repeat) material.normalMap.repeat.set(...normalMap.repeat);
    if (normalMap.offset) material.normalMap.offset.set(...normalMap.offset);
    if (normalMap.normalScale && material.normalScale) material.normalScale.set(...normalMap.normalScale);
  }
  if (bumpMap) {
    material.bumpMap = assets[bumpMap.name];
    material.bumpMap.wrapT = THREE[bumpMap.wrapping] || THREE.RepeatWrapping;
    material.bumpMap.wrapS = THREE[bumpMap.wrapping] || THREE.RepeatWrapping;
    if (bumpMap.repeat) material.normalMap.repeat.set(...bumpMap.repeat);
    if (bumpMap.offset) material.normalMap.offset.set(...bumpMap.offset);
    if (bumpMap.bumpScale) material.bumpScale = bumpMap.bumpScale;
    // if (normalMap.normalScale) material.normalScale.set(...bumpMap.normalScale);
  }
  if (lightMap) {
    material.lightMap = assets[lightMap.name];
    material.lightMap.wrapT = THREE[lightMap.wrapping] || THREE.RepeatWrapping;
    material.lightMap.wrapS = THREE[lightMap.wrapping] || THREE.RepeatWrapping;
    if (lightMap.repeat) material.lightMap.repeat.set(...lightMap.repeat);
    if (lightMap.offset) material.lightMap.offset.set(...lightMap.offset);
    material.lightMapIntensity = lightMap.lightMapIntensity || 1;
    // if (lightMap.bumpScale) material.bumpScale = bumpMap.bumpScale;
    // if (normalMap.normalScale) material.normalScale.set(...bumpMap.normalScale);
  }
  if (envMap) {
    material.envMap = assets[envMap.name];
  }
  return material;
};
