import {
  Vector3,
  Matrix3,
  Matrix4,
  Quaternion
} from 'three';
import { ObjectNavigator } from './object_navigator.js';

export class CameraNavigator extends ObjectNavigator {

  rotateWithShift = (shift) => {
    return !shift;
  }

  
  viewMatrix(camera) {
    const viewMatrix = new Matrix4();
    viewMatrix.copy(camera.matrixWorld);
    return viewMatrix;
  }

  applyRotation = (selected, camera, diff) => {
    const abs = Math.abs;
    if (!this._rotation) {
      console.log('Camera Rotation');
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
    //console.log('Before:', selected.position);
    const angle = this._rotation.vertical ? diff.y : diff.x;
    const global = new Matrix4().makeRotationAxis(this._rotation.axis, angle);
    const matrix = selected.matrix.clone();
    const newMatrix = new Matrix4().multiplyMatrices(global, matrix);
    let v = new Vector3(), q = new Quaternion(), d = new Vector3();
    newMatrix.decompose(v, q, d);
    camera.position.copy(v);
    camera.quaternion.copy(q);
    //console.log('Axis:', this._rotation.axis, 'Angle:', angle, this._rotation.vertical, 'After:', selected.position);
  }

  applyTranslation = (selected, camera, diff) => {
    if (!this._translation) {
      console.log('Camera Translation');
      const abs = Math.abs;
      const dir = super.globalProjections(camera, selected);
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
    const object = camera;
    let trans = this._translation.axis.clone().multiplyScalar(dist);
    object.position.add(trans);
  }
}