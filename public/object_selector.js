import $ from 'jquery';
import * as THREE from 'three';
import { DragControlsX } from './drag_controls_x.js';

export class ObjectSelector {

  constructor(renderer, scene, camera) {
    this.selectedObject = null;
    const _raycaster = new THREE.Raycaster();
    const _scene = scene;
    const scope = this;

    // Event-Listener für Maus-Taste drücken und loslassen 
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Shift') {
        console.log('Shift', 'down');
        renderer.dragControls.mode = 'rotate';
      }
    });
    window.addEventListener('keyup', function (event) {
      if (event.key === 'Shift') {
        console.log('Shift', 'up');
        renderer.dragControls.mode = 'translate';
      }
    });

    const onMouseClick = (event) => {
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
          onSelectObject(renderer, object);
          return true;
        }
        return false;
      });
      scope.selectedObject = object ? object : camera;
      renderer.dragControls.enabled = object !== null;
      console.log('Selected:', found);
    }

    // Events registrierern
    $(renderer.domElement).parent().on('click', onMouseClick.bind(this));

    
    const onSelectObject = (renderer, selectedObject) => {
      let mode = 'translate';
      
      // Alte DragControls entfernen 
      if (renderer.dragControls) {
        mode = renderer.dragControls.mode;
        renderer.dragControls.dispose();
      }
      console.log('mode:', mode);
      
      // Neue DragControls mit dem neu ausgewählten Objekt erstellen 
      console.log('mode:', mode);
      addDragControl(renderer, selectedObject, mode);
    };
    
    const addDragControl = (renderer, selectedObject, mode) => {
      renderer.dragControls = new DragControlsX([selectedObject], camera, renderer.domElement, mode, _raycaster);
      renderer.dragControls.addEventListener('dragstart', function (event) {
      });
      renderer.dragControls.addEventListener('dragend', function (event) {
      });
      registerDragListener(renderer);
      return renderer.dragControls;
    };
    
    const registerDragListener = (renderer) => {
      // Drag-Event anpassen basierend auf dem Zustand der Shift-Taste 
      renderer.dragControls.addEventListener('drag', function (event) {
        event.object.userData.previousPosition.copy(event.object.position);
      });
      
      // Position speichern, um Delta zu berechnen 
      renderer.dragControls.addEventListener('hoveron', function (event) {
        event.object.userData.previousPosition = event.object.position.clone();
      });
    }
    
    onSelectObject(renderer, camera);
  }

}


