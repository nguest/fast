import * as THREE from 'three';

export const createSkyBoxFrom4x3 = ({ scene, boxDimension, image, tileSize = 1024, manager }) => {
  /* adapted from https://stackoverflow.com/questions/25193649/make-three-js-skybox-from-tilemap/25224912#25224912

  assume any source image is tiled 4 columns(x) by 3 rows(y)
  NB canvas origin is Top Left corner, X is left to right, Y is top to bottom

  We use the following mapping scheme to reference the tiles in the source image:-

  Personal             [x,y] tile coordinates    xyz positions            Required tile
  tile numbering                                 of tiles in scene        sequence in Three.js
                                                                          array

  [ 0] [ 3] [ 6] [ 9]  [0,0] [1,0] [2,0] [3,0]   [  ] [py] [  ] [  ]      [ ] [2] [ ] [ ]
  [ 1] [ 4] [ 7] [10]  [0,1] [1,1] [2,1] [3,1]   [nx] [pz] [px] [nz]      [1] [4] [0] [5]
  [ 2] [ 5] [ 8] [11]  [0,2] [1,2] [2,2] [3,2]   [  ] [ny] [  ] [  ]      [ ] [3] [ ] [ ]
  */

  const skyBoxGeometry = new THREE.SphereGeometry(boxDimension, 24, 12);
  const numCols = 4;
  const numRows = 3;

  const tileWidth = tileSize;
  const tileHeight = tileSize;
  // image is horizontal cross of 6 WYSIWYG tiles in a 4x3 = 12 tile layout.

  const imagePieces = [];

  for (let i = 0; i < numCols; ++i) {
    for (let j = 0; j < numRows; ++j) {
      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = tileWidth;
      tileCanvas.height = tileHeight;

      const tileContext = tileCanvas.getContext('2d');

      tileContext.drawImage(
        image,
        i * tileWidth,
        j * tileHeight,
        tileWidth,
        tileHeight,
        0,
        0,
        tileCanvas.width,
        tileCanvas.height,
      );

      imagePieces.push(tileCanvas.toDataURL());
    }
  }


  // Required sequence of tile view directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
  const imagePieceIdx = [7, 1, 5, 3, 4, 10]; // swap the y directions so .flipY works

  const loader = new THREE.CubeTextureLoader(manager);
  const skyBoxMaterialArray = loader.load(imagePieceIdx.map((idx) => imagePieces[idx]));
  skyBoxMaterialArray.minFilter = THREE.LinearFilter;
  skyBoxMaterialArray.flipY = true;

  const material = new THREE.MeshBasicMaterial({
    // color: 0xaaaabb,
    envMap: skyBoxMaterialArray,
    side: THREE.BackSide,
    fog: false,
    // flipY: true,
    // opacity: 0.5,
    // transparent: true,
    // blending: THREE.AdditiveBlending,
  });
  const skyBox = new THREE.Mesh(skyBoxGeometry, material);
  skyBox.name = 'SkyBox';
  skyBox.position.set(0, 0, 0);
  scene.add(skyBox);
  scene.environment = skyBoxMaterialArray;

  return skyBoxMaterialArray;
};
