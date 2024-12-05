import $ from 'jquery';
import * as THREE from 'three';
import { DragControlsX } from './drag_controls_x.js';

export class ObjectSelector {

  constructor(renderer, scene, camera) {
    this.selectedObject = null;
    const _raycaster = new THREE.Raycaster();
    const _scene = scene;
    const scope = this;
    const controls = new DragControlsX(camera, renderer.domElement);
    controls.addEventListener('pointerdown', onPointerDown);

    const onPointerDown = (event) => {
      // Umrechnen der Mausposition in normalisierte Gerätekoordinaten (NDC)
      const rect = renderer.domElement.getBoundingClientRect();
      let mouse = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1
      };

      // Vergewissere dich, dass die Kamera korrekt ist
      if (!camera) {
        console.error('Kamera ist nicht definiert');
        return;
      }

      // Aktualisieren des Raycasters mit der Kameraposition und der Mausrichtung
      _raycaster.setFromCamera(mouse, camera);

      // Berechnen der Objekte, die vom Raycaster getroffen werden
      let children = _scene.children;
      if (!children) {
        console.log('Scene is empty');
        return;
      }
      let intersects = _raycaster.intersectObjects(children);
      let found = 'none';
      let object = null;
      intersects.some(element => {
        object = element.object;
        if (object.canSelect) {
          found = `${object.type}: ${object.name}`;
          onSelectObject(object);
          return true;
        }
        return false;
      });
      scope.selectedObject = object ? object : camera;
      console.log('Selected:', found);
    }
    
    const onSelectObject = (selectedObject) => {
      controls.setSelectedObjects([selectedObject]);
    };
    
    onSelectObject(camera);
  }

}


