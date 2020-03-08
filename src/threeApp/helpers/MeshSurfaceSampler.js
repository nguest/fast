/**
 * @author donmccurdy / https://www.donmccurdy.com/
 */

import {
  Triangle,
} from 'three';

/**
 * Utility class for sampling weighted random points on the surface of a mesh.
 *
 * Building the sampler is a one-time O(n) operation. Once built, any number of
 * random samples may be selected in O(logn) time. Memory usage is O(n).
 *
 * References:
 * - http://www.joesfer.com/?p=84
 * - https://stackoverflow.com/a/4322940/1314762
 */
export const MeshSurfaceSampler = (function () {
  const face = new Triangle();

  function MeshSurfaceSampler(mesh, uv) {
    let { geometry } = mesh;
    this.uv = uv;

    if (!geometry.isBufferGeometry || geometry.attributes.position.itemSize !== 3) {
      throw new Error('THREE.MeshSurfaceSampler: Requires BufferGeometry triangle mesh.');
    }

    if (geometry.index) {
      console.warn('THREE.MeshSurfaceSampler: Converting geometry to non-indexed BufferGeometry.');

      geometry = geometry.toNonIndexed();
    }

    this.geometry = geometry;

    this.positionAttribute = this.geometry.getAttribute('position');
    this.weightAttribute = null;

    this.distribution = null;
  }

  MeshSurfaceSampler.prototype = {

    constructor: MeshSurfaceSampler,

    setWeightAttribute(name) {
      this.weightAttribute = name ? this.geometry.getAttribute(name) : null;

      return this;
    },

    build() {
      const { positionAttribute } = this;
      const { weightAttribute } = this;

      const faceWeights = new Float32Array(positionAttribute.count / 3);

      // Accumulate weights for each mesh face.

      for (let i = 0; i < positionAttribute.count; i += 3) {
        let faceWeight = 1;

        if (weightAttribute) {
          faceWeight = weightAttribute.getX(i)
            + weightAttribute.getX(i + 1)
            + weightAttribute.getX(i + 2);
        }

        face.a.fromBufferAttribute(positionAttribute, i);
        face.b.fromBufferAttribute(positionAttribute, i + 1);
        face.c.fromBufferAttribute(positionAttribute, i + 2);
        faceWeight *= face.getArea();

        faceWeights[i / 3] = faceWeight;
      }

      // Store cumulative total face weights in an array, where weight index
      // corresponds to face index.

      this.distribution = new Float32Array(positionAttribute.count / 3);

      let cumulativeTotal = 0;

      for (let i = 0; i < faceWeights.length; i++) {
        cumulativeTotal += faceWeights[i];

        this.distribution[i] = cumulativeTotal;
      }

      return this;
    },

    sample(targetPosition, targetNormal) {
      const cumulativeTotal = this.distribution[this.distribution.length - 1];

      const faceIndex = this.binarySearch(Math.random() * cumulativeTotal);

      return this.sampleFace(faceIndex, targetPosition, targetNormal);
    },

    binarySearch(x) {
      const dist = this.distribution;
      let start = 0;
      let end = dist.length - 1;

      let index = -1;

      while (start <= end) {
        const mid = Math.floor((start + end) / 2);

        if ((mid === 0 || dist[mid - 1]) <= x && dist[mid] > x) {
          index = mid;

          break;
        } else if (x < dist[mid]) {
          end = mid - 1;
        } else {
          start = mid + 1;
        }
      }

      return index;
    },

    sampleFace(faceIndex, targetPosition, targetNormal) {
      let u = (this.uv && this.uv.u) || Math.random();
      let v = (this.uv && this.uv.v) || Math.random();

      // if (u + v > 1) {
      //   u = 1 - u;
      //   v = 1 - v;
      // }

      face.a.fromBufferAttribute(this.positionAttribute, faceIndex * 3);
      face.b.fromBufferAttribute(this.positionAttribute, faceIndex * 3 + 1);
      face.c.fromBufferAttribute(this.positionAttribute, faceIndex * 3 + 2);

      targetPosition
        .set(0, 0, 0)
        .addScaledVector(face.a, u)
        .addScaledVector(face.b, v)
        .addScaledVector(face.c, 1 - (u + v));

      face.getNormal(targetNormal);

      return this;
    },

  };

  return MeshSurfaceSampler;
}());
