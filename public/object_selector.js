import $ from 'jquery';
import * as THREE from 'three';
import { DragControlsX } from './drag_controls_x.js';

export class ObjectSelector {
  #isShiftDown;

  constructor(renderer) {
    let raycaster = new THREE.Raycaster();

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
      let camera = renderer.camera;
      if (!camera) {
        console.error('Kamera ist nicht definiert');
        return;
      }

      // Aktualisieren des Raycasters mit der Kameraposition und der Mausrichtung
      raycaster.setFromCamera(mouse, camera);

      // Berechnen der Objekte, die vom Raycaster getroffen werden
      let children = renderer.scene.children;
      if (!children) {
        console.log('Scene is empty');
        return;
      }
      let intersects = raycaster.intersectObjects(children);
      let found = 'none'; 
      let enabled = false;
      intersects.some(element => {
        let object = element.object;
        if(object.canSelect){
          found = `${object.type}: ${object.name}`;
          enabled = true;
          this.onSelectObject(renderer, object);
          return true;
        }
        return false;
      });
      renderer.dragControls.enabled = enabled;
      console.log('Selected:', found);
    }

    // Events registrierern
    $(renderer.domElement).parent().on('click', onMouseClick.bind(this));
  }

  onSelectObject = (renderer, selectedObject) => {

    // Alte DragControls entfernen 
    let mode = renderer.dragControls.mode;
    console.log('mode:', mode);
    if (renderer.dragControls) {
      renderer.dragControls.dispose();
    }
    // Neue DragControls mit dem neu ausgewählten Objekt erstellen 
    console.log('mode:', mode);
    this.addDragControl(renderer, selectedObject, mode ? mode : 'translate');
  }

  addDragControl = (renderer, selectedObject, mode) => {
    let controls = renderer.cameraControls;
    renderer.dragControls = new DragControlsX([selectedObject], renderer.camera, renderer.domElement, mode);
    renderer.dragControls.addEventListener('dragstart', function (event) {
      console.log('Disable camera navigation');
      controls.enabled = false;
    });
    renderer.dragControls.addEventListener('dragend', function (event) {
      console.log('Enable camera navigation');
      controls.enabled = true;
    });
    this.registerDragListener(renderer);
    return renderer.dragControls;
  }

  registerDragListener = (renderer) => {
    // Drag-Event anpassen basierend auf dem Zustand der Shift-Taste 
    renderer.dragControls.addEventListener('drag', function (event) {
      event.object.userData.previousPosition.copy(event.object.position);
    });

    // Position speichern, um Delta zu berechnen 
    renderer.dragControls.addEventListener('hoveron', function (event) {
      event.object.userData.previousPosition = event.object.position.clone();
    });
  }

}


