import * as THREE from 'three';
import { BufferGeometryUtils } from '../../helpers/BufferGeometryUtils';
import { getTreeline } from './treeline';


export const createTrees = ({ scene }) => {
  const { treeCurveLeft, treeCurveRight } = getTreeline();
  const mesh1 = createInstancedMesh({ curve: treeCurveLeft, count: 5000 });
  const mesh2 = createInstancedMesh({ curve: treeCurveRight, count: 5000 });
  scene.add(mesh1);
  scene.add(mesh2);
  // const testMesh = createTestTree();
  // scene.add(testMesh);
};

const createTestTree = () => {
  const geometry = new THREE.SphereGeometry(3, 16, 8);
  geometry.scale(0.7, 1, 0.7);
  console.log({ geometry })
  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(0x226622),
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 3, 0);
  return mesh;
}

const createInstancedMesh = ({ curve, count }) => {
  const treeHeight = 7;
  const treePlane = new THREE.PlaneBufferGeometry(7, treeHeight, 1, 1);
  treePlane.name = 'treePlane'
  console.log({ treePlane })

  const plane1 = treePlane.clone();
  const plane2 = treePlane.clone().rotateY(2 * Math.PI / 3);
  const plane3 = treePlane.clone().rotateY(4 * Math.PI / 3);
  console.log({ plane1, plane2 })
  //const treeGeo = new THREE.BufferGeometry();
  const treeGeo = BufferGeometryUtils.mergeBufferGeometries([plane1, plane2, plane3])
  //treeGeo.copy(plane1.merge(plane2)).merge(plane3);
  console.log({ 1: treeGeo })
  // treeGeo.merge(plane2);
  // console.log({ 2: treeGeo })
  // treeGeo.merge(plane3);
  // console.log({ 3: treeGeo })

  const treeGeo1 = new THREE.InstancedBufferGeometry().copy(treeGeo);

  const positions = curve.getSpacedPoints(count);
  const { binormals, normals, tangents } = curve.computeFrenetFrames(count);

  const instanceOffset = [];
  const instanceScale = [];
  const instanceQuaternion = [];
  const quaternion = new THREE.Quaternion();
  const up = new THREE.Vector3(1, 0, 0);

  for (let i = 0; i < count; i++) {
    quaternion.setFromUnitVectors(
      up,
      //new THREE.Vector3(binormals[i].x, 0, binormals[i].z);
      new THREE.Vector3(Math.random() * Math.PI, 0, Math.random() * Math.PI)
    );
    quaternion.normalize();

    const scale = Math.random() * 0.5 + 0.75;

    instanceOffset.push(
      positions[i].x,
      positions[i].y + scale * treeHeight * 0.5,
      positions[i].z,
    );
    instanceQuaternion.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    instanceScale.push(
      scale, //Math.random() > 0.4 ? scale : -scale,
      scale,
      scale,
    );
  }

  treeGeo1.setAttribute('instanceOffset',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceOffset), 3, false));
  treeGeo1.setAttribute('instanceScale',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceScale), 3, false));
  treeGeo1.setAttribute('instanceQuaternion',
    new THREE.InstancedBufferAttribute(new Float32Array(instanceQuaternion), 4, false));

  
  const loader = new THREE.TextureLoader();
  const map1 = loader.load('./assets/textures/tree_map_2.png');
  const normalMap = loader.load('./assets/textures/tree_block_normal2.png');

  const material1 = new InstancesStandardMaterial({
    map: map1,
    side: THREE.DoubleSide,
    normalMap,
    normalScale: new THREE.Vector2(0.5, 0.5),
    depthFunc: THREE.LessDepth,
  });
  material1.needsUpdate = true;


  const mesh1 = new THREE.Mesh(treeGeo1, material1);

  const customDepthMaterial1 = new InstancesDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map: map1,
    alphaTest: 0.5,
  });

  mesh1.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);

  mesh1.customDepthMaterial = customDepthMaterial1;
  //mesh1.name = 'trees1';
  //mesh1.frustumCulled = false; // this is probably not best: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
  mesh1.castShadow = true;
  mesh1.userData.type = 'instancedMesh';
  mesh1.name = 'treesInstance';
  return mesh1;
};

export const INSTANCE_POSITION = 'instanceOffset';

export class InstancesDepthMaterial extends THREE.MeshDepthMaterial {
  name = 'InstancesDepthMaterial'

  onBeforeCompile = (shader) => {
    this.insertAttributesAndFunctions(shader);
    this.overrideLogic(shader);
  }


  insertAttributesAndFunctions = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        'void main() {',
        `
        attribute vec3 ${INSTANCE_POSITION};
        
        vec3 getInstancePosition(vec3 position) {
          position += ${INSTANCE_POSITION};
          position *= 1.0;
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
  //vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

  vec4 mvPosition = modelViewMatrix * vec4(getInstancePosition(transformed), 1.0);
  gl_Position = projectionMatrix * mvPosition;
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
        attribute vec3 ${INSTANCE_POSITION};
        attribute vec4 instanceQuaternion;
        attribute vec3 instanceScale;
        
        vec3 getInstancePosition(vec3 position) {
          position *= instanceScale;
          vec3 vcV = cross( instanceQuaternion.xyz, position );
          position = vcV * ( 2.0 * instanceQuaternion.w ) + ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + position );
          position += ${INSTANCE_POSITION};

          return position;
        }
        
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
/*
vec3 vPosition = position;
vec3 vcV = cross( instanceQuaternion.xyz, vPosition );
vPosition *= instanceScale;
vPosition = vcV * ( 2.0 * instanceQuaternion.w ) + ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + vPosition );
*/


const vertexShader2 = `
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

    vec3 vPosition = position;
    vec3 vcV = cross( instanceQuaternion.xyz, vPosition );
    vPosition *= instanceScale;
    vPosition = vcV * ( 2.0 * instanceQuaternion.w ) + ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + vPosition );
    
    //vec3 transform = applyTransform(position, instanceOffset, instanceQuaternion, instanceScale);

    //gl_Position = projectionMatrix * modelViewMatrix * vec4(transform, 1.0 );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(instanceOffset + vPosition, 1.0 );

    //vPosition
  
  }
  `;

  const fragmentShader2 = `
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



const vertexShader = `
#define STANDARD
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`

  const fragmentShader = `
  #define STANDARD
  #ifdef PHYSICAL
    #define REFLECTIVITY
    #define CLEARCOAT
    #define TRANSPARENCY
  #endif
  uniform vec3 diffuse;
  uniform vec3 emissive;
  uniform float roughness;
  uniform float metalness;
  uniform float opacity;
  #ifdef TRANSPARENCY
    uniform float transparency;
  #endif
  #ifdef REFLECTIVITY
    uniform float reflectivity;
  #endif
  #ifdef CLEARCOAT
    uniform float clearcoat;
    uniform float clearcoatRoughness;
  #endif
  #ifdef USE_SHEEN
    uniform vec3 sheen;
  #endif
  varying vec3 vViewPosition;
  #ifndef FLAT_SHADED
    varying vec3 vNormal;
    #ifdef USE_TANGENT
      varying vec3 vTangent;
      varying vec3 vBitangent;
    #endif
  #endif
  #include <common>
  #include <packing>
  #include <dithering_pars_fragment>
  #include <color_pars_fragment>
  #include <uv_pars_fragment>
  #include <uv2_pars_fragment>
  #include <map_pars_fragment>
  #include <alphamap_pars_fragment>
  #include <aomap_pars_fragment>
  #include <lightmap_pars_fragment>
  #include <emissivemap_pars_fragment>
  #include <bsdfs>
  #include <cube_uv_reflection_fragment>
  #include <envmap_common_pars_fragment>
  #include <envmap_physical_pars_fragment>
  #include <fog_pars_fragment>
  #include <lights_pars_begin>
  #include <lights_physical_pars_fragment>
  #include <shadowmap_pars_fragment>
  #include <bumpmap_pars_fragment>
  #include <normalmap_pars_fragment>
  #include <clearcoat_normalmap_pars_fragment>
  #include <roughnessmap_pars_fragment>
  #include <metalnessmap_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  #include <clipping_planes_pars_fragment>
  void main() {
    #include <clipping_planes_fragment>
    vec4 diffuseColor = vec4( diffuse, opacity );
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;
    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <roughnessmap_fragment>
    #include <metalnessmap_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>
    #include <clearcoat_normal_fragment_begin>
    #include <clearcoat_normal_fragment_maps>
    #include <emissivemap_fragment>
    // accumulation
    #include <lights_physical_fragment>
    #include <lights_fragment_begin>
    #include <lights_fragment_maps>
    #include <lights_fragment_end>
    // modulation
    #include <aomap_fragment>
    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
    // this is a stub for the transparency model
    #ifdef TRANSPARENCY
      diffuseColor.a *= saturate( 1. - transparency + linearToRelativeLuminance( reflectedLight.directSpecular + reflectedLight.indirectSpecular ) );
    #endif
    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
  }

  `;