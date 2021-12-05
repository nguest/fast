import * as THREE from 'three';
import Ammo from 'ammonext';
import { Mesh } from '../components/Mesh';
import { createApexMarkers } from '../custom/geometries/apex';
import { decorateFences } from '../custom/geometries/fences';
import { decorateGrass } from '../custom/geometries/grass';
import { decorateTrack } from '../custom/geometries/track';
import { createTrees } from '../custom/geometries/trees';
import { objectsIndex } from '../sceneConfig/objects';
import { getObjByName, getPosQuatFromGamePosition, promisifyLoader } from './helpers';
import { Config } from '../sceneConfig/general';
import { assetsIndex } from '../sceneConfig/assets';
import { materialsIndex } from '../sceneConfig/materials';
import { createMaterial } from '../materials';
import { decorateTerrainSmall } from '../custom/geometries/terrainSmall';
import { createTerrain } from '../custom/geometries/terrain';

const zeroVector = new Ammo.btVector3(0, 0, 0);

export const createObjects = (materials, assets, trackParams, scene, manager, physicsWorld) => {
  const t1 = performance.now();
  const perf = [];
  const objects = objectsIndex(trackParams)
    .filter(getActiveObjects)
    .map((obj) => {
      const params = {
        ...obj,
        type: obj.type,
        params: obj.params,
        position: obj.position,
        rotation: obj.rotation,
        material: Array.isArray(obj.material) ? obj.material.map((m) => materials[m]) : materials[obj.material],
        scene,
        shadows: obj.shadows,
        manager,
      };

      if (obj.physics) {
        params.physics = {
          physicsWorld,
          mass: obj.physics.mass,
          friction: obj.physics.friction,
          restitution: obj.physics.restitution,
          damping: obj.physics.damping,
        };
      }
      const mesh = new Mesh(params);
      perf.push(mesh.getCreateDuration());
      return mesh.getMesh();
    });

  createTrees(scene, trackParams);
  decorateTrack(getObjByName(scene, 'racingLine'), scene, trackParams, materials.roadRacingLine);
  decorateGrass(getObjByName(scene, 'grassL'), scene, trackParams, materials, assets);
  //decorateTerrainSmall(getObjByName(this.scene, 'terrainSmall'), this.scene);
  decorateFences(getObjByName(scene, 'fences'), scene, trackParams, materials.billboards);
  createApexMarkers(scene, trackParams);
  //createTerrain(this.scene);

  const instancedMeshes = scene.children.filter((o) => o.userData.type === 'instancedMesh');
  const t2 = performance.now();
  console.info(`createObjects took ${t2 - t1} ms`);
  console.table(perf.sort((a, b) => b.createDuration - a.createDuration));
  console.info({
    'this.scene': scene.children.filter((o) => o.userData.type !== 'gate'),
  });

  const helper = new THREE.GridHelper(10, 2, 0xffffff, 0xffffff);
  scene.add(helper);
  return { objects, instancedMeshes };
};

export const createPhysicsWorld = () => {
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  const overlappingPairCache = new Ammo.btDbvtBroadphase();
  const solver = new Ammo.btSequentialImpulseConstraintSolver();

  const physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
  physicsWorld.setGravity(new Ammo.btVector3(...Config.gravity));
  physicsWorld.bodies = [];
  return physicsWorld;
};

export const loadAssets = (manager) => {
  const imageLoader = new THREE.ImageLoader(manager);
  imageLoader.options = { preMultiplyAlpha: 'preMultiplyAlpha' };
  const ImagePromiseLoader = promisifyLoader(imageLoader);
  const imagePromises = Object.values(assetsIndex.images).map((file) => {
    console.info('loading image: ', file.path);
    return ImagePromiseLoader.load(file.path);
  });

  const TexturePromiseLoader = promisifyLoader(new THREE.TextureLoader(manager));
  const texturesPromises = Object.values(assetsIndex.textures).map((texture) => {
    return TexturePromiseLoader.load(texture.path);
  });
  const texturesAndFiles = { imagePromises, texturesPromises };

  return texturesAndFiles;
};

export const createMaterials = async (filesAndTextures) => {
  const t1 = performance.now();
  const { imagePromises, texturesPromises } = filesAndTextures;
  try {
    const r = await Promise.all([...imagePromises, ...texturesPromises]);
    const assets = r.reduce((agg, asset, idx) => {
      const fileNames = [...Object.keys(assetsIndex.images), ...Object.keys(assetsIndex.textures)];
      return {
        ...agg,
        [fileNames[idx]]: asset,
      };
    }, {});

    const materials = materialsIndex.reduce(
      (agg, materialParams) => ({
        ...agg,
        [materialParams.name]: createMaterial(materialParams, assets),
      }),
      {},
    );
    const t2 = performance.now();
    console.info(`createMaterials took ${t2 - t1} ms with ${materialsIndex.length} materials`);
    return { materials, assets };
  } catch (err) {
    console.error('ERROR loading image', err);
  }
};

export const resetObjects = (gate, physicsWorld, controls, trackParams, showGamePosition) => {
  console.info(`resetObjects to: ${gate}`);
  showGamePosition(gate);
  if (!physicsWorld) return;
  const { position, quat } = getPosQuatFromGamePosition(gate, trackParams);
  controls.target.copy(position);
  const objThree = physicsWorld.bodies.find((o) => o.name === 'chassisMesh');
  const objPhys = objThree.userData.physicsBody;

  const body = objPhys.getRigidBody();
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(position.x, position.y + 1, position.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

  body.setLinearVelocity(zeroVector);
  body.setAngularVelocity(zeroVector);
  body.setWorldTransform(transform);
};

export const getActiveObjects = (o) => {
  const inactiveObjectsJSON = localStorage.getItem('inactiveObjects');
  const isInactiveObject = JSON.parse(inactiveObjectsJSON)?.find((n) => n === o.name);
  return !isInactiveObject;
};

export const toggleActiveObject = (name, isActive) => {
  const inactiveObjectsJSON = localStorage.getItem('inactiveObjects');
  const inactiveObjects = JSON.parse(inactiveObjectsJSON) || [];
  if (!inactiveObjects.includes(name) && !isActive) {
    const newInactiveObjects = [...(inactiveObjects || []), name];
    localStorage.setItem('inactiveObjects', JSON.stringify(newInactiveObjects));
  }
  if (isActive) {
    const newInactiveObjects = (inactiveObjects || []).filter((name) => !name);
    localStorage.setItem('inactiveObjects', JSON.stringify(newInactiveObjects));
  }
};
