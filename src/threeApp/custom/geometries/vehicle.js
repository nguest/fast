import * as THREE from 'three';
import * as Ammo from 'ammonext';

//createVehicle(new THREE.Vector3(0, 4, -20), ZERO_QUATERNION);


// - Global variables -
const DISABLE_DEACTIVATION = 4;
const TRANSFORM_AUX = new Ammo.btTransform();
const ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);
const materialInteractive = new THREE.MeshPhongMaterial({ color: 0x990000 });

let engineForce = 0;
let vehicleSteering = 0;
let breakingForce = 0;

const steeringIncrement = 0.04;
const steeringClamp = 0.5;
const maxEngineForce = 2000;
const maxBreakingForce = 100;

const FRONT_LEFT = 0;
const FRONT_RIGHT = 1;
const BACK_LEFT = 2;
const BACK_RIGHT = 3;
const wheelMeshes = [];

const createWheelMesh = ({ radius, width, scene }) => {
  const t = new THREE.CylinderGeometry(radius, radius, width, 24, 1);
  t.rotateZ(Math.PI / 2);
  const mesh = new THREE.Mesh(t, materialInteractive);
  mesh.add(new THREE.Mesh(
    new THREE.BoxGeometry(
      width * 1.5,
      radius * 1.75,
      radius * 0.25,
      1, 1, 1,
    ),
    materialInteractive,
  ));
  scene.add(mesh);
  return mesh;
};

const createChassisMesh = ({ w, l, h, scene }) => {
  const shape = new THREE.BoxGeometry(w, h, l, 1, 1, 1);
  const mesh = new THREE.Mesh(shape, materialInteractive);
  scene.add(mesh);
  return mesh;
};

export const createVehicle = ({ pos, quat = ZERO_QUATERNION, physicsWorld, scene }) => {
  // Vehicle contants
  console.log('create', ZERO_QUATERNION);
  const chassisW = 1.8;
  const chassisH = 0.6;
  const chassisL = 4;
  const massVehicle = 800;

  const wheelAxisPositionBack = -1;
  const wheelRadiusBack = 0.4;
  const wheelWidthBack = 0.3;
  const wheelHalfTrackBack = 1;
  const wheelAxisHeightBack = 0.3;

  const wheelAxisFrontPosition = 1.7;
  const wheelHalfTrackFront = 1;
  const wheelAxisHeightFront = 0.3;
  const wheelRadiusFront = 0.35;
  const wheelWidthFront = 0.2;

  const friction = 1000;
  const suspensionStiffness = 20.0;
  const suspensionDamping = 2.3;
  const suspensionCompression = 4.4;
  const suspensionRestLength = 0.6;
  const rollInfluence = 0.2;

  // const steeringIncrement = 0.04;
  // const steeringClamp = 0.5;
  // const maxEngineForce = 2000;
  // const maxBreakingForce = 100;

  // Chassis
  const geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisW * 0.5, chassisH * 0.5, chassisL * 0.5));
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  const motionState = new Ammo.btDefaultMotionState(transform);
  const localInertia = new Ammo.btVector3(0, 0, 0);
  geometry.calculateLocalInertia(massVehicle, localInertia);
  console.log({ massVehicle, motionState, geometry, localInertia })
  const body = new Ammo.btRigidBody(
    new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia),
  );
  body.setActivationState(DISABLE_DEACTIVATION);
  physicsWorld.addRigidBody(body);
  const chassisMesh = createChassisMesh({ w: chassisW, h: chassisH, l: chassisL, scene });

  // Raycast Vehicle
  // let engineForce = 0;
  // let vehicleSteering = 0;
  // let breakingForce = 0;
  const tuning = new Ammo.btVehicleTuning();
  const rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
  const vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
  vehicle.setCoordinateSystem(0, 1, 2);
  physicsWorld.addAction(vehicle);

  // Wheels
  // const FRONT_LEFT = 0;
  // const FRONT_RIGHT = 1;
  // const BACK_LEFT = 2;
  // const BACK_RIGHT = 3;
  // const wheelMeshes = [];
  const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
  const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

  const addWheel = (isFront, position, radius, width, index) => {
    const wheelInfo = vehicle.addWheel(
      position,
      wheelDirectionCS0,
      wheelAxleCS,
      suspensionRestLength,
      radius,
      tuning,
      isFront,
    );

    wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
    wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
    wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
    wheelInfo.set_m_frictionSlip(friction);
    wheelInfo.set_m_rollInfluence(rollInfluence);

    wheelMeshes[index] = createWheelMesh({ radius, width, scene });
  };

  addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
  addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
  addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT);
  addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT);


  //syncList.push(sync);
  physicsWorld.bodies.push(updateVehicle.bind(vehicle, chassisMesh, {}));
};

// Sync keybord actions and physics and graphics
export const updateVehicle = (dt, vehicle, chassisMesh, actions) => {
  const speed = vehicle.getCurrentSpeedKmHour();

  //speedometer.innerHTML = `${(speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1)} km/h`;

  breakingForce = 0;
  engineForce = 0;

  if (actions.acceleration) {
    if (speed < -1) breakingForce = maxBreakingForce;
    else engineForce = maxEngineForce;
  }
  if (actions.braking) {
    if (speed > 1) breakingForce = maxBreakingForce;
    else engineForce = -maxEngineForce / 2;
  }
  if (actions.left) {
    if (vehicleSteering < steeringClamp) vehicleSteering += steeringIncrement;
  } else if (actions.right) {
    if (vehicleSteering > -steeringClamp) vehicleSteering -= steeringIncrement;
  } else if (vehicleSteering < -steeringIncrement) vehicleSteering += steeringIncrement;
  else if (vehicleSteering > steeringIncrement) vehicleSteering -= steeringIncrement;
  else {
    vehicleSteering = 0;
  }

  vehicle.applyEngineForce(engineForce, BACK_LEFT);
  vehicle.applyEngineForce(engineForce, BACK_RIGHT);

  vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
  vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
  vehicle.setBrake(breakingForce, BACK_LEFT);
  vehicle.setBrake(breakingForce, BACK_RIGHT);

  vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
  vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);

  let tm; let p; let q; let i;
  const n = vehicle.getNumWheels();
  for (i = 0; i < n; i++) {
    vehicle.updateWheelTransform(i, true);
    tm = vehicle.getWheelTransformWS(i);
    p = tm.getOrigin();
    q = tm.getRotation();
    wheelMeshes[i].position.set(p.x(), p.y(), p.z());
    wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
  }

  tm = vehicle.getChassisWorldTransform();
  p = tm.getOrigin();
  q = tm.getRotation();
  chassisMesh.position.set(p.x(), p.y(), p.z());
  chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
};
