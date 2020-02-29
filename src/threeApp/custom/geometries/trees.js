import * as THREE from 'three';
import { getTreeline } from './treeline';
import { trackParams } from './trackParams';
import { createInstancedMesh } from '../../helpers/InstancedBufferGeometry';

const treesCrossSection1 = new THREE.Shape();
treesCrossSection1.moveTo(0.1, -trackParams.trackHalfWidth - 10);
treesCrossSection1.lineTo(-8, -trackParams.trackHalfWidth - 10);

const treesCrossSection2 = new THREE.Shape();
treesCrossSection2.moveTo(-0.1, trackParams.trackHalfWidth + 10);
treesCrossSection2.lineTo(-8, trackParams.trackHalfWidth + 10);

export const treesCrossSection = [treesCrossSection1, treesCrossSection2];

export const createTrees = ({ scene }) => {
  const treeHeight = 12;
  const treePlane = new THREE.PlaneBufferGeometry(7, treeHeight, 1, 1);
  treePlane.translate(0, treeHeight * 0.5, 0);
  treePlane.name = 'treePlane';
  const loader = new THREE.TextureLoader();
  const map = loader.load('./assets/textures/tiledTrees_map.png');
  const normalMap = loader.load('./assets/textures/tree_block_normal2.png');

  const material = new InstancesStandardMaterial({
    map,
    side: THREE.DoubleSide,
    normalMap,
    normalScale: new THREE.Vector2(0.5, 0.5),
    depthFunc: THREE.LessDepth,
    color: 0x888888,
    specular: 0x000000,
  });

  const depthMaterial = new InstancesDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map,
    alphaTest: 0.5,
  });

  const { treeCurveLeft, treeCurveRight } = getTreeline();

  [treeCurveLeft, treeCurveRight].forEach((curve, i) => {
    const instancedMesh = createInstancedMesh({
      geometry: treePlane,
      curve,
      count: Math.floor(trackParams.length / 4),
      offset: new THREE.Vector3(0, 0, 0), // treeHeight * 0.5,
      name: `treesInstance-${i}`,
      material,
      depthMaterial,
    });
    scene.add(instancedMesh);
  });
};


const OVERRIDE_PROJECT_VERTEX = `
  //!! orig // vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  transformed = getBillboardInstancePosition(transformed);
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  if (gl_Position.z > 200.0) gl_Position.w = 0.0/0.0;
`;

export class InstancesStandardMaterial extends THREE.MeshPhongMaterial {
  name = 'InstancesStandardMaterial';

  onBeforeCompile = (shader) => {
    this.insertAttributesAndFunctions(shader);
    this.overrideLogic(shader);
  }

  insertAttributesAndFunctions = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        'void main() {',
        `
        attribute vec3 instanceOffset;
        // attribute vec4 instanceQuaternion;
        attribute vec3 instanceScale;
        attribute vec2 instanceMapUV;

        // rotate to face camera on y-axis for billboarding
        vec3 getBillboardInstancePosition(vec3 position) {
          vec3 look = cameraPosition - instanceOffset;
          look.y = 0.0;
          look = normalize(look);
          vec3 billboardUp = vec3(0, 1, 0);
          vec3 billboardRight = cross(billboardUp, look);
          vec3 pos = instanceOffset + (billboardRight * position.x * instanceScale.x)
            + (billboardUp * position.y * instanceScale.y);
          return pos;
        }
        
        void main() {
      `,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
        `if ( diffuseColor.a < 0.9 ) discard; // remove low alpha values
        gl_FragColor = vec4( outgoingLight * diffuseColor.a, diffuseColor.a );`,
      );
  }

  overrideLogic = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <project_vertex>', OVERRIDE_PROJECT_VERTEX)
      .replace('#include <uv_vertex>',
        `
        #ifdef USE_UV
          // ! orig: // vUv = ( uvTransform * vec3(uv, 1.0)).xy;
          vUv = ( uvTransform * vec3( uv.x * 0.5 + instanceMapUV.x, uv.y * 0.5 + instanceMapUV.y, 1 ) ).xy ;
        #endif
      `);
  };
}

// ------------------------------ //

export class InstancesDepthMaterial extends THREE.MeshDepthMaterial {
  name = 'InstancesDepthMaterial';

  onBeforeCompile = (shader) => {
    this.insertAttributesAndFunctions(shader);
    this.overrideLogic(shader);
  }

  insertAttributesAndFunctions = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        'void main() {',
        `
        attribute vec3 instanceOffset;
        attribute vec3 instanceScale;
        attribute vec2 instanceMapUV;

        // scale shadows' scale and position, but no rotating towards camera because that looks mental
        // vec3 getBillboardInstancePosition(vec3 position) {
        //   vec3 pos = position;
        //   pos += instanceOffset; 
        //   pos *= instanceScale;
        //   return pos;
        // }
        vec3 getBillboardInstancePosition(vec3 position) {
          vec3 look = cameraPosition - instanceOffset;
          look.y = 0.0;
          look = normalize(look);
          vec3 billboardUp = vec3(0, 1, 0);
          vec3 billboardRight = cross(billboardUp, look);
          vec3 pos = instanceOffset + (billboardRight * position.x * instanceScale.x) 
           + (billboardUp * position.y * instanceScale.y);
          return pos;
        }
        
        void main() {
      `,
      );
  };

  overrideLogic = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <project_vertex>', OVERRIDE_PROJECT_VERTEX)
      .replace('#include <uv_vertex>',
        `
        #ifdef USE_UV
          // ! orig: //  vUv = ( uvTransform * vec3(uv, 1.0)).xy;
          vUv = ( uvTransform * vec3( uv.x * 0.5 + instanceMapUV.x, uv.y * 0.5 + instanceMapUV.y, 1 ) ).xy ;
        #endif
      `);
  };
}

/*
        // if applying instanceQuaternion
        // vec3 getInstancePosition(vec3 position) {
        //   position *= instanceScale;
        //   vec4 instanceQuaternion = vec4(0, 0, 0, 1);
        //   vec3 vcV = cross( instanceQuaternion.xyz, position );
        //   position = vcV * ( 2.0 * instanceQuaternion.w ) +
        // ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + position );
        //   position += instanceOffset;

        //   return position;
        // }
*/
