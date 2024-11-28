import {
  EventDispatcher,
  Matrix4,
  Plane,
  Raycaster,
  Vector2,
  Vector3
} from 'three';

const _plane = new Plane();
const _raycaster = new Raycaster();

const _pointer = new Vector2();
const _offset = new Vector3();
const _diff = new Vector2();
const _previousPointer = new Vector2();
const _intersection = new Vector3();
const _worldPosition = new Vector3();
const _inverseMatrix = new Matrix4();

const _up = new Vector3();
const _right = new Vector3();

class DragControlsX extends EventDispatcher {

  constructor(_objects, _camera, _domElement, mode) {

    super();

    _domElement.style.touchAction = 'none'; // disable touch scroll

    let _selected = null, _hovered = null;

    const _intersections = [];

    this.mode = mode;

    this.rotateSpeed = 1;

    //

    const scope = this;

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

    function getObjects() {

      return _objects;

    }

    function setObjects(objects) {

      _objects = objects;

    }

    function getRaycaster() {

      return _raycaster;

    }

    function getCameraDirections(camera) {
      // Z-Richtung (Blickrichtung) 
      let lookAtVector = new Vector3();
      camera.getWorldDirection(lookAtVector);
      //console.log('Blickrichtung (Z-Vektor):', lookAtVector);
      // Y-Richtung (Look-up) 
      let lookUpVector = new Vector3();
      camera.up.applyQuaternion(camera.quaternion);
      lookUpVector.copy(camera.up).normalize();
      //console.log('Look-Up (Y-Vektor):', lookUpVector);
      // X-Richtung (Look-right) 
      let lookRightVector = new Vector3();
      lookRightVector.crossVectors(lookAtVector, lookUpVector).normalize();
      //console.log('Look-Right (X-Vektor):', lookRightVector);
      return {
        x: lookRightVector,
        y: lookUpVector,
        z: lookAtVector
      };
    }

    function applyRotation(_selected, camera, diff) {
      const abs = Math.abs;
      let camDir = getCameraDirections(camera);
      let x = new Vector3(1, 0, 0).dot(camDir.x);
      let y = new Vector3(0, 1, 0).dot(camDir.y);
      let z = new Vector3(0, 0, 1).dot(camDir.z);
      let vertical = abs(diff.y) > abs(diff.x);
      let angle = vertical ? diff.y : diff.x;
      let axis = new Vector3;

      if (z >= x && z >= y) {
        if (x >= y) {
          if (vertical) {
            axis.set(1, 0, 0);
          } else {
            axis.set(0, 1, 0);
          }
        } else {
          if (vertical) {
            axis.set(1, 0, 0);
          } else {
            axis.set(0, 1, 0);
          }
        }
      } else if (y >= z && y >= x) {
        if (z >= x) {
          if (vertical) {
            axis.set(1, 0, 0);
          } else {
            axis.set(0, 1, 0);
          }
        } else {
          if (vertical) {
            axis.set(1, 0, 0);
          } else {
            axis.set(0, 1, 0);
          }
        }
      } else
      if (z > y) {
        if (vertical) {
          axis.set(1, 0, 0);
        } else {
          axis.set(0, 0, 1);
        }
      } else {
        if (vertical) {
          axis.set(1, 0, 0);
        } else {
          axis.set(0, 0, 1);
        }
      }
      console.log('x:', x, 'y:', y, 'z:', z, 'angle:', angle, 'vertical:', vertical, 'axis:', axis);
      _selected.rotateOnAxis(axis, angle * 10); // * Math.PI / 180);
    }
  
    function onPointerMove(event) {

      if (scope.enabled === false) return;

      updatePointer(event);

      _raycaster.setFromCamera(_pointer, _camera);

      if (_selected) {

        if (scope.mode === 'translate') {

          if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

            _selected.position.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));

          }

        } else if (scope.mode === 'rotate') {

          _diff.subVectors(_pointer, _previousPointer).multiplyScalar(scope.rotateSpeed);
          applyRotation(_selected, _camera, _diff);
        }

        scope.dispatchEvent({ type: 'drag', object: _selected });

        _previousPointer.copy(_pointer);

      } else {

        // hover support

        if (event.pointerType === 'mouse' || event.pointerType === 'pen') {

          _intersections.length = 0;

          _raycaster.setFromCamera(_pointer, _camera);
          _raycaster.intersectObjects(_objects, scope.recursive, _intersections);

          if (_intersections.length > 0) {

            const object = _intersections[0].object;

            _plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal), _worldPosition.setFromMatrixPosition(object.matrixWorld));

            if (_hovered !== object && _hovered !== null) {

              scope.dispatchEvent({ type: 'hoveroff', object: _hovered });

              _domElement.style.cursor = 'auto';
              _hovered = null;

            }

            if (_hovered !== object) {

              scope.dispatchEvent({ type: 'hoveron', object: object });

              _domElement.style.cursor = 'pointer';
              _hovered = object;

            }

          } else {

            if (_hovered !== null) {

              scope.dispatchEvent({ type: 'hoveroff', object: _hovered });

              _domElement.style.cursor = 'auto';
              _hovered = null;

            }

          }

        }

      }

      _previousPointer.copy(_pointer);

    }

    function onPointerDown(event) {

      if (scope.enabled === false) return;

      updatePointer(event);

      _intersections.length = 0;

      _raycaster.setFromCamera(_pointer, _camera);
      _raycaster.intersectObjects(_objects, scope.recursive, _intersections);

      if (_intersections.length > 0) {

        if (scope.transformGroup === true) {

          // look for the outermost group in the object's upper hierarchy

          _selected = findGroup(_intersections[0].object);

        } else {

          _selected = _intersections[0].object;

        }

        _plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal), _worldPosition.setFromMatrixPosition(_selected.matrixWorld));

        if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

          if (scope.mode === 'translate') {

            _inverseMatrix.copy(_selected.parent.matrixWorld).invert();
            _offset.copy(_intersection).sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));

          } else if (scope.mode === 'rotate') {

            // the controls only support Y+ up
            _up.set(0, 1, 0).applyQuaternion(_camera.quaternion).normalize();
            _right.set(1, 0, 0).applyQuaternion(_camera.quaternion).normalize();

          }

        }

        _domElement.style.cursor = 'move';

        scope.dispatchEvent({ type: 'dragstart', object: _selected });

      }

      _previousPointer.copy(_pointer);

    }

    function onPointerCancel() {

      if (scope.enabled === false) return;

      if (_selected) {

        scope.dispatchEvent({ type: 'dragend', object: _selected });

        _selected = null;

      }

      _domElement.style.cursor = _hovered ? 'pointer' : 'auto';

    }

    function updatePointer(event) {

      const rect = _domElement.getBoundingClientRect();

      _pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
      _pointer.y = - (event.clientY - rect.top) / rect.height * 2 + 1;

    }

    function findGroup(obj, group = null) {

      if (obj.isGroup) group = obj;

      if (obj.parent === null) return group;

      return findGroup(obj.parent, group);

    }

    activate();

    // API

    this.enabled = true;
    this.recursive = true;
    this.transformGroup = false;

    this.activate = activate;
    this.deactivate = deactivate;
    this.dispose = dispose;
    this.getObjects = getObjects;
    this.getRaycaster = getRaycaster;
    this.setObjects = setObjects;

  }

}

export { DragControlsX };
