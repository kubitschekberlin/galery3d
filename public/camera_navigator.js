import {
  Vector3,
  Matrix3,
  Matrix4,
  Quaternion,
  PerspectiveCamera
} from 'three';
import { ObjectNavigator } from './object_navigator.js';
import { Events3D } from './events_3d.js';

export class CameraNavigator extends ObjectNavigator {

  constructor(camera) {
    super();

    camera.name = 'Camera';

    camera.reset_camera = () => {
      camera.position.copy(PerspectiveCamera.defaults.position);
      camera.zoom = 1;
      camera.fov = PerspectiveCamera.defaults.fov;
      camera.lookAt(0, 0, 0);
      Events3D.numberChanged();
    };
    
    $('.js-action-button[data-object="camera"]').on('click', (event) => {
      const $button = $(event.target),
        service = $button.data('function');
      camera[service]();
      Events3D.numberChanged();
    });

    // Füge einen Event Listener für das Mausrad-Ereignis hinzu
    window.addEventListener('wheel', function (event) {
      if (event.deltaY > 0) {
        camera.zoom += 0.01; // Zoom heraus
      } else {
        camera.zoom -= 0.01; // Zoom hinein
      }
      if(camera.zoom < 0.01){
        camera.zoom = 0.01;
      }
      camera.updateProjectionMatrix();
      Events3D.numberChanged();
    });
  }

  rotateWithShift = (shift) => {
    return !shift;
  }

  rotateWithCtrl = (ctrl) => {
    return ctrl;
  }

  applyZRotation = (selected, camera, diff, event) => {
    const abs = Math.abs;
    console.log('Camera Z Rotation');
    const dir = this.globalProjections(camera, selected);
    const v = new Vector3(0, 0, 1);
    const a = this.directionProjections(v, dir),
      bx = abs(a.x), by = abs(a.y), bz = abs(a.z);
    let axis = new Vector3(0, 0, 1)
    if (bx >= by && bx >= bz) {
      axis.set(1, 0, 0);
    } else if (by >= bx && by >= bz) {
      axis.set(0, 1, 0);
    }
    this.rotate(selected, axis, 0.1); //-angle);
    console.log('applyZRotation', angle);
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
    let angle = this._rotation.vertical ? diff.y : diff.x;
    angle = angle * Math.PI / 180;
    this.rotate(camera, this._rotation.axis, -angle);
  }

  rotate = (camera, axis, angle) => {
    const global = new Matrix4().makeRotationAxis(axis, -angle);
    const matrix = camera.matrix.clone();
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
    let trans = this._translation.axis.clone().multiplyScalar(-dist);
    object.position.add(trans);
  }
}