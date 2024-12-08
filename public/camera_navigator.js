import {
  Vector3,
  Quaternion
} from 'three';
import { ObjectNavigator } from './object_navigator.js';

export class CameraNavigator extends ObjectNavigator {

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

    const angle = this._rotation.vertical ? diff.y : diff.x;
    const object = camera.parent;
    const position = new Vector3();
    object.getWorldPosition(position);
    const quaternion = new Quaternion();
    quaternion.setFromAxisAngle(this._rotation.axis, angle);
    position.applyQuaternion(quaternion);
    object.position.copy(position);
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
    const object = camera.parent;
    let trans = this._translation.axis.clone().multiplyScalar(-dist);
    object.position.add(trans);
  }

}