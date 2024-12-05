import {
  Vector3,
  Matrix4
} from 'three';

export class ObjectNavigator {

  navigate = (selected, camera, diff, event) => {

    // Projektion der Objectachsen auf den View  
    function globalProjections(camera, object) {
      // View-Matrix (inverse Weltmatrix der Kamera)
      const viewMatrix = new Matrix4();
      viewMatrix.copy(camera.matrixWorldInverse);

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

    function directionProjections(axis, dir) {
      return { x: axis.dot(dir.x), y: axis.dot(dir.y), z: axis.dot(dir.z) };
    }

    function verticalMainAxis(dir) {
      const abs = Math.abs;
      const a = directionProjections(new Vector3(1, 0, 0), dir),
        xx = abs(a.x), xy = abs(a.y), xz = abs(a.z);
      let axis = null;
      if (xx > xy && xx > xz) {
        return 0;
      } else if (xy > xx && xy > xz) {
        return 1;
      } 
      return 2;
    }

    function verticalRotationAxis(dir) {
      const abs = Math.abs;
      const a = directionProjections(new Vector3(1, 0, 0), dir),
        xx = abs(a.x), xy = abs(a.y), xz = abs(a.z);
      let axis = null, main = verticalMainAxis();
      if (main === 0) {
        const signed = a.x >= 0 ? -1 : 1;
        axis = new Vector3(signed, 0, 0);
      } else if (main === 2) {
        const signed = a.y >= 0 ? -1 : 1;
        axis = new Vector3(0, signed, 0);
      } else {
        const signed = a.z >= 0 ? -1 : 1;
        axis = new Vector3(0, 0, signed);
      }
      return axis;
    }

    function horizontalRotationAxis(dir) {
      const abs = Math.abs;
      const a = directionProjections(new Vector3(0, 1, 0), dir),
        yx = abs(a.x), yy = abs(a.y), yz = abs(a.z);
      let axis = null;
      if (yy > yz && yy > yx) {
        const signed = a.y >= 0 ? 1 : -1;
        axis = new Vector3(0, signed, 0);
      } else if (yx > yy && yx > yz) {
        const signed = a.x >= 0 ? 1 : -1;
        axis = new Vector3(signed, 0, 0);
      } else {
        const signed = a.z >= 0 ? 1 : -1;
        axis = new Vector3(0, 0, signed);
      }
      return axis;
    }

    function applyRotation(selected, camera, diff) {
      const abs = Math.abs;
      const dir = globalProjections(camera, selected);
      let vertical = abs(diff.y) > abs(diff.x);
      let angle = vertical ? diff.y : diff.x;
      let axis = null;

      if (vertical) {
        axis = verticalRotationAxis(dir);
      }
      else {
        axis = horizontalRotationAxis(dir);
      }

      //console.log('angle:', angle, 'vertical:', vertical, 'axis:', axis);
      selected.rotateOnAxis(axis, angle * 10); // * Math.PI / 180);
    }

    function applyTranslation(selected, camera, diff) {
      const abs = Math.abs;
      const dir = globalProjections(camera, selected);
      let vertical = abs(diff.y) > abs(diff.x);
      let angle = vertical ? diff.y : diff.x;
      let axis = null;

      if (vertical) {
        axis = verticalTransdlationAxis(dir);
      }
      else {
        axis = horizontalTranslationAxis(dir);
      }

      //console.log('angle:', angle, 'vertical:', vertical, 'axis:', axis);
      selected.rotateOnAxis(axis, angle * 10); // * Math.PI / 180);      
    }

    if (event.shiftKey) {
      applyRotation(selected, camera, diff);
    } else {
      applyTranslation(selected, camera, diff);
    }
  }

}