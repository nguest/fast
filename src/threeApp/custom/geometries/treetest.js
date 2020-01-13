import * as THREE from 'three';

const loader = new THREE.TextureLoader();

// const material = new THREE.MeshPhongMaterial({
//   map: loader.load('./assets/textures/tree_map_2.png'),
//   normalMap: loader.load('./assets/textures/tree_normal.png'),
//   transparent: true,
//   needsUpate: true,
//   normalScale: new THREE.Vector2(10, 10),
//   side: THREE.DoubleSide,
// });

const meshPhongVert = `
#define PHONG
varying vec3 vViewPosition;

uniform vec3 directionalLightColor[NUM_DIR_LIGHTS];
uniform vec3 directionalLightDirection[NUM_DIR_LIGHTS];

#ifndef FLAT_SHADED
  varying vec3 vNormal;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
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
  #include <envmap_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}
`;

const meshPhongFrag = `
#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

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
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
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
  #include <specularmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <emissivemap_fragment>
  // accumulation
  #include <lights_phong_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  // modulation
  #include <aomap_fragment>
  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
  #include <envmap_fragment>
  //gl_FragColor = vec4( outgoingLight, diffuseColor.a );
  gl_FragColor = vec4( outgoingLight, 0.5 );

  #include <tonemapping_fragment>
  #include <encodings_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}
`;

const u = THREE.UniformsUtils.clone(THREE.ShaderLib.phong.uniforms);
const map = loader.load('./assets/textures/UVGrid.jpg')

const material = new THREE.ShaderMaterial({
  // defines: {
  //   USE_MAP: " ",
  //   USE_UV: " ",
  //   //USE_ALPHAMAP: true,
  // },
  uniforms: THREE.UniformsUtils.merge([
    //THREE.UniformsLib.common,
    //THREE.UniformsLib.fog,
     THREE.UniformsLib.lights,
    //THREE.UniformsLib.shadowmap,
    {
      diffuse: { value: new THREE.Color(0xff0000) },
      map: { value: map },
      //offsetRepeat: { value: [0, 0, 2, 2] }
    },
  ]),
  // uniforms: {
  //   //map: { value: loader.load('./assets/textures/tree_map_2.png') },
  // },
  //transparent: true,
  // normalScale: new THREE.Vector2(10, 10),
  // side: THREE.DoubleSide,
  lights: true,
  side: THREE.DoubleSide,
  vertexShader: meshPhongVert,
  fragmentShader: meshPhongFrag,
});

console.log({ material })


const customMeshDepthMaterial = new THREE.MeshDepthMaterial({
  map: loader.load('./assets/textures/tree_map_2.png'),
  depthPacking: THREE.RGBADepthPacking,
  alphaTest: 0.5,
});

export const createTree = (scene) => {
  const plane = new THREE.PlaneBufferGeometry(5, 5, 1, 1);
  material.needsUpdate = true;
 // material.customMeshDepthMaterial = customMeshDepthMaterial;
//  material.colorWrite = false;
//  material.depthWrite = false;
  const mesh = new THREE.Mesh(plane, material);
  // mesh.rotation.set(0, -1.5, 0)
  // mesh.position.set(0, 2.5, 0)
  //mesh.visible = false;
  mesh.castShadow = true;
  console.log({ mesh })
  scene.add(mesh);
};


