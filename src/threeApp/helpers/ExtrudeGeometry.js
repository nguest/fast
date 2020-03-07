/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Creates extruded geometry from a path shape.
 *
 * parameters = {
 *
 *  curveSegments: <int>, // number of points on the curves
 *  steps: <int>, // number of points for z-side extrusions / used for subdividing segments of extrude spline too
 *  depth: <float>, // Depth to extrude the shape
 *
 *  extrudePath: <THREE.Curve> // curve to extrude shape along
 *
 *  UVGenerator: <Object> // object that provides UV generator functions
 *
 * }
 */

import { Geometry, BufferGeometry, Float32BufferAttribute, Vector2, Vector3, ShapeUtils } from 'three';
import { computeFrenetFrames, getSpacedPoints } from './curveHelpers';

// ExtrudeGeometry

function ExtrudeGeometry(shapes, options) {
  Geometry.call(this);

  this.type = 'ExtrudeGeometry';

  this.parameters = {
    shapes,
    options,
  };

  this.fromBufferGeometry(new ExtrudeBufferGeometry(shapes, options));
  this.mergeVertices();
}

ExtrudeGeometry.prototype = Object.create(Geometry.prototype);
ExtrudeGeometry.prototype.constructor = ExtrudeGeometry;

// ExtrudeBufferGeometry

function ExtrudeBufferGeometry(shapes, options) {
  BufferGeometry.call(this);

  this.type = 'ExtrudeBufferGeometry';

  this.parameters = {
    shapes,
    options,
  };

  shapes = Array.isArray(shapes) ? shapes : [shapes];
  const scope = this;

  const verticesArray = [];
  const uvArray = [];

  for (let i = 0, l = shapes.length; i < l; i++) {
    const shape = shapes[i];
    addShape(shape);
  }

  // build geometry

  this.setAttribute('position', new Float32BufferAttribute(verticesArray, 3));
  this.setAttribute('uv', new Float32BufferAttribute(uvArray, 2));

  this.computeVertexNormals();

  // functions

  function addShape(shape) {
    const placeholder = [];

    // options

    const curveSegments = options.curveSegments !== undefined ? options.curveSegments : 12;
    const steps = options.steps !== undefined ? options.steps : 1;
    const autoCloseShape = options.autoCloseShape !== undefined ? options.autoCloseShape : false;
    const widthFactor = options.widthFactor !== undefined ? options.widthFactor : 1;
    const includeSegments = options.includeSegments !== undefined ? options.includeSegments : [[0, 1]];

    const { extrudePath } = options;

    const uvgen = options.UVGenerator !== undefined ? options.UVGenerator : WorldUVGenerator;
    //
    const extrudePts = getSpacedPoints(extrudePath, steps);
    // SETUP TNB variables

    const splineTube = computeFrenetFrames(extrudePath, steps, false); // custom computeFrenetFrames

    const binormal = new Vector3();
    const normal = new Vector3();
    const position2 = new Vector3();


    // Variables initialization

    let ahole;
    let h;
    let hl; // looping of holes

    const shapePoints = shape.extractPoints(curveSegments);

    let vertices = shapePoints.shape;
    const { holes } = shapePoints;

    const reverse = !ShapeUtils.isClockWise(vertices);
    if (reverse) vertices = vertices.reverse();

    /* Vertices */

    const contour = vertices; // vertices has all points but contour has only points of circumferenc
    let vert;
    const vlen = vertices.length;

    // Back facing vertices
    for (let i = 0; i < vlen; i++) {
      vert = vertices[i];

      // v( vert.x, vert.y + extrudePts[ 0 ].y, extrudePts[ 0 ].x );

      normal.copy(splineTube.normals[0]).multiplyScalar(vert.x);
      binormal.copy(splineTube.binormals[0]).multiplyScalar(vert.y);

      position2.copy(extrudePts[0]).add(normal).add(binormal);

      v(position2.x, position2.y, position2.z);
    }

    // Add stepped vertices...
    // Including front facing vertices

    for (let s = 1; s <= steps; s++) {
      for (let i = 0; i < vlen; i++) {
        vert = vertices[i];

        // v( vert.x, vert.y + extrudePts[ s - 1 ].y, extrudePts[ s - 1 ].x );
        // get extrusion widthFactor and multiply vert.x
        const w = widthFactor.length ? widthFactor[s].x : widthFactor;

        normal.copy(splineTube.normals[s]).multiplyScalar(vert.x); // (vert.x * w) for withh factor
        binormal.copy(splineTube.binormals[s]).multiplyScalar(vert.y);

        position2.copy(extrudePts[s]).add(normal).add(binormal);

        v(position2.x, position2.y + Math.random() * 0.02, position2.z);

        //}
      }
    }


    /* Faces */
    // Sides faces

    buildSideFaces();

    function buildSideFaces() {
      const start = verticesArray.length / 3;
      let layeroffset = 0;
      sidewalls(contour, layeroffset);
      layeroffset += contour.length;

      for (h = 0, hl = holes.length; h < hl; h++) {
        ahole = holes[h];
        sidewalls(ahole, layeroffset);

        // , true
        layeroffset += ahole.length;
      }

      scope.addGroup(start, verticesArray.length / 3 - start, 1);
    }

    function sidewalls(contour, layeroffset) {
      let j; let k;
      let i = contour.length;

      const x = autoCloseShape ? 0 : 1;

      while (--i >= x) {
        j = i;
        k = i - 1;
        if (k < 0) k = contour.length - 1;

        // console.log('b', i,j, i-1, k,vertices.length);

        // let s = 0;
        // const sl = steps + bevelSegments * 2;

        for (let i = 0; i < includeSegments.length; i++) {
          const segStart = parseInt(includeSegments[i][0] * steps, 10);
          const segEnd = parseInt(includeSegments[i][1] * steps, 10);

          for (let s = segStart; s < segEnd; s++) {
            const slen1 = vlen * s;
            const slen2 = vlen * (s + 1);
            const a = layeroffset + j + slen1;
            const b = layeroffset + k + slen1;
            const c = layeroffset + k + slen2;
            const d = layeroffset + j + slen2;

            f4(a, b, c, d);
          }
        }
        // all segments
        // for (s = 0; s < sl; s++) {
        //   const slen1 = vlen * s;
        //   const slen2 = vlen * (s + 1);
        //   const a = layeroffset + j + slen1;
        //   const b = layeroffset + k + slen1;
        //   const c = layeroffset + k + slen2;
        //   const d = layeroffset + j + slen2;

        //   f4(a, b, c, d);
        // }
      }
    }

    function v(x, y, z) {
      placeholder.push(x);
      placeholder.push(y);
      placeholder.push(z);
    }

    function f4(a, b, c, d) {
      addVertex(a);
      addVertex(b);
      addVertex(d);

      addVertex(b);
      addVertex(c);
      addVertex(d);

      const nextIndex = verticesArray.length / 3;
      const uvs = uvgen.generateSideWallUV(
        scope, verticesArray, nextIndex - 6, nextIndex - 3, nextIndex - 2, nextIndex - 1
      );

      addUV(uvs[0]);
      addUV(uvs[1]);
      addUV(uvs[3]);

      addUV(uvs[1]);
      addUV(uvs[2]);
      addUV(uvs[3]);
    }

    function addVertex(index) {
      verticesArray.push(placeholder[index * 3 + 0]);
      verticesArray.push(placeholder[index * 3 + 1]);
      verticesArray.push(placeholder[index * 3 + 2]);
    }


    function addUV(vector2) {
      uvArray.push(vector2.x);
      uvArray.push(vector2.y);
    }
  }
}

ExtrudeBufferGeometry.prototype = Object.create(BufferGeometry.prototype);
ExtrudeBufferGeometry.prototype.constructor = ExtrudeBufferGeometry;

// ---------------------------------------------- //

const WorldUVGenerator = {

  generateTopUV(geometry, vertices, indexA, indexB, indexC) {
    const ax = vertices[indexA * 3];
    const ay = vertices[indexA * 3 + 1];
    const bx = vertices[indexB * 3];
    const by = vertices[indexB * 3 + 1];
    const cx = vertices[indexC * 3];
    const cy = vertices[indexC * 3 + 1];

    return [
      new Vector2(ax, ay),
      new Vector2(bx, by),
      new Vector2(cx, cy),
    ];
  },

  generateSideWallUV(geometry, vertices, indexA, indexB, indexC, indexD) {
    const ax = vertices[indexA * 3];
    const ay = vertices[indexA * 3 + 1];
    const az = vertices[indexA * 3 + 2];
    const bx = vertices[indexB * 3];
    const by = vertices[indexB * 3 + 1];
    const bz = vertices[indexB * 3 + 2];
    const cx = vertices[indexC * 3];
    const cy = vertices[indexC * 3 + 1];
    const cz = vertices[indexC * 3 + 2];
    const dx = vertices[indexD * 3];
    const dy = vertices[indexD * 3 + 1];
    const dz = vertices[indexD * 3 + 2];

    // if (Math.abs(a_y - b_y) < 0.01) {
    return [
      new Vector2(ax, 1 - az).multiplyScalar(0.2),
      new Vector2(bx, 1 - bz).multiplyScalar(0.2),
      new Vector2(cx, 1 - cz).multiplyScalar(0.2),
      new Vector2(dx, 1 - dz).multiplyScalar(0.2),
    ];
    //}

    // return [
    //   new Vector2(a_y, 1 - a_z),
    //   new Vector2(b_y, 1 - b_z),
    //   new Vector2(c_y, 1 - c_z),
    //   new Vector2(d_y, 1 - d_z),
    // ];
  },
};


export { ExtrudeGeometry, ExtrudeBufferGeometry };
