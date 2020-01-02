import * as THREE from 'three';

export const createInstancedMesh2 = ({ scene }) => {


  const circleGeometry = new THREE.CircleBufferGeometry( 1, 6 );
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = circleGeometry.index;
  geometry.attributes = circleGeometry.attributes;
  
  const particleCount = 1000;
  const translateArray = new Float32Array( particleCount * 3 );
  
  for (let i = 0, i3 = 0, l = particleCount; i < l; i++, i3 += 3) {
    translateArray[i3 + 0] = Math.random() * 2 - 1;
    translateArray[i3 + 1] = Math.random() * 2 - 1;
    translateArray[i3 + 2] = Math.random() * 2 - 1;
  }
  geometry.setAttribute('translate', new THREE.InstancedBufferAttribute(translateArray, 3));
  // material = new THREE.RawShaderMaterial( {
  //   uniforms: {
  //     "map": { value: new THREE.TextureLoader().load( 'textures/sprites/circle.png' ) },
  //     "time": { value: 0.0 }
  //   },
  //   vertexShader: document.getElementById( 'vshader' ).textContent,
  //   fragmentShader: document.getElementById( 'fshader' ).textContent,
  //   depthTest: true,
  //   depthWrite: true
  // });
  
  const material = new THREE.MeshPhongMaterial({
    //map: new THREE.TextureLoader().load('asset/textures/tree_map.png'),
    color: new THREE.Color(0xff0000),
  });

  const mesh = new THREE.Mesh( geometry, material );
  console.log({ mesh })
  mesh.scale.set( 500, 500, 500 );
  scene.add( mesh );
}


export const createInstancedMesh = ({ scene }) => {
  const treeGeo = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneBufferGeometry(7, 10, 1, 1));
  treeGeo.rotateY(-Math.PI / 4);

  const treeCount = 100;
  const translateArray = [];
  for (let i = 0, i3 = 0, l = treeCount; i < l; i++, i3 += 3) {
    translateArray[i3 + 0] = Math.random() * 10 - 1;
    translateArray[i3 + 1] = 1;
    translateArray[i3 + 2] = Math.random() * 10 - 1;
  }

  treeGeo.addAttribute('treePos',
    new THREE.InstancedBufferAttribute(new Float32Array(translateArray), 3, 1));

  const vertexShader = `
  precision highp float;
  
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  
  attribute vec3 position;
  attribute vec3 treePos;
  attribute vec2 uv;
  
  varying vec2 vUv;
  
  void main() {
  
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( treePos + position, 1.0 );
  
  }
  `;

  const fragmentShader = `
  precision highp float;
  uniform sampler2D map;
  varying vec2 vUv;
  
  void main() {
  
    vec4 diffuseColor = texture2D( map, vUv );
    if ( diffuseColor.a < 0.1 ) discard; //!!! THIS WAS THE LINE NEEDED TO SOLVE THE ISSUE
    gl_FragColor = vec4( diffuseColor.xyz, diffuseColor.w );
  
  }
  `;

  const material = new THREE.RawShaderMaterial({
    uniforms: {
      map: { value: new THREE.TextureLoader().load('./assets/textures/tree_map.png') },
    },
    vertexShader,
    fragmentShader,
    side: THREE.FrontSide,
    // transparent: true, // not required!
    depthFunc: THREE.LessDepth,
  });

  const mesh = new THREE.Mesh(treeGeo, material);

  scene.add(mesh);
};
