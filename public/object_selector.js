import $ from 'jquery';
import * as THREE from 'three';
import { DragControlsX } from './drag_controls_x.js';

export class ObjectSelector {

  constructor(renderer, scene, camera) {
    const _raycaster = new THREE.Raycaster();
    const _scene = scene;
    const scope = this;
    const controls = new DragControlsX(camera, renderer.domElement);
    
    const onPointerDown = (dc_event) => {
      // Umrechnen der Mausposition in normalisierte Gerätekoordinaten (NDC)
      const rect = renderer.domElement.getBoundingClientRect();
      const event = dc_event.event;
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
      let selected = camera;
      intersects.some(element => {
        let object = element.object;
        if (object.canSelect) {
          selected = object;
          return true;
        }
        return false;
      });
      onSelectObject(selected);
      console.log('Selected:', `${selected.type}: ${selected.name}`);
    }
    
    const onSelectObject = (selectedObject) => {
      controls.setSelectedObjects([selectedObject]);
    };
    
    const onReset = () => {
      let object = controls.selectedObject();
      if(object){
        if(object.resetPosition) {
          object.resetPosition();
        } else {
          object.position.set(0, 0, 0);
          object.quaternion.set(0, 0, 0, 0);
        }
      }
    }

    controls.addEventListener('ds-down', onPointerDown);
    onSelectObject(camera);

    $('.js-reset').on('click', onReset);

  }
  
}


