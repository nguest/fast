import * as THREE from 'three';

import { trackParams } from '../custom/geometries/trackParams';

export const createGates = (scene) => {
  const gatesCount = 500;
  const { binormals, normals, tangents } = trackParams.centerLine.computeFrenetFrames(gatesCount);
  const gatePositions = trackParams.centerLine.getSpacedPoints(gatesCount);

  const gateMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xff0000),
    side: THREE.DoubleSide,
    wireframe: true,
  });

  const axis = new THREE.Vector3();
  const up = new THREE.Vector3(1, 0, 0);

  const gates = [];

  for (let i = 0; i < gatesCount; i += 1) {
    const geometry = new THREE.PlaneBufferGeometry(30, 10, 1, 1);
    const mesh = new THREE.Mesh(geometry, gateMaterial);

    const binormal = binormals[i].normalize();

    axis.crossVectors(up, binormal).normalize();
    const radians = Math.acos(up.dot(binormal));
    mesh.quaternion.setFromAxisAngle(axis, radians);
    mesh.position.set(gatePositions[i].x, gatePositions[i].y + 5, gatePositions[i].z);
    mesh.name = `gate-${i}`;
    gates.push(mesh);
    scene.add(mesh);
  }
  return gates;
};


export const detectGateCollisions = (followObj, collidableMeshList) => {
  // collision detection - only parent followOb has changing position:
  const chassisBox = followObj.children[0];
  const originPoint = followObj.position.clone();

  // use front vertex as intersector
  const vertex = chassisBox.geometry.vertices[1];
  const localVertex = vertex.clone();
  const globalVertex = localVertex.applyMatrix4(chassisBox.matrix);
  const directionVector = globalVertex.sub(chassisBox.position);

  const ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
  const collisionResults = ray.intersectObjects(collidableMeshList);

  if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
    //console.log(collisionResults[0].object.name, originPoint);
    const collidee = collisionResults[0].object.name;
    // if (collidee === 'gate-finish') {
    //   return this.endGame();
    // }

    console.log("Hit ", collidee);
    //this.collisionStatus = "Hit " + collidee
    //this.gameState.setState({ [collidee]: this.delta })
    return collidee;
  }


  // gateConfig.map((gate,idx) => {
  //   // look if a gate is recorded in gameState
  //   const gateState = this.gameState.getState()[`gate-${idx}`]

  //   if (originPoint.z < gate.z - 50) {
  //     // if miss
  //     if (!gateState) {
  //       this.gameState.setState({ [`gate-${idx}`]: null })
  //     }

  //     // display gateStatus
  //     const stateValues = Object.values(this.gameState.getState())

  //     if (!stateValues[stateValues.length - 1]) {
  //       this.updateDisplay('big', 'Oops! Missed a gate', 2000);
  //     } else {
  //       this.updateDisplay('big', 'Passed Gate!', 2000);
  //     }
  //     const gateStatus = stateValues.map(value => {
  //       if (value) return 'x';
  //       return 'o';
  //     })
  //     this.updateDisplay('gate', gateStatus.join(''))
  //   }
  // })
};
