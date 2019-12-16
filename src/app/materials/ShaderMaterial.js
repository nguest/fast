import * as THREE from 'three';
import Config from '../config';

export default class ShaderMaterial {
  constructor({ maps, shaders }) {
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.ShaderLib.phong.uniforms,

        { diffuse: { value: new THREE.Color(0xffffff) } },
        //{ emissive: { value: new THREE.Color(0xff5500) } },
        { shininess: { value: 50 } },
        { bumpMap: { value: null }},
        { bumpScale: { value: 10 }},
        { normalMap: { value: null }},
        { normalScale: { value: new THREE.Vector3( 2, 2 ) }},
        { snowNormalMap: { value: null }},
        { snowNormalScale: { value: new THREE.Vector3( 0.25, 0.25 ) }},
        { aoMap: { value: null }},
        { map: { value: null } },
        { uvTransform: { value: null } },
      ]),
      vertexShader: shaders.vertexShader,//THREE.ShaderLib['lambert'].vertexShader,
      fragmentShader: shaders.fragmentShader,//THREE.ShaderLib['lambert'].fragmentShader,//,//new THREE.FileLoader().load('./assets/meshphong_frag.glsl'),//THREE.ShaderLib['phong'].fragmentShader,
      side: THREE.DoubleSide,
      lights: true,
      defines: { 
        USE_MAP: true, 
        USE_BUMPMAP: true, 
        USE_NORMALMAP: true,
        USE_AOMAP: true,
      },
      extensions: {
        derivatives: true,
      },
    });

    const repeat = 1;

    shaderMaterial.uniforms['map'].value = maps.diffuseMap;
    shaderMaterial.uniforms['bumpMap'].value = maps.bumpMap ;
    shaderMaterial.uniforms['normalMap'].value = maps.normalMap ;
    shaderMaterial.uniforms['aoMap'].value = maps.bumpMap;
    shaderMaterial.uniforms['snowNormalMap'].value = maps.snowNormalMap ;
    shaderMaterial.uniforms['uvTransform'].value = new THREE.Matrix3().set(repeat, 0, 0, 0, repeat, 0, 0, 0, repeat); 
    shaderMaterial.needsUpdate = true;

    Config.isLoaded = true;
    return shaderMaterial;
  }
}
