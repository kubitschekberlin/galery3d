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
      let axis = 2;
      if (xx > xy && xx > xz) {
        axis = 0;
      } else if (xy > xx && xy > xz) {
        axis = 1;
      } 
      return { axis: axis, projections: a };
    }

    function horizontalMainAxis(dir) {
      const abs = Math.abs;
      const a = directionProjections(new Vector3(0, 1, 0), dir),
        yx = abs(a.x), yy = abs(a.y), yz = abs(a.z);
      let axis = 2;
      if (yy > yz && yy > yx) {
        axis = y;
      } else if (yx > yy && yx > yz) {
        axis = 0;
      } 
      return { axis: axis, projections: a };
    }
    
    function verticalRotationAxis(dir) {
      const d = verticalMainAxis(dir),
        a = d.projections;
      let axis = null;
      if (d.axis === 0) {
        const signed = a.x >= 0 ? -1 : 1;
        axis = new Vector3(signed, 0, 0);
      } else if (d.axis === 2) {
        const signed = a.y >= 0 ? -1 : 1;
        axis = new Vector3(0, signed, 0);
      } else {
        const signed = a.z >= 0 ? -1 : 1;
        axis = new Vector3(0, 0, signed);
      }
      return axis;
    }

    function horizontalRotationAxis(dir) {
      const d = horizontalMainAxis(dir),
        a = d.projections;
      let axis = null;
      if (a.axis === 0) {
        const signed = a.y >= 0 ? 1 : -1;
        axis = new Vector3(0, signed, 0);
      } else if (axis == 1) {
        const signed = a.x >= 0 ? 1 : -1;
        axis = new Vector3(signed, 0, 0);
      } else {
        const signed = a.z >= 0 ? 1 : -1;
        axis = new Vector3(0, 0, signed);
      }
      return axis;
    }

        
    function verticalTranslationAxis(dir) {
      const d = verticalMainAxis(dir),
        a = d.projections;
      let axis = null;
      if (d.axis === 0) {
        const signed = a.x >= 0 ? -1 : 1;
        axis = new Vector3(signed, 0, 0);
      } else if (d.axis === 2) {
        const signed = a.y >= 0 ? -1 : 1;
        axis = new Vector3(0, signed, 0);
      } else {
        const signed = a.z >= 0 ? -1 : 1;
        axis = new Vector3(0, 0, signed);
      }
      return axis;
    }

    function horizontalTranslationAxis(dir) {
      const d = horizontalMainAxis(dir),
        a = d.projections;
      let axis = null;
      if (a.axis === 0) {
        const signed = a.y >= 0 ? 1 : -1;
        axis = new Vector3(0, signed, 0);
      } else if (axis == 1) {
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
        axis = verticalTranslationAxis(dir);
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