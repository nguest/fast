import * as THREE from 'three';
import { getTreeline } from './treeline';

export const createInstancedMesh = ({ scene }) => {
  const treeHeight = 7;
  const treeGeo1 = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneBufferGeometry(7, treeHeight, 1, 1));

  const { treeLineLeft, binormals } = getTreeline();
  const treeCount = 2000;
  const instanceOffset = [];
  const instanceScale = [];
  const instanceQuaternion = [];

  for (let i = 0; i < treeCount; i++) {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(binormals[i].x, 0, binormals[i].z)
    );
    quaternion.normalize();

    const scale = Math.random() * 0.5 + 0.75;

    instanceOffset.push(
      treeLineLeft[i].x,
      treeLineLeft[i].y + scale * treeHeight * 0.5,
      treeLineLeft[i].z,
    );
    instanceQuaternion.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    instanceScale.push(scale, scale, scale);
  }

  treeGeo1.setAttribute('instanceOffset',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceOffset), 3, false));
  treeGeo1.setAttribute('instanceScale',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceScale), 3, false));
  treeGeo1.setAttribute('instanceQuaternion',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceQuaternion), 4, false));

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

  vec3 applyTransform( vec3 position, vec3 translation, vec4 quaternion, vec3 scale ) {
    position *= scale;
    position += 2.0 * cross( quaternion.xyz, cross( quaternion.xyz, position ) + quaternion.w * position );
    return position + translation;
  }
  
  void main() {
  
    vUv = uv;

    vec4 orientation = instanceQuaternion;

    vec3 vPosition = position;

    vec3 vcV = cross( orientation.xyz, vPosition );

    vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );

    //vec3 transform =  position * instanceScale;
   // vec3 transform = position;

    //transform = transform + instanceOffset;// + position);
    //transform = transform + 2.0 * cross( instanceQuaternion.xyz, cross( instanceQuaternion.xyz, transform ) + instanceQuaternion.w * transform );

    
    //vec3 transform = applyTransform(position, instanceOffset, instanceQuaternion, instanceScale);

    //gl_Position = projectionMatrix * modelViewMatrix * vec4(transform, 1.0 );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(instanceOffset + vPosition, 1.0 );

    //vPosition
  
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
  //const map1 = new THREE.TextureLoader().load('./assets/textures/pinetree1_map.png');
  const map1 = new THREE.TextureLoader().load('./assets/textures/tree_map_2.png');

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

  // const material2 = new THREE.RawShaderMaterial({
  //   uniforms: {
  //     map: { value: map2 },
  //   },
  //   vertexShader,
  //   fragmentShader,
  //   side: THREE.DoubleSide,
  //   // transparent: true, // not required!
  //   depthFunc: THREE.LessDepth,
  // });


  const mesh1 = new THREE.Mesh(treeGeo1, material1);
  //const mesh2 = new THREE.Mesh(treeGeo2, material2);


  const customDepthMaterial1 = new InstancesDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map: map1,
    alphaTest: 0.5,
  });
  // const customDepthMaterial2 = new InstancesDepthMaterial({
  //   depthPacking: THREE.RGBADepthPacking,
  //   map: map2,
  //   alphaTest: 0.5,
  // });

  mesh1.customDepthMaterial = customDepthMaterial1;
  mesh1.name = 'trees1';
  mesh1.frustumCulled = false; // this is probably not best: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
  mesh1.castShadow = true;

  // mesh2.customDepthMaterial = customDepthMaterial2;
  // mesh2.name = 'trees1';
  // mesh2.frustumCulled = false; // this is probably not best: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
  // mesh2.castShadow = true;

  scene.add(mesh1);
  //scene.add(mesh2);
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
