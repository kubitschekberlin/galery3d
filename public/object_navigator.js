import {
  Vector3,
  Matrix4,
  Matrix3
} from 'three';

export class ObjectNavigator {

  constructor() {

    // Wir merken uns die Bewegungsrichtungen während der Navigation. Hier setzten wir sie 
    // initial zurück:
    const onPointerUp = (_event) => {
      this._translation = null;
      this._rotation = null;
      //console.log('Objet Navigator Neustart')
    }
    window.addEventListener('pointerup', onPointerUp);
  }

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

    function verticalMainAxis(dir, forTranslation) {
      const abs = Math.abs;
      const v = forTranslation ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0);
      const a = directionProjections(v, dir),
        xx = abs(a.x), xy = abs(a.y), xz = abs(a.z);
      let axis = 2;
      if (xx >= xy && xx >= xz) {
        axis = 0;
      } else if (xy >= xx && xy >= xz) {
        axis = 1;
      }
      console.log('Vertical', axis, a);
      return { axis: axis, projections: a };
    }
    
    function horizontalMainAxis(dir, forTranslation) {
      const abs = Math.abs;
      const v = forTranslation ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
      const a = directionProjections(v, dir),
      yx = abs(a.x), yy = abs(a.y), yz = abs(a.z);
      let axis = 2;
      if (yy >= yz && yy >= yx) {
        axis = 1;
      } else if (yx >= yy && yx >= yz) {
        axis = 0;
      }
      console.log('Horizontal', axis, a);
      return { axis: axis, projections: a };
    }

    function verticalRotationAxis(dir) {
      const d = verticalMainAxis(dir),
        a = d.projections;
      let axis = null;
      if (d.axis === 0) {
        const signed = a.x >= 0 ? -1 : 1;
        axis = new Vector3(signed, 0, 0);
      } else if (d.axis === 1) {
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
      if (d.axis === 1) {
        const signed = a.y >= 0 ? 1 : -1;
        axis = new Vector3(0, signed, 0);
      } else if (d.axis == 0) {
        const signed = a.x >= 0 ? 1 : -1;
        axis = new Vector3(signed, 0, 0);
      } else {
        const signed = a.z >= 0 ? 1 : -1;
        axis = new Vector3(0, 0, signed);
      }
      return axis;
    }


    function verticalTranslationAxis(dir) {
      const d = verticalMainAxis(dir, true),
        a = d.projections;
      let axis = null;
      if (d.axis === 0) {
        const signed = a.x >= 0 ? -1 : 1;
        axis = new Vector3(signed, 0, 0);
      } else if (d.axis === 1) {
        const signed = a.y >= 0 ? 1 : -1;
        axis = new Vector3(0, signed, 0);
      } else {
        const signed = a.z >= 0 ? -1 : 1;
        axis = new Vector3(0, 0, signed);
      }
      return axis;
    }

    function horizontalTranslationAxis(dir) {
      const d = horizontalMainAxis(dir, true),
        a = d.projections;
      let axis = null;
      if (d.axis === 0) {
        const signed = a.y >= 0 ? 1 : -1;
        axis = new Vector3(signed, 0, 0);
      } else if (d.axis == 1) {
        const signed = a.x >= 0 ? 1 : -1;
        axis = new Vector3(0, signed, 0);
      } else {
        const signed = a.z >= 0 ? 1 : -1;
        axis = new Vector3(0, 0, signed);
      }
      return axis;
    }

    const applyRotation = (selected, camera, diff) => {
      if (!this._rotation) {
        const abs = Math.abs;
        const dir = globalProjections(camera, selected);
        let vertical = abs(diff.y) > abs(diff.x);
        let axis = null;

        if (vertical) {
          axis = verticalRotationAxis(dir);
        }
        else {
          axis = horizontalRotationAxis(dir);
        }
        this._rotation = { axis: axis, vertical: vertical};
      }
      let angle = this._rotation.vertical ? diff.y : diff.x;

      //console.log('Rotation', angle, this._rotatio.axis, 'Vertical:', this._rotation.vertical);
      selected.rotateOnAxis(this._rotation.axis, angle * 10); // * Math.PI / 180);
    }

    const applyTranslation = (selected, camera, diff) => {
      if (!this._translation) {
        const abs = Math.abs;
        const dir = globalProjections(camera, selected);
        let vertical = abs(diff.y) > abs(diff.x);
        let axis = null;

        if (vertical) {
          axis = verticalTranslationAxis(dir);
        }
        else {
          axis = horizontalTranslationAxis(dir);
        }
        this._translation = { axis: axis, vertical: vertical };
      }
      const dist = this._translation.vertical ? diff.y : diff.x;

      //console.log('Translation', dist, this._translation.axis, 'Vertical:', this._translation.vertical );
      const mat = new Matrix3().setFromMatrix4(selected.matrixWorld);
      let trans = this._translation.axis.clone().multiplyScalar(dist);
      trans.applyMatrix3(mat);
      selected.position.add(trans); 
    }

    // das passert in dieser Klasse:
    if (event.shiftKey) {
      applyRotation(selected, camera, diff);
    } else {
      applyTranslation(selected, camera, diff);
    }
  }

}