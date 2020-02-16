import * as THREE from 'three';
import { trackParams } from './trackParams';
import { extend, patchShader } from '../../materials/extend';

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

const x = new THREE.ShaderMaterial();
x.extend = extend;

export const GrassMaterial1 = (params) => x.extend(THREE.MeshPhongMaterial, {

  // Will be prepended to vertex and fragment code
  header: 'varying vec3 vEye;',

  defines: { USE_UV: 'true' },
  // Insert code lines by hinting at a existing
  vertex: {
    // Inserts the line after #include <fog_vertex>
    //'#define USE_MAP true;': '#define USE_UV true;',
    //'#include <fog_vertex>': 'vEye = normalize(cameraPosition - w.xyz);',

    // Replaces a line (@ prefix) inside of the project_vertex include

    project_vertex: {
        '@mvPosition = modelViewMatrix * mvPosition;':
        `if (mvPosition.x < 0) discard;
        mvPosition = modelViewMatrix * mvPosition;;
        `
    }
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
const loader = new THREE.TextureLoader();


export const GrassMaterial = new THREE.MeshLambertMaterial({
  onBeforeCompile: (shader) => {
    // Use string.replace or this helper https://github.com/Fyrestar/ShaderMaterialExtend

    patchShader(shader, {
      header: `
      uniform sampler2D tDecal;
      uniform vec4 uDecal;
      uniform vec4 uDecal2;
      uniform float clipDistance;`,

      vertex: {
        // Inserts the line after #include <fog_vertex>
        // '#define USE_MAP true;': '#define USE_UV true;',
        // '#include <fog_vertex>': 'vEye = normalize(cameraPosition - w.xyz);',
        // Replaces a line (@ prefix) inside of the project_vertex include
        project_vertex: {
          '@gl_Position = projectionMatrix * mvPosition;':
          `
          gl_Position = projectionMatrix * mvPosition;
          if (gl_Position.z > clipDistance) gl_Position.w = 0.0/0.0;
          `,
        },
      },

//       fragment: {
//         //'#include <fog_fragment>':
//         '#include <emissivemap_fragment>':

        
//         `

//         vec2 offset = 1.0 * uDecal.xy + vUv / uDecal.zw;
//         vec2 offset2 = 1.0 * uDecal2.xy + vUv / uDecal2.zw;
//         vec4 c = texture2D(tDecal, offset);
//         vec4 c2 = texture2D(tDecal, offset2);


//         c = mapTexelToLinear( c );
//         c2 = mapTexelToLinear( c2 );
//         vec4 decalColor = c + c2;
//         //if (decalColor.a < 0.9) discard;
//         //diffuseColor *= mix(diffuseColor, c, c.a);
//         //diffuseColor *= mix(diffuseColor, decalColor, 0.5);
//         diffuseColor = decalColor + diffuseColor;

//         //gl_FragColor = mix(gl_FragColor, c, c.a);

// `
//    },

      uniforms: {
        uDecal: new THREE.Vector4(0, 0, 0.2, 0.8), //(p.u, pv, scale (0.5 is fill uv))
        uDecal2: new THREE.Vector4(-0.5, -0.5, 0.2, 0.2),
        tDecal: loader.load('https://threejs.org/examples/textures/sprite0.png'),
        clipDistance: 50.0,
        // tDecal: loader.load('./assets/textures/UV_Grid_Sm.png')
      },
      
    });
  },
});

export class GrassMaterial2 extends THREE.MeshStandardMaterial {
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
