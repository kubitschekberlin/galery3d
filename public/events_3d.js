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
      const name = file.name;
      console.log('upload of', file, 'started', name);
      const formData = new FormData();
      formData.append('file', file);
      fetch('/upload', { method: 'POST', body: formData })
        .then(response => {
          // Debugging-Information: Der MIME-Typ der Antwort
          console.log(response,
            response.headers.get('Content-Type'),
            response.headers.get('Content-Length'));
          return response.arrayBuffer();
        })
        .then(arrayBuffer => {
          const extension = name.split('.').pop().toUpperCase();
          console.log('Dateiinhalt:', arrayBuffer);
          new RenderMesh(this.scene, extension, arrayBuffer, animate);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });
  }
}
export { Events3D };