import * as THREE from 'three';
import { getTreeline } from './treeline';

export const createInstancedMesh = ({ scene }) => {
  const treeGeo = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneBufferGeometry(4, 7, 1, 1));
  //treeGeo.rotateY(-Math.PI / 4);
  treeGeo.translate(0, 3.5, 5);

  const translatePoints = getTreeline();

  const treeCount = 300;
  const instanceOffset = [];
  const instanceScale = [];
  // for (let i = 0, i3 = 0, l = treeCount; i < l; i++, i3 += 3) {
  //   translateArray[i3 + 0] = Math.random() * 10 - 1;
  //   translateArray[i3 + 1] = 1;
  //   translateArray[i3 + 2] = Math.random() * 10 - 1;
  // }

  for (let i = 0, i3 = 0, l = treeCount; i < l; i++, i3 += 3) {
    instanceOffset[i3 + 0] = translatePoints[i].x;
    instanceOffset[i3 + 1] = translatePoints[i].y;
    instanceOffset[i3 + 2] = translatePoints[i].z;

    const scale = Math.random() * 0.5 + 0.75;
    instanceScale[i3 + 0] = scale;
    instanceScale[i3 + 1] = scale;
    instanceScale[i3 + 2] = scale;
  }
  console.log({ translatePoints });

  treeGeo.setAttribute('instanceOffset',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceOffset), 3, false));
  
    treeGeo.setAttribute('instanceScale',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceScale), 3, false));

  const vertexShader = `
  precision highp float;
  
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat4 viewMatrix;
  
  attribute vec3 position;
  attribute vec3 instanceOffset;
  attribute vec4 instanceQuaternion;
  attribute vec3 instanceScale;
  attribute vec2 uv;
  
  varying vec2 vUv;

  
  void main() {
  
    vUv = uv;
    vec3 transform =  position * instanceScale;
    transform = transform + instanceOffset;// + position);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transform, 1.0 );
  
  }
  `;

  const fragmentShader = `
  precision highp float;
  uniform sampler2D map;
  varying vec2 vUv;
  
  void main() {
  
    vec4 diffuseColor = texture2D( map, vUv );
    if ( diffuseColor.a < 0.5 ) discard; //!!! THIS WAS THE LINE NEEDED TO SOLVE THE ISSUE
   // if (length(diffuseColor.xyz) > 0.8) discard;
    gl_FragColor = vec4( diffuseColor.xyz * pow(diffuseColor.w, 0.5), diffuseColor.w );
    // multiplying color by alpha helps white borders on transparent pngs
  
  }
  `;
  const map = new THREE.TextureLoader().load('./assets/textures/pinetree1_map.png');
 //const map = new THREE.TextureLoader().load('./assets/textures/tree_map.png');
  const material = new THREE.RawShaderMaterial({
    uniforms: {
      map: { value: map },
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    // transparent: true, // not required!
    depthFunc: THREE.LessDepth,
  });

  //const material = new THREE.MeshPhongMaterial({})


  const mesh = new THREE.Mesh(treeGeo, material);

  const customDepthMaterial = new InstancesDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map,
    alphaTest: 0.5,
  });

  mesh.customDepthMaterial = customDepthMaterial;
  mesh.name = 'trees';
  mesh.frustumCulled = false; // this is probably not best: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping

  mesh.castShadow = true;

  scene.add(mesh);
};

export const INSTANCE_POSITION = 'instanceOffset';

export class InstancesDepthMaterial extends THREE.MeshDepthMaterial {
  name = 'InstancesDepthMaterial'

  onBeforeCompile = (shader) => {
    insertAttributesAndFunctions(shader);
    overrideLogic(shader);
  }
}

const insertAttributesAndFunctions = (shader) => {
  shader.vertexShader = shader.vertexShader
    .replace('void main() {', `
      attribute vec3 ${INSTANCE_POSITION};
      
      vec3 getInstancePosition(vec3 position) {
        return position + ${INSTANCE_POSITION};
      }
      
      void main() {
    `);
};

const overrideLogic = (shader) => {
  shader.vertexShader = shader.vertexShader
    .replace('#include <project_vertex>', OVERRIDE_PROJECT_VERTEX);
};

const OVERRIDE_PROJECT_VERTEX = `
  vec4 mvPosition = modelViewMatrix * vec4(getInstancePosition(transformed), 1.0);
  gl_Position = projectionMatrix * mvPosition;
`;
