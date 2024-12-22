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
    const global = new Matrix4().makeRotationAxis(this._rotation.axis, -angle);
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
    let trans = this._translation.axis.clone().multiplyScalar(-dist);
    object.position.add(trans);
  }
}