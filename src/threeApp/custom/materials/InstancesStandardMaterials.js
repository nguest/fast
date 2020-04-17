import * as THREE from 'three';

// https://discourse.threejs.org/t/instanced-geometry-vertex-shader-question/2694/6

const OVERRIDE_PROJECT_VERTEX = `
  //!! orig // vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  //transformed = getInstancePosition(transformed);
  transformed = applyTRS( transformed.xyz, instanceOffset, instanceQuaternion, instanceScale );
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  if (gl_Position.z > 200.0) gl_Position.w = 0.0/0.0;
`;

export class InstancesStandardMaterial extends THREE.MeshPhongMaterial {
  constructor(params) {
    super(params);
    if (params.userData.faceToCamera) this.faceToCamera = true;
    if (params.userData.faceToQuat) this.faceToQuat = true;
  }

  name = 'InstancesStandardMaterial';

  onBeforeCompile = (shader) => {
    this.insertAttributesAndFunctions(shader);
    this.overrideLogic(shader);
  }

  insertAttributesAndFunctions = (shader) => {
    if (this.faceToCamera) {
      shader.vertexShader = shader.vertexShader
        .replace(
          'void main() {',
          `
          attribute vec3 instanceOffset;
          attribute vec4 instanceQuaternion;
          attribute vec3 instanceScale;
          attribute vec2 instanceMapUV;

          // rotate to face camera on y-axis for billboarding
          vec3 applyTRS(vec3 position, vec3 translation, vec4 quaternion, vec3 scale) {

            vec3 look = cameraPosition - translation;
            look.y = 0.0;
            look = normalize(look);
            vec3 billboardUp = vec3(0, 1, 0);
            vec3 billboardRight = cross(billboardUp, look);
            vec3 pos = instanceOffset + (billboardRight * position.x * scale.x)
              + (billboardUp * position.y * scale.y);
            return pos;
          }
          // if applying instanceQuaternion
          // vec3 applyTRS(vec3 position, vec3 translation, vec4 quaternion, vec3 scale) {
          //   position *= scale;
          //   // vec4 instanceQuaternion = vec4(0, 0, 0, 1);
          //   vec3 vcV = cross( instanceQuaternion.xyz, position );
          //   // position = vcV * ( 2.0 * instanceQuaternion.w ) +
          //   //   ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + position );
          //   position = position + 2.0 * cross( instanceQuaternion.xyz, cross( instanceQuaternion.xyz, position ) + instanceQuaternion.w * position );

          //   //position = vcV * ( 2.0 * instanceQuaternion.w ) + ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + position );

          //   position += instanceOffset;

          //   return position;
          // }

          // vec3 applyTRS( vec3 position, vec3 translation, vec4 quaternion, vec3 scale ) {
          //   position *= scale;
          //   position += 2.0 * cross( quaternion.xyz, cross( quaternion.xyz, position ) + quaternion.w * position );
          //   return position + translation;
          // }
          
          void main() {
        `,
      );
    }
    if (this.faceToQuat) {
      console.log('XXXXXXX');
      
      shader.vertexShader = shader.vertexShader
        .replace(
          'void main() {',
          `
          attribute vec3 instanceOffset;
          attribute vec4 instanceQuaternion;
          attribute vec3 instanceScale;
          attribute vec2 instanceMapUV;

          // if applying instanceQuaternion
          // vec3 applyTRS(vec3 position, vec3 translation, vec4 quaternion, vec3 scale) {
          //   position *= scale;
          //   // vec4 instanceQuaternion = vec4(0, 0, 0, 1);
          //   vec3 vcV = cross( instanceQuaternion.xyz, position );
          //   // position = vcV * ( 2.0 * instanceQuaternion.w ) +
          //   //   ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + position );
          //   position = position + 2.0 * cross( instanceQuaternion.xyz, cross( instanceQuaternion.xyz, position ) + instanceQuaternion.w * position );

          //   //position = vcV * ( 2.0 * instanceQuaternion.w ) + ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + position );

          //   position += instanceOffset;

          //   return position;
          // }

          vec3 applyTRS( vec3 position, vec3 translation, vec4 quaternion, vec3 scale ) {
            position *= scale;
            position += 2.0 * cross( quaternion.xyz, cross( quaternion.xyz, position ) + quaternion.w * position );
            return position + translation;
          }
          
          void main() {
        `,
      );
    }

    shader.fragmentShader = shader.fragmentShader
      .replace(
        'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
        `if ( diffuseColor.a < 0.9 ) discard; // remove low alpha values
        gl_FragColor = vec4( outgoingLight * diffuseColor.a, diffuseColor.a );`,
      );
  }

  overrideLogic = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <project_vertex>', OVERRIDE_PROJECT_VERTEX)
      .replace('#include <uv_vertex>',
        `
        #ifdef USE_UV
          // ! orig: // vUv = ( uvTransform * vec3(uv, 1.0)).xy;
          vUv = ( uvTransform * vec3( uv.x * 0.5 + instanceMapUV.x, uv.y * 0.5 + instanceMapUV.y, 1 ) ).xy ;
        #endif
      `);
  };
}

// ------------------------------ //

export class InstancesDepthMaterial extends THREE.MeshDepthMaterial {
  constructor(params) {
    super(params);
    if (params.userData.faceToCamera) this.faceToCamera = true;
    if (params.userData.faceToQuat) this.faceToQuat = true;
  }

  name = 'InstancesDepthMaterial';

  onBeforeCompile = (shader) => {
    this.insertAttributesAndFunctions(shader);
    this.overrideLogic(shader);
  }

  insertAttributesAndFunctions = (shader) => {
    if (this.faceToCamera) {
      shader.vertexShader = shader.vertexShader
        .replace(
          'void main() {',
          `
          attribute vec3 instanceOffset;
          attribute vec4 instanceQuaternion;
          attribute vec3 instanceScale;
          attribute vec2 instanceMapUV;

          // rotate to face camera on y-axis for billboarding
          vec3 applyTRS(vec3 position, vec3 translation, vec4 quaternion, vec3 scale) {

            vec3 look = cameraPosition - translation;
            look.y = 0.0;
            look = normalize(look);
            vec3 billboardUp = vec3(0, 1, 0);
            vec3 billboardRight = cross(billboardUp, look);
            vec3 pos = instanceOffset + (billboardRight * position.x * scale.x)
              + (billboardUp * position.y * scale.y);
            return pos;
          }
          
          void main() {
        `,
      );
    }
    if (this.faceToQuat) {
      shader.vertexShader = shader.vertexShader
        .replace(
          'void main() {',
          `
          #define DEPTH_PACKING 3201
          attribute vec3 instanceOffset;
          attribute vec4 instanceQuaternion;
          attribute vec3 instanceScale;
          attribute vec2 instanceMapUV;

          // if applying instanceQuaternion
          // vec3 applyTRS(vec3 position, vec3 translation, vec4 quaternion, vec3 scale) {
          //   position *= scale;
          //   // vec4 instanceQuaternion = vec4(0, 0, 0, 1);
          //   vec3 vcV = cross( instanceQuaternion.xyz, position );
          //   // position = vcV * ( 2.0 * instanceQuaternion.w ) +
          //   //   ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + position );
          //   position = position + 2.0 * cross( instanceQuaternion.xyz, cross( instanceQuaternion.xyz, position ) + instanceQuaternion.w * position );

          //   //position = vcV * ( 2.0 * instanceQuaternion.w ) + ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + position );

          //   position += instanceOffset;

          //   return position;
          // }

          vec3 applyTRS( vec3 position, vec3 translation, vec4 quaternion, vec3 scale ) {
            position *= scale;
            position += 2.0 * cross( quaternion.xyz, cross( quaternion.xyz, position ) + quaternion.w * position );
            return position + translation;
          }
          
          void main() {
        `,
        );
      shader.fragmentShader = `#define DEPTH_PACKING 3201 \n ${shader.fragmentShader}`;
    }
  };

  overrideLogic = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <project_vertex>', OVERRIDE_PROJECT_VERTEX)
      .replace('#include <uv_vertex>',
        `
        #ifdef USE_UV
          // ! orig: //  vUv = ( uvTransform * vec3(uv, 1.0)).xy;
          vUv = ( uvTransform * vec3( uv.x * 0.5 + instanceMapUV.x, uv.y * 0.5 + instanceMapUV.y, 1 ) ).xy ;
        #endif
      `);
  };
}

/*
        // if applying instanceQuaternion
        // vec3 getInstancePosition(vec3 position) {
        //   position *= instanceScale;
        //   vec4 instanceQuaternion = vec4(0, 0, 0, 1);
        //   vec3 vcV = cross( instanceQuaternion.xyz, position );
        //   position = vcV * ( 2.0 * instanceQuaternion.w ) +
        // ( cross( instanceQuaternion.xyz, vcV ) * 2.0 + position );
        //   position += instanceOffset;

        //   return position;
        // }
*/