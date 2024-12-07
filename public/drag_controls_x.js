import {
  EventDispatcher,
  Vector2,
} from 'three';
import { ObjectNavigator } from './object_navigator.js';

const _pointer = new Vector2();
const _diff = new Vector2();
const _previousPointer = new Vector2();

class DragControlsX extends EventDispatcher {

  constructor(_camera, _domElement) {

    super();
    const scope = this;
    const objectNavigator = new ObjectNavigator();
    _domElement.style.touchAction = 'none'; // disable touch scroll
    let selectedObjects = [],
      rotateSpeed = 1;

    function setSelectedObjects(objects) {
      selectedObjects = objects ? objects : [];
    }

    function activate() {
      _domElement.addEventListener('pointermove', onPointerMove);
      _domElement.addEventListener('pointerdown', onPointerDown);
      _domElement.addEventListener('pointerup', onPointerCancel);
      _domElement.addEventListener('pointerleave', onPointerCancel);
    }

    function deactivate() {
      _domElement.removeEventListener('pointermove', onPointerMove);
      _domElement.removeEventListener('pointerdown', onPointerDown);
      _domElement.removeEventListener('pointerup', onPointerCancel);
      _domElement.removeEventListener('pointerleave', onPointerCancel);

      _domElement.style.cursor = '';
    }

    function dispose() {

      deactivate();

    }

    function onPointerMove(event) {

      if (!scope.enabled) return;

      updatePointer(event);
      const selected = selectedObjects[0];
      if (selected) {
        _diff.subVectors(_pointer, _previousPointer).multiplyScalar(rotateSpeed);
        if (selected.navigator) {
          selected.navigator.navigate(selected, _camera, _diff, event);
        } else {
          objectNavigator.navigate(selected, _camera, _diff, event);
        }
      }
      _previousPointer.copy(_pointer);
    }

    function onPointerDown(event) {
      scope.dispatchEvent({ type: 'ds-down', event: event });
      scope.enabled = true;
      updatePointer(event);
      _previousPointer.copy(_pointer);
      
    }
    
    function onPointerCancel() {
      scope.enabled = false;
    }

    function updatePointer(event) {

      const rect = _domElement.getBoundingClientRect();

      _pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
      _pointer.y = - (event.clientY - rect.top) / rect.height * 2 + 1;

    }

    activate();

    // API

    this.enabled = false;
    this.activate = activate;
    this.deactivate = deactivate;
    this.dispose = dispose;
    this.setSelectedObjects = setSelectedObjects;
  }

}

export { DragControlsX };
