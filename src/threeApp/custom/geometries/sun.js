import * as THREE from 'three';

const vertexShader = `
uniform float c;
uniform float p;
varying float intensity;
uniform vec3 viewVector;
void main() 
{
  vec3 vNormal = normalize( normalMatrix * normal );
  vec3 vNormel = normalize( normalMatrix * viewVector );
  intensity = pow(c - dot(vNormal, vNormel), p);
  
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragmentShader = `
uniform vec3 glowColor;
varying float intensity;
void main() 
{
  vec3 glow = glowColor * intensity;
    gl_FragColor = vec4( glow, 1.0 );
}
`;

export const createSun = (camera, scene) => {
  const geometry = new THREE.SphereBufferGeometry(10, 16, 8);
  
  console.log({ c: camera.threeCamera.position })
  const sunMaterial = new THREE.ShaderMaterial({
    uniforms: { 
      c: { type: "f", value: 0.1 },
      p: { type: "f", value: 2.0 },
      intensity: { type: "f", value: 20.0 },
      glowColor: { type: "c", value: new THREE.Color(0xffff00) },
      viewVector: { type: "v3", value: camera.threeCamera.position },
    },
    vertexShader,
    fragmentShader,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });

  const sun = new THREE.Mesh(geometry, sunMaterial);
  sun.position.set(40, 15, 30);

  scene.add(sun);

};