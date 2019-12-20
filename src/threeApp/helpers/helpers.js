import * as THREE from 'three';

export const promisifyLoader = (loader, onProgress) => {

  const promiseLoader = url => {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, onProgress, reject);
    });
  }
  return {
    originalLoader: loader,
    load: promiseLoader,
  };
}

export const klein = ( v, u, optionalTarget ) => {

  var result = optionalTarget || new THREE.Vector3();

  u *= Math.PI;
  v *= 2 * Math.PI;

  u = u * 2;
  var x, y, z;
  if ( u < Math.PI ) {

    x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( u ) * Math.cos( v );
    z = - 8 * Math.sin( u ) - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( u ) * Math.cos( v );

  } else {

    x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( v + Math.PI );
    z = - 8 * Math.sin( u );

  }

  y = - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( v );

  return result.set( x, y, z );

}

export const rand = ( v ) => {
  return (v * (Math.random() - 0.5));
}

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}