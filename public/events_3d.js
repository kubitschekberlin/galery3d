import $ from 'jquery'
import { RenderMesh } from './render_object.js'

class Events3D {
  constructor(camera, scene, animate, objectProperties) {
    this.camera = camera;
    this.scene = scene;
    this.objectProperties = objectProperties;

    $('#wireframe').on('click', function () {
      camera.wireframe = !camera.wireframe;
    });

    $('#formFile').on('change', (event) => {
      event.preventDefault();
      const fileInput = $('#formFile')[0];
      const file = fileInput.files[0];
      const extension = file.name.split('.').pop().toUpperCase();
      console.log('Loading', file.name, 'Extension:', extension, file);
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => { 
        new RenderMesh(this.scene, extension, reader.result, animate); 
      };
    });

    $('#object_properties_button').on('click', function(event) {
      const $boxes = $('.object-properties');
      const fn = this.objectProperties;
      if($boxes.length > 0) {
        fn.removeAll();
      } else {
        fn.show('Scene', scene);
      }
      $(event.target).attr('checked', $boxes.length);
    }.bind(this));
  }

}
export { Events3D };