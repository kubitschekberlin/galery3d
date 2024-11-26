import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

export class RenderObject {
  constructor(parent) {
    this.texture = undefined;
    this.parent = parent;
    this.material = this.create_material();
  }

  remove = (object) => {
    if (!(object instanceof THREE.Object3D)) return false;
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (object.material instanceof Array) {
        object.material.forEach(material => material.dispose());
      } else {
        object.material.dispose();
      }
    }
    parent.remove(object);
  };

  create_material = () => {
    return new THREE.MeshLambertMaterial({ color: 0xffffff/*, wireframe: true*/ });
  }
}

export class RenderMesh extends RenderObject {
  constructor(parent, type, file, success) {
    super(parent);
    var loader;

    if (type === 'STL') {
      loader = new STLLoader();
    } else if (type == 'OBJ') {
      loader = new OBJLoader();
    } else if (type === 'PLY') {
      loader = new PLYLoader();
    } else {
      throw 'Invalid 3D format;'
    }

    const onLoad = (geometry) => {
      geometry.scale(0.01, 0.01, 0.01);
      mesh = new THREE.Mesh(geometry, this.material);
      parent.add(mesh);
      if (success) {
        success();
      }
    }
    const onProgress = () => console.log('Lade', file);
    const onError = () => console.log('Fehler beim Laden von', file);

    var mesh;
    try {
      if (typeof (file) === 'string') {
        loader.load(file, onLoad, onProgress, onError);
      } else {
        onLoad(loader.parse(file));
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export class RenderHorizonSphere extends RenderObject {
  constructor(parent, image) {
    super(parent);
    const loader = new THREE.TextureLoader();
    this.texture = loader.load(image);
    const geometry = new THREE.SphereGeometry(10, 10, 10);
    const sphere = new THREE.Mesh(geometry, this.material);
    sphere.name = image;
    sphere.name = 'Sphere';
    parent.add(sphere);
  }

  create_material = () => {
    return new THREE.MeshLambertMaterial({ map: this.texture });
  }
}

export class RenderCube extends RenderObject {
  constructor(parent, renderer, image) {// Textur laden 
    super(parent);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(image);
    // Geometrie und Material mit Textur erstellen 
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    cube.name = 'Zebra';
    parent.add(cube);

    // DragControls hinzufügen 
    const dragControls = new DragControls([cube], renderer.camera, renderer.domElement); 
    dragControls.addEventListener('dragstart', function (event) { 
      renderer.controls.enabled = false; 
    }); 
    dragControls.addEventListener('dragend', function (event) { 
      renderer.controls.enabled = true; 
    });
  }
}

