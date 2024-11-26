import $ from 'jquery';
import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

export class ObjectSelector {
  constructor(renderer) {
    let raycaster = new THREE.Raycaster();
 
    
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
        this.onSelectObject(selectedObject, renderer);
      } else {
        console.log('Kein Objekt getroffen');
      }
      
    }
    
    // Sicherstellen, dass der Kontext beibehalten wird
    $(renderer.domElement).parent().on('click', onMouseClick.bind(this));
  }
  
  onSelectObject = (selectedObject, renderer) => {
    let controls = renderer.controls;

    // Alte DragControls entfernen 
    if (renderer.dragControls) {
      renderer.dragControls.dispose();
    }
    // Neue DragControls mit dem neu ausgewählten Objekt erstellen 
    renderer.dragControls = new DragControls([selectedObject], renderer.camera, renderer.domElement);
    renderer.dragControls.addEventListener('dragstart', function (event) {
      controls.enabled = false;
    });
    renderer.dragControls.addEventListener('dragend', function (event) {
      controls.enabled = true;
    });
  }
}

