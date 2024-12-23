import $ from 'jquery';
import * as THREE from 'three';
import { DragControlsX } from './drag_controls_x.js';

export class ObjectSelector {

  constructor(renderer, scene, camera) {
    const _raycaster = new THREE.Raycaster();
    const _scene = scene;
    const controls = new DragControlsX(camera, renderer.domElement);
    let selectedObject = 0;
    this.selectedObject = undefined;

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

    const onSelectObject = (selected) => {
      selectedObject = selected;
      controls.setSelectedObjects([selectedObject]);
      this.selectedObject = selectedObject;
    };

    const functions = {
      reset_object: (object) => {
        if (object) {
          object.position.set(0, 0, 0);
          object.quaternion.set(0, 0, 0, 0);
        }
      },

      delete_object: (object) => {
        if (object && object.parent) {
          object.parent.remove(object);
          controls.setSelectedObjects([]); // Clear the selected objects
        }
      }
    };

    controls.addEventListener('ds-down', onPointerDown);

    const onButtonClicked = (event) => {
      if (selectedObject) {
        const $button = $(event.target),
          service = $button.data('function');
        functions[service](selectedObject);
      } else {
        console.error('No object selected');
      }
    };

    $('.js-action-button[data-object="selected"]').on('click', onButtonClicked);

    const onChange = (event) => {
      const $field = $(event.target),
        objectName = $field.data('object-name');
      let name = null;
      const nestedObject = () => {
        let dbg = objectName,
          acc = objectName == 'camera' ? camera : selectedObject,
          key = '';
        try {
          for (let i = 0; i < 4; i++) {
            key = $field.data(`key${i}`);
            if (key != undefined) {
              dbg += `[${key}]`;
              if (acc[key] === undefined) {
                throw `${acc}[${key}] does not exist`;
              }
              if (typeof acc[key] === 'object') {
                // Weiter mit verschachteltem objekt
                acc = acc[key];
              } else {
                // Stop, wenn Wert gefunden
                name = key;
                break;
              }
            }
          }
        }
        catch (err) {
          console.error(JSON.stringify(err), key, JSON.stringify(acc), dbg);
        }
        return acc;
      };
      let object = nestedObject();
      object[name] = $field.val();
      Events3D.numberChanged();
    };

    $('.js-numeric-field .value-number').each((_index, field) => {
      $(field).on('change', onChange).spinner({ step: 0.1, spin: onChange });
    });

  }

}


