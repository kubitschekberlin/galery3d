import $ from 'jquery';
import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

export class ObjectSelector {
  #isShiftDown;

  constructor(renderer) {
    let raycaster = new THREE.Raycaster();

    // Event-Listener für Maus-Taste drücken und loslassen 
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Shift') {
        console.log('Shift', 'down');
        renderer.isShiftDown = true;
      }
    });
    window.addEventListener('keyup', function (event) {
      if (event.key === 'Shift') {
        console.log('Shift', 'up');
        renderer.isShiftDown = false;
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
      let selectedObject = null;
      if (intersects.length > 0) {
        // Das erste getroffene Objekt auswählen
        selectedObject = intersects[0].object;
        console.log('Ausgewähltes Objekt: ' + selectedObject.name);
        this.onSelectObject(renderer, selectedObject);
      } else {
        console.log('Kein Objekt getroffen');
      }
    }

    // Events registrierern
    $(renderer.domElement).parent().on('click', onMouseClick.bind(this));
  }

  onSelectObject = (renderer, selectedObject) => {

    // Alte DragControls entfernen 
    if (renderer.dragControls) {
      renderer.dragControls.dispose();
    }
    // Neue DragControls mit dem neu ausgewählten Objekt erstellen 
    this.addDragControl(renderer, selectedObject);
  }

  addDragControl = (renderer, selectedObject) => {
    let controls = renderer.cameraControls;
    renderer.dragControls = new DragControls([selectedObject], renderer.camera, renderer.domElement);
    renderer.dragControls.addEventListener('dragstart', function (event) {
      controls.enabled = false;
    });
    renderer.dragControls.addEventListener('dragend', function (event) {
      controls.enabled = true;
    });
    this.registerDragListener(renderer);
  }

  registerDragListener = (renderer) => {
    // Drag-Event anpassen basierend auf dem Zustand der Shift-Taste 
    renderer.dragControls.addEventListener('drag', function (event) {
      // gibts nicht: event.preventDefault();
      // Standard-Drag-Handling verhindern 
      if(event.object.userData.previousPosition) {
        const deltaX = event.object.position.x - event.object.userData.previousPosition.x;
        const deltaY = event.object.position.y - event.object.userData.previousPosition.y;
        event.object.position.copy(event.object.userData.previousPosition);
        if (renderer.isShiftDown) {
          let pos = event.object.position.clone();
          event.object.rotation.x -= deltaY * 0.01;
          event.object.rotation.y += deltaX * 0.01;
          event.object.position.x = pos.x;
          event.object.position.y = pos.y;
          event.object.position.z = pos.z;
          console.log(pos);
        } else {
          // Translation bei losgelassener Shift-Taste 
          event.object.position.x += deltaX;
          event.object.position.y += deltaY;
        }
      }
        // Position speichern, um Delta zu berechnen 
      event.object.userData.previousPosition.copy(event.object.position);
    });

    // Position speichern, um Delta zu berechnen 
    renderer.dragControls.addEventListener('hoveron', function (event) {
      event.object.userData.previousPosition = event.object.position.clone();
    });
  }

}


