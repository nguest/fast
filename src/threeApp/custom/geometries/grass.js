import * as THREE from 'three';
import { trackParams } from './trackParams';
import { extend } from '../../materials/extend';

const grassCrossSection1 = new THREE.Shape();
grassCrossSection1.moveTo(0.1, -trackParams.trackHalfWidth + 0.3);
grassCrossSection1.lineTo(-1, -20);
//grassCrossSection1.lineTo(-4, -100);


const grassCrossSection2 = new THREE.Shape();
//grassCrossSection2.moveTo(-4, 100);
grassCrossSection2.moveTo(-1, 20);
grassCrossSection2.lineTo(0.1, trackParams.trackHalfWidth - 0.3);

export const grassCrossSection = [grassCrossSection1, grassCrossSection2];

const treesCrossSection1 = new THREE.Shape();
treesCrossSection1.moveTo(0.1, -trackParams.trackHalfWidth - 10);
treesCrossSection1.lineTo(-8, -trackParams.trackHalfWidth - 10);

const treesCrossSection2 = new THREE.Shape();
treesCrossSection2.moveTo(-0.1, trackParams.trackHalfWidth + 10);
treesCrossSection2.lineTo(-8, trackParams.trackHalfWidth + 10);

export const treesCrossSection = [treesCrossSection1, treesCrossSection2];

const x = new THREE.ShaderMaterial()
x.extend = extend;
console.log({ t: THREE.ShaderMaterial })

export const GrassMaterial = (params) => x.extend(THREE.MeshPhongMaterial, {

  // Will be prepended to vertex and fragment code
  header: 'varying vec3 vEye;',

  defines: { USE_UV: 'true' },
  // Insert code lines by hinting at a existing
  vertex: {
      // Inserts the line after #include <fog_vertex>
      //'#define USE_MAP true;': '#define USE_UV true;',
      //'#include <fog_vertex>': 'vEye = normalize(cameraPosition - w.xyz);',

      // Replaces a line (@ prefix) inside of the project_vertex include

      // 'project_vertex': {
      //     '@vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );': 'vec4 mvPosition = modelViewMatrix * vec4( transformed * 0.5, 1.0 );'
      // }
  },
  // fragment: {
  //     '#include <envmap_fragment>': 'diffuseColor.rgb += pow(dot(vNormal, vEye), 3.0);'
  // },


  // Properties to apply to the new THREE.ShaderMaterial
  material: {
    //skinning: true,
    //color: new THREE.Color(0xff0000),
    //map: params.map,
  },


  // Uniforms (will be applied to existing or added)
  uniforms: {
    ...params
    //diffuse: new THREE.Color(0xff0000),
  }

});


console.log({ GrassMaterial })

export class GrassMaterial1 extends THREE.MeshStandardMaterial {
  //name = 'GrassMaterial';

  onBeforeCompile = (shader) => {
    //this.insertAttributesAndFunctions(shader);
    //this.overrideLogic(shader);
  }

  insertAttributesAndFunctions = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        'void main() {',
        `
        // attribute vec3 instancePosition;
        // attribute vec4 instanceQuaternion;
        // attribute vec3 instanceScale;
        
        // vec3 getInstancePosition(vec3 position) {
        //   position *= instanceScale;
        //   vec3 vcV = cross( instanceQuaternion.xyz, position );
        //   position = vcV * ( 2.0 * instanceQuaternion.w ) + ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + position );
        //   position += instancePosition;

        //   return position;
        // }
        
        void main() {
      `,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
        `if ( diffuseColor.a < 0.95 ) discard;
        gl_FragColor = vec4( outgoingLight * diffuseColor.a, diffuseColor.a );`,
      );
  }

  overrideLogic = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <project_vertex>', OVERRIDE_PROJECT_VERTEX);
  };
}

const OVERRIDE_PROJECT_VERTEX = `
  //vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;
`;
