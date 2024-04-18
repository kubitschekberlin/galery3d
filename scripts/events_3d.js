import $ from 'jquery'
import { RenderMesh } from '../library/render_object.js'

class Events3D {
  constructor(camera, scene, animate) {
    this.camera = camera;
    this.scene = scene;

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
  }
}
export { Events3D };