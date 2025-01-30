import {
  Vector3,
  Object3D,
  MeshPhysicalMaterial,
  Mesh,
  BoxGeometry,
  TextureLoader,
  SphereGeometry,
  DoubleSide,
  AxesHelper
} from 'three';

import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

var _materials = {}

function arrayBufferToString(buffer) {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(buffer);
}

export class RenderObject {
  constructor(parent) {
    this.parent = parent;
  }

  materials(name) {
    if(name && _materials && _materials[name]){
      _materials[name].side = DoubleSide;
      return _materials[name];
    }
    return new MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 1,
      metalness: 0.2,
      side: DoubleSide
    });
  }

  getArrows() {
    return this._arrows;
  }

  remove(object) {
    if (!(object instanceof Object3D)) return false;
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
    this._arrows.remove();
    this.parent.remove(object);
  };

  createArrows(object) {
    const arrows = new AxesHelper(500);
    arrows.name = 'Axes Helper';
    object.add(arrows);
  }
}

export class RenderMesh extends RenderObject {
  constructor(parent, type, file, success) {
    super(parent);
    var loader;

    if(type === 'MTL'){
      const materials = new MTLLoader().parse(arrayBufferToString(file));
      materials.preload();
      Object.assign(_materials, materials.materials); 
      return;
    } else if (type === 'STL') {
      loader = new STLLoader();
    } else if (type == 'OBJ') {
      loader = new OBJLoader();
    } else if (type === 'PLY') {
      loader = new PLYLoader();
    } else {
      throw 'Invalid 3D format;'
    }
    
    const onProgress = () => console.log('Lade', file);
    const onError = () => console.log('Fehler beim Laden von', file);

    const addToScene = (object) => {
      if(object.isObject3D) {
        object.traverse((child) => {
          if (child instanceof Mesh) {
            child.material = this.materials(child.material.name);
          }
          if(!child.name){
            child.name = 'Child Object';
          }
        });
        if(!object.name){
          object.name = type;
        }
        parent.add(object);
      } else {
        const material =  this.materials();
        const geometry = object
        object = new Mesh(geometry, material);
        object.name = type;
        parent.add(object);
      }
      if (success) {
        success();
      }
      return object;
    }
    var mesh;
    try {
      if (typeof (file) === 'string') {
        loader.load(file, onLoad, onProgress, onError);
      } else {
        if(type === 'OBJ'){
          file = arrayBufferToString(file);
        }
        const object = loader.parse(file);
        mesh = addToScene(object);
      }
      super.createArrows(mesh);
      mesh.canSelect = true;
    } catch (error) {
      console.log(error);
    }
  }
}

export class RenderHorizonSphere extends RenderObject {
  constructor(parent, image) {
    super(parent);
    const loader = new TextureLoader();
    const texture = loader.load(image);
    const geometry = new SphereGeometry(20, 30, 30);
    const material = new MeshPhysicalMaterial({ map: texture, side: DoubleSide})
    const sphere = new Mesh(geometry, material);
    sphere.name = image;
    sphere.name = 'Sphere';
    parent.add(sphere);
    super.createArrows(sphere);
    sphere.canSelect = true;
  }
}

export class RenderCube extends RenderObject {
  constructor(parent, renderer, image) {// Textur laden 
    super(parent);
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(image);
    // Geometrie und Material mit Textur erstellen 
    const geometry = new BoxGeometry();
    const materials = [
      new MeshPhysicalMaterial({ color: 0xff0000 }), // Material für Seite 0 (rot)
      new MeshPhysicalMaterial({ color: 0x00ff00 }), // Material für Seite 1 (grün)
      new MeshPhysicalMaterial({ color: 0x0000ff }), // Material für Seite 2 (blau)
      new MeshPhysicalMaterial({ color: 0x00ffff }), // Material für Seite 3 
      new MeshPhysicalMaterial({ map: texture }),
      new MeshPhysicalMaterial({ color: 0xffff00 }), // Material für Seite 5 (gelb)
    ];
    const cube = new Mesh(geometry, materials);
    cube.name = 'Zebra';
    parent.add(cube);
    super.createArrows(cube);
    cube.canSelect = true;
  }
}

