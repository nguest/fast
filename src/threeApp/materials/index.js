import * as THREE from 'three';
import { patchShader } from './extend';
import { Config } from '../sceneConfig/general';

export const createMaterial = ({
  alphaMap,
  blending = 'NormalBlending',
  blendEquation,
  blendSrc,
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
  smartAlphaThreshold,
  specular, // = 0x000000,
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

  material.blending = THREE[blending];
  if (blending === 'CustomBlending') {
    material.blendEquation = THREE[blendEquation];
    material.blendSrc = THREE[blendSrc];
  }
  material.shininess = material.shininess !== undefined ? shininess : material.shininess;
  material.emissive = material.emissive !== undefined ? new THREE.Color(emissive) : new THREE.Color(material.emissive);
  material.specular = material.specular !== undefined ? new THREE.Color(specular) : new THREE.Color(material.specular);
  material.transparent = material.transparent !== undefined ? transparent : false;
  material.roughness = material.roughness !== undefined ? roughness : material.roughness;
  material.metalness = material.metalness !== undefined ? metalness : material.metalness;
  material.polygonOffset = material.polygonOffset !== undefined ? polygonOffset : material.polygonOffset;
  material.polygonOffsetFactor = material.polygonOffsetFactor !== undefined ? polygonOffsetFactor : material.polygonOffsetFactor;

  if (smartAlpha) {
    console.info({ SMARTALPHA: name });
    const threshold = smartAlphaThreshold || 0.2;

    material.onBeforeCompile = (shader) => {
      patchShader(shader, {
        fragment: {
          'gl_FragColor = vec4( outgoingLight, diffuseColor.a );':
          `if ( diffuseColor.a < ${threshold} ) discard; // remove low alpha values
          gl_FragColor = vec4( outgoingLight * diffuseColor.a, diffuseColor.a );`,
        },
      });
    };
  }

  if (clipping) {
    material.onBeforeCompile = (shader) => {
      patchShader(shader, {
        uniforms: {
          clipDistance: Config.clipDistance, // 200.0,
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
  }
  if (lightMap) {
    material.lightMap = assets[lightMap.name];
    material.lightMap.wrapT = THREE[lightMap.wrapping] || THREE.RepeatWrapping;
    material.lightMap.wrapS = THREE[lightMap.wrapping] || THREE.RepeatWrapping;
    if (lightMap.repeat) material.lightMap.repeat.set(...lightMap.repeat);
    if (lightMap.offset) material.lightMap.offset.set(...lightMap.offset);
    material.lightMapIntensity = lightMap.lightMapIntensity || 1;
  }
  if (alphaMap) {
    material.alphaMap = assets[alphaMap.name];
    material.alphaMap.wrapT = THREE[alphaMap.wrapping] || THREE.RepeatWrapping;
    material.alphaMap.wrapS = THREE[alphaMap.wrapping] || THREE.RepeatWrapping;
    if (alphaMap.repeat) material.alphaMap.repeat.set(...alphaMap.repeat);
    if (alphaMap.offset) material.alphaMap.offset.set(...alphaMap.offset);
    if (alphaMap.rotation) material.alphaMap.rotation = alphaMap.rotation;

  }
  if (envMap) {
    material.envMap = assets[envMap.name];
  }

  return material;
};
