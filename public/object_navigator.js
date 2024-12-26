import {
  Vector3,
  Matrix4,
  Matrix3
} from 'three';
import { Events3D } from './events_3d.js';

function signed (a) {
  return a >= 0 ? 1 : -1;
}

export class ObjectNavigator {
  #domElement;

  constructor() {
    // Wir merken uns die Bewegungsrichtungen während der Navigation. Hier setzten wir sie 
    // initial zurück:
    const onPointerUp = (_event) => {
      if (this.#domElement) {
        this.#domElement.style = '';
      }
      this._translation = null;
      this._rotation = null;
      //console.log('Objet Navigator Neustart')
    }
    window.addEventListener('pointerup', onPointerUp);
  }

  rotateWithShift = (shift) => {
    return shift;
  }

  navigate = (selected, camera, diff, event) => {
    if(Math.abs(diff.x) < 1e-3 && Math.abs(diff.y) < 1e-3){
      return;
    }

    const scope = this;
    // Cursor steuern.
    let domElement = event.target;
    const setTranslationCursor = () => {
      if (domElement) {
        domElement.style.cursor = 'move';
      }
    }
    const setRotationCursor = () => {
      if (domElement) {
        domElement.style.cursor = scope._rotation.vertical ? 'ns-resize' : 'ew-resize';
      }
    }

    // das passiert in dieser Funktion:
    this.#domElement = domElement;
    if (this.rotateWithShift(event.shiftKey)) {
      this.applyRotation(selected, camera, diff);
      setRotationCursor();
    } else {
      this.applyTranslation(selected, camera, diff);
      setTranslationCursor();
    }

    // sync dislogs
    Events3D.numberChanged();
  }

  viewMatrix(camera){
    const viewMatrix = new Matrix4();
    viewMatrix.copy(camera.matrixWorldInverse);
    return viewMatrix;
  }

  // Projektion der Objectachsen auf den View  
  globalProjections(camera, object) {
    // View-Matrix (inverse Weltmatrix der Kamera)
    const viewMatrix = this.viewMatrix(camera);

    // Projektionsmatrix der Kamera
    const projectionMatrix = camera.projectionMatrix;

    // Kombinierte Transformationsmatrix
    const viewProjectionMatrix = new Matrix4();
    viewProjectionMatrix.multiplyMatrices(projectionMatrix, viewMatrix);

    // Weltmatrix des Objekts
    const worldMatrix = object.matrixWorld;

    // Kombinierte Matrix
    const finalMatrix = new Matrix4();
    finalMatrix.multiplyMatrices(viewProjectionMatrix, worldMatrix);

    const x = new Vector3,
      y = new Vector3,
      z = new Vector3;
    finalMatrix.extractBasis(x, y, z);

    return { x: x, y: y, z: z };
  }

  directionProjections(axis, dir) {
    return { x: axis.dot(dir.x), y: axis.dot(dir.y), z: axis.dot(dir.z) };
  }

  verticalMainAxis(dir, forTranslation) {
    const abs = Math.abs;
    const v = forTranslation ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0);
    const a = this.directionProjections(v, dir),
      bx = abs(a.x), by = abs(a.y), bz = abs(a.z);
    let axis = 2;
    if (bx >= by && bx >= bz) {
      axis = 0;
    } else if (by >= bx && by >= bz) {
      axis = 1;
    }
    console.log('Vertical', 'x:', dir.x, 'y:', dir.y, 'z:', dir.z, 'Result:', axis, a);
    return { axis: axis, projections: a };
  }

  horizontalMainAxis(dir, forTranslation) {
    const abs = Math.abs;
    const v = forTranslation ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
    const a = this.directionProjections(v, dir),
      bx = abs(a.x), by = abs(a.y), bz = abs(a.z);
    let axis = 2;
    if (by >= bz && by >= bx) {
      axis = 1;
    } else if (bx >= by && bx >= bz) {
      axis = 0;
    }
    console.log('Horizontal', 'x:', dir.x, 'y:', dir.y, 'z:', dir.z, 'Result:', axis, a);
    return { axis: axis, projections: a };
  }

  verticalRotationAxis(dir) {
    const d = this.verticalMainAxis(dir),
      a = d.projections;
    let axis = null;
    if (d.axis === 0) {
      axis = new Vector3(signed(a.x), 0, 0);
    } else if (d.axis === 1) {
      axis = new Vector3(0, signed(a.y), 0);
    } else {
      axis = new Vector3(0, 0, signed(a.z));
    }
    return axis;
  }

  horizontalRotationAxis(dir) {
    const d = this.horizontalMainAxis(dir),
      a = d.projections;
    let axis = null;
    if (d.axis === 0) {
      axis = new Vector3(signed(a.x), 0, 0);
    } else if (d.axis == 0) {
      axis = new Vector3(0, signed(a.y), 0);
    } else {
      axis = new Vector3(0, 0, signed(a.z));
    }
    return axis;
  }

  verticalTranslationAxis(dir) {
    const d = this.verticalMainAxis(dir, true),
      a = d.projections;
    let axis = null;
    if (d.axis === 0) {
      axis = new Vector3(signed(a.x), 0, 0);
    } else if (d.axis === 1) {
      axis = new Vector3(0, signed(a.y), 0);
    } else {
      axis = new Vector3(0, 0, signed(a.z));
    }
    return axis;
  }

  horizontalTranslationAxis(dir) {
    const d = this.horizontalMainAxis(dir, true),
      a = d.projections;
    let axis = null;
    if (d.axis === 0) {
      axis = new Vector3(signed(a.x), 0, 0);
    } else if (d.axis == 1) {
      axis = new Vector3(0, signed(a.y), 0);
    } else {
      axis = new Vector3(0, 0, signed(a.z));
    }
    return axis;
  }

  applyRotation = (selected, camera, diff) => {
    if (!this._rotation) {
      console.log('Object Rotation');
      const abs = Math.abs;
      const dir = this.globalProjections(camera, selected);
      let vertical = abs(diff.y) > abs(diff.x);
      let axis = null;

      if (vertical) {
        axis = this.verticalRotationAxis(dir);
      }
      else {
        axis = this.horizontalRotationAxis(dir);
      }
      this._rotation = { axis: axis, vertical: vertical };
    }
    let angle = this._rotation.vertical ? diff.y : diff.x;

    //console.log('Rotation', angle, this._rotatio.axis, 'Vertical:', this._rotation.vertical);
    selected.rotateOnAxis(this._rotation.axis, angle * 10); // * Math.PI / 180);
  }

  applyTranslation = (selected, camera, diff) => {
    if (!this._translation) {
      console.log('Object Translation');
      const abs = Math.abs;
      const dir = this.globalProjections(camera, selected);
      let vertical = abs(diff.y) > abs(diff.x);
      let axis = null;

      if (vertical) {
        axis = this.verticalTranslationAxis(dir);
      }
      else {
        axis = this.horizontalTranslationAxis(dir);
      }
      this._translation = { axis: axis, vertical: vertical };
    }
    const dist = this._translation.vertical ? diff.y : diff.x;

    //console.log('Translation', dist, this._translation.axis, 'Vertical:', this._translation.vertical );
    const mat = new Matrix3().setFromMatrix4(selected.matrixWorld);
    let trans = this._translation.axis.clone().multiplyScalar(dist * 100);
    trans.applyMatrix3(mat);
    selected.position.add(trans);
  }

}
