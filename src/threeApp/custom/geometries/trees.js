import * as THREE from 'three';
import { BufferGeometryUtils } from '../../helpers/BufferGeometryUtils';
import { getTreeline } from './treeline';
import { computeFrenetFrames } from '../../helpers/curveHelpers';
import { trackParams } from './trackParams';
import { patchShader } from '../../materials/extend';

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
  const map = loader.load('./assets/textures/tree_map_2.png');
  const normalMap = loader.load('./assets/textures/tree_block_normal2.png');

  const material = new InstancesStandardMaterial({
    map,
    side: THREE.DoubleSide,
    normalMap,
    normalScale: new THREE.Vector2(0.5, 0.5),
    depthFunc: THREE.LessDepth,
    color: 0x444444,
    // extensions: {
    //   derivatives: true,
    // },
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
      count: 5000,
      yOffset: 0,//treeHeight * 0.5,
      name: `treesInstance-${i}`,
      material,
      depthMaterial,
    });
    scene.add(instancedMesh);
  });
};

const createInstancedMesh = ({ geometry, curve, count, yOffset, name, material, depthMaterial }) => {
  const instancedGeo = new THREE.InstancedBufferGeometry().copy(geometry);

  const positions = curve.getSpacedPoints(count);
  const { binormals, normals, tangents } = computeFrenetFrames(curve, count);

  const instanceOffset = [];
  const instanceScale = [];
  const instanceQuaternion = [];

  for (let i = 0; i < count; i++) {
    // quaternion.setFromUnitVectors(
    //   up,
    //   //new THREE.Vector3(binormals[i].x, 0, binormals[i].z);
    //   new THREE.Vector3(Math.random() * Math.PI, 0, Math.random() * Math.PI)
    // );
    // quaternion.normalize();

    const scale = Math.random() * 0.5 + 0.75;

    instanceOffset.push(
      positions[i].x,
      positions[i].y + scale * yOffset - 1,
      positions[i].z,
    );
    //instanceQuaternion.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    instanceScale.push(
      scale,
      scale,
      scale,
    );
  }

  instancedGeo.setAttribute('instanceOffset',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceOffset), 3, false));
  instancedGeo.setAttribute('instanceScale',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceScale), 3, false));
  // treeGeo1.setAttribute('instanceQuaternion',
  //   new THREE.InstancedBufferAttribute(new Float32Array(instanceQuaternion), 4, false));


  material.needsUpdate = true;
  material.uniformsNeedUpdate = true;

  const mesh = new THREE.Mesh(instancedGeo, material);


  mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);

  if (depthMaterial) mesh.customDepthMaterial = depthMaterial;
  // mesh1.frustumCulled = false; // this is probably not best: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
  mesh.castShadow = true;
  mesh.userData.type = 'instancedMesh';
  mesh.name = name;
  return mesh;
};


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
        
        // scale shadows' scale and position, but no rotating towards camera because that looks mental
        vec3 getBillboardInstancePosition(vec3 position) {
          position += instanceOffset; 
          position *= instanceScale;
          return position;
        }
        
        void main() {
      `,
      );
  };

  overrideLogic = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <project_vertex>', OVERRIDE_PROJECT_VERTEX);
  };
}


const OVERRIDE_PROJECT_VERTEX = `
  //!! vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

  vec4 mvPosition = modelViewMatrix * vec4(getBillboardInstancePosition(transformed), 1.0);
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
        
        // if applying instanceQuaternion
        // vec3 getInstancePosition(vec3 position) {
        //   position *= instanceScale;
        //   vec4 instanceQuaternion = vec4(0, 0, 0, 1);
        //   vec3 vcV = cross( instanceQuaternion.xyz, position );
        //   position = vcV * ( 2.0 * instanceQuaternion.w ) + ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + position );
        //   position += instanceOffset;

        //   return position;
        // }

        // rotate to face camera on y-axis for billboarding
        vec3 getBillboardInstancePosition(vec3 position) {
          vec3 look = cameraPosition - instanceOffset;
          look.y = 0.0;
          look = normalize(look);
          vec3 billboardUp = vec3(0, 1, 0);
          vec3 billboardRight = cross(billboardUp, look);
          vec3 pos = instanceOffset + billboardRight * position.x * instanceScale.x + billboardUp * position.y * instanceScale.y;
          return pos;
        }
        
        void main() {
      `,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
        `if ( diffuseColor.a < 0.95 ) discard; // remove low alpha values
        gl_FragColor = vec4( outgoingLight * diffuseColor.a, diffuseColor.a );`,
      );
  }

  overrideLogic = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <project_vertex>', OVERRIDE_PROJECT_VERTEX);
  };
}
/*
vec3 vPosition = position;
vec3 vcV = cross( instanceQuaternion.xyz, vPosition );
vPosition *= instanceScale;
vPosition = vcV * ( 2.0 * instanceQuaternion.w ) + ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + vPosition );
*/
