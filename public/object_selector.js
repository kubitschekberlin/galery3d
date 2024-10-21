import $ from 'jquery';
import * as THREE from 'three';
import { ObjectProperties } from './object_properties.js';

export class ObjectSelector {
  #raycaster;
  #object_properties;
  #scene;
  #canvas;
  
  constructor(scene, canvas, template, itemTemplate) {
    this.#scene = scene;
    this.#canvas = canvas;
    this.#raycaster = new THREE.Raycaster();
    this.#object_properties = new ObjectProperties(template, itemTemplate);
    // Sicherstellen, dass der Kontext beibehalten wird
    $(canvas).parent().on('click', this.onMouseClick.bind(this));
  }

  onMouseClick = (event) => {
    // Umrechnen der Mausposition in normalisierte Gerätekoordinaten (NDC)
    const rect = this.#canvas.getBoundingClientRect();
    let mouse = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1
    };

    // Vergewissere dich, dass die Kamera korrekt ist
    let camera = this.#scene.camera;
    if (!camera) {
      console.error('Kamera ist nicht definiert');
      return;
    }

    // Aktualisieren des Raycasters mit der Kameraposition und der Mausrichtung
    this.#raycaster.setFromCamera(mouse, camera);

    // Berechnen der Objekte, die vom Raycaster getroffen werden
    let children = this.#scene.scene.children;
    if(!children) {
      console.log('Scene is empty');
      return;
    }
    let intersects = this.#raycaster.intersectObjects(children);
    let selectedObject = null;
    if (intersects.length > 0) {
      // Das erste getroffene Objekt auswählen
      selectedObject = intersects[0].object;
      console.log('Ausgewähltes Objekt: ' + selectedObject.name);
    } else {
      console.log('Kein Objekt getroffen');
    }

    // Eigenschaften anzeigen, wenn ein Objekt ausgewählt wurde
    if (selectedObject) {
      this.#object_properties.show(selectedObject);
    }
  }
}
