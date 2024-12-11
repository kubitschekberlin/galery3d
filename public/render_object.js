import {
  Vector3,
  ArrowHelper,
  Object3D,
  MeshLambertMaterial,
  MeshBasicMaterial,
  Mesh,
  BoxGeometry,
  TextureLoader,
  SphereGeometry

} from 'three';

import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export class CoordinateArrows {
  constructor(parent, position, length = 1.5) {
    this.arrows = [];

    const directions = [
      { dir: new Vector3(1, 0, 0), color: 0xFF0000 },
      { dir: new Vector3(0, 1, 0), color: 0x00FF00 },
      { dir: new Vector3(0, 0, 1), color: 0x0000FF }
    ];
    const origin = position ? position.negate() : new Vector3(0, 0, 0);
    directions.forEach((dir, index) => {
      this.arrows[index] = new ArrowHelper(dir.dir, origin, length, dir.color, 0.05, 0.05);
      if (parent) {
        parent.add(this.arrows[index]);
      }
    });

  }

  add = (parent) => {
    const initArrow = (arrow, parent) => {
      const a = [arrow, ...arrow.children];
      a.forEach((object, index) => {
        object.name = `Arrow ${index}`;
      });
    }
    this.arrows.forEach((arrow) => {
      parent.add(arrow);
      initArrow(arrow, parent);
    });
  }

  remove = () => {
    this.arrows.forEach((arrow) => {
      arrow.dispose();
    });
  }
}

export class RenderObject {
  constructor(parent) {
    this.texture = undefined;
    this.parent = parent;
    this.material = this.create_material();
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

  create_material() {
    return new MeshLambertMaterial({ color: 0xffffff/*, wireframe: true*/ });
  }

  createArrows(object) {
    new CoordinateArrows(object);
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
      mesh = new Mesh(geometry, this.material);
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
    super.createArrows(mesh);
    mesh.canSelect = true;
  }
}

export class RenderHorizonSphere extends RenderObject {
  constructor(parent, image) {
    super(parent);
    const loader = new TextureLoader();
    this.texture = loader.load(image);
    const geometry = new SphereGeometry(10, 10, 10);
    const sphere = new Mesh(geometry, this.material);
    sphere.name = image;
    sphere.name = 'Sphere';
    parent.add(sphere);
    super.createArrows(sphere);
    sphere.canSelect = true;
  }

  create_material = () => {
    return new MeshLambertMaterial({ map: this.texture });
  }
}

export class RenderCube extends RenderObject {
  constructor(parent, renderer, image) {// Textur laden 
    super(parent);
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(image);
    // Geometrie und Material mit Textur erstellen 
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({ map: texture });
    const cube = new Mesh(geometry, material);
    cube.name = 'Zebra';
    parent.add(cube);
    super.createArrows(cube);
    cube.canSelect = true;
  }
}

