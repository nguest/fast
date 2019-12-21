import { calculateFaces, calculateVertices, planeUnwrapUVs } from '../custom/geometries/concaveExample1';

export const objectsIndex = [
  { 
    name: 'sphere',
    type: 'SphereBufferGeometry', 
    params: [20,20,10],
    position: [0, 100, -100],
    material: 'redShiny',
    physics: {
      mass: 1,
      friction: 0.8
    },
    shadows: { 
      receive: true,
      cast: true,
    },
    add: true,
  },
  { 
    name: 'groundPlane',
    type: 'BoxBufferGeometry', 
    params: [150,1,150,1,1,1], 
    position: [-70,0,-50],
    rotation: [0, 0, -0.5],
    material: 'whiteFlat',
    physics: {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    shadows: { 
      receive: true,
      cast: true
    }, 
    add: true,
  },
  { 
    name: 'concaveExample1',
    type: 'Geometry', 
    params: 'custom', 
    position: [0,-100,0],
    rotation: [0, 0, 0],
    material: 'whiteFlat',
    physics: {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    shadows: { 
      receive: true,
      cast: true
    },
    calculateVertices,
    calculateFaces,
    calculateUVs: planeUnwrapUVs,
    add: true,
  },
];


    // const torus = new Mesh({ 
    //   type: 'TorusKnotBufferGeometry', 
    //   params: [12, 6, 80, 16 ], 
    //   position: [50,5,0],
    //   material: materials.snowShaderMat, 
    //   scene: this.scene,
    // });

    // const parametric = new Mesh({ 
    //   type: 'ParametricBufferGeometry', 
    //   params: [ klein, 25, 25 ],
    //   geoRotate: [0.4,0,-0.3],
    //   position: [-50,0,0],
    //   scale: [3,3,3],
    //   material: materials.redShiny,
    //   scene: this.scene,
    // });

    // const rock = new Mesh({ 
    //   type: 'JSON',
    //   url: './assets/models/rock.json',
    //   position: [0,0,-50],
    //   scale: [3,3,3],
    //   material: materials.snowShaderMat,
    //   scene: this.scene,
    // });

      // const ground = new Mesh({ 
      //   type: 'PlaneBufferGeometry', 
      //   params: [ 150, 150, 10, 10 ],
      //   rotation: [-Math.PI/2, 0, 0],
      //   position: [0,-20,0],
      //   shadows: { receive: true, cast: false },
      //   material: materials.whiteFlat,
      //   scene: this.scene,
      //   physicsWorld: this.physicsWorld,
      //   hasPhysics: true,
      //   mass: 0,
      // });