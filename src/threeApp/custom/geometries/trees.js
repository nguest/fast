import * as THREE from 'three';
import { getTreeline } from './treeline';

export const createInstancedMesh = ({ scene }) => {
  const treeGeo1 = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneBufferGeometry(4, 7, 1, 1));
  const treeGeo2 = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneBufferGeometry(4, 6, 1, 1));

  //treeGeo.rotateY(-Math.PI / 4);
  treeGeo1.translate(0, 3.0, 0);
  treeGeo2.translate(0, 2.5, 0);

  const translatePoints = getTreeline();
  console.log({ translatePoints })
  const treeCount = 300;
  const instanceOffset = [];
  const instanceScale = [];
  // for (let i = 0, i3 = 0, l = treeCount; i < l; i++, i3 += 3) {
  //   translateArray[i3 + 0] = Math.random() * 10 - 1;
  //   translateArray[i3 + 1] = 1;
  //   translateArray[i3 + 2] = Math.random() * 10 - 1;
  // }
  const instanceOffset2 = [];


  for (let i = 0, i3 = 0, l = treeCount; i < l; i++, i3 += 3) {
    instanceOffset[i3 + 0] = translatePoints[i].x;
    instanceOffset[i3 + 1] = translatePoints[i].y;
    instanceOffset[i3 + 2] = translatePoints[i].z;

    const scale = Math.random() * 0.5 + 0.75;
    instanceScale[i3 + 0] = scale;
    instanceScale[i3 + 1] = scale;
    instanceScale[i3 + 2] = scale;

    //
    if (Math.random() > 0.5) {
      instanceOffset2[i3 + 0] = translatePoints[i].x;
      instanceOffset2[i3 + 1] = translatePoints[i].y;
      instanceOffset2[i3 + 2] = translatePoints[i].z + 2;
    }

  }
  console.log({ translatePoints });

  treeGeo1.setAttribute('instanceOffset',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceOffset), 3, false));
  
  treeGeo1.setAttribute('instanceScale',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceScale), 3, false));


  treeGeo2.setAttribute('instanceOffset',
  new THREE.InstancedBufferAttribute(new Float32Array(instanceOffset2), 3, false));

treeGeo2.setAttribute('instanceScale',
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
    if ( diffuseColor.a < 0.9 ) discard; //!!! THIS WAS THE LINE NEEDED TO SOLVE THE ISSUE
   // if (length(diffuseColor.xyz) > 0.8) discard;
    gl_FragColor = vec4( diffuseColor.xyz * pow(diffuseColor.w, 0.5), diffuseColor.w );
    // multiplying color by alpha helps white borders on transparent pngs
  
  }
  `;

  // const imageLoader = new THREE.ImageBitmapLoader(this.manager);
  // imageLoader.options = { preMultiplyAlpha: 'preMultiplyAlpha' };
  const map1 = new THREE.TextureLoader().load('./assets/textures/pinetree1_map.png');
  const map2 = new THREE.TextureLoader().load('./assets/textures/tree2_map.png');

 //const map = new THREE.TextureLoader().load('./assets/textures/tree_map.png');
  const material1 = new THREE.RawShaderMaterial({
    uniforms: {
      map: { value: map1 },
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    // transparent: true, // not required!
    depthFunc: THREE.LessDepth,
  });

  const material2 = new THREE.RawShaderMaterial({
    uniforms: {
      map: { value: map2 },
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    // transparent: true, // not required!
    depthFunc: THREE.LessDepth,
  });


  const mesh1 = new THREE.Mesh(treeGeo1, material1);
  const mesh2 = new THREE.Mesh(treeGeo2, material2);


  const customDepthMaterial1 = new InstancesDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map: map1,
    alphaTest: 0.5,
  });
  const customDepthMaterial2 = new InstancesDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map: map2,
    alphaTest: 0.5,
  });

  mesh1.customDepthMaterial = customDepthMaterial1;
  mesh1.name = 'trees1';
  mesh1.frustumCulled = false; // this is probably not best: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
  mesh1.castShadow = true;

  mesh2.customDepthMaterial = customDepthMaterial2;
  mesh2.name = 'trees1';
  mesh2.frustumCulled = false; // this is probably not best: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
  mesh2.castShadow = true;

  scene.add(mesh1);
  scene.add(mesh2);
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
