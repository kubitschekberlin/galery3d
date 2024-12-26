import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  DirectionalLight,
  AmbientLight,
  Color,
  Vector3
} from 'three';
import { ObjectSelector } from './object_selector.js';
import { CameraNavigator } from './camera_navigator.js'
import { CoordinateArrows} from './render_object.js'
import './object_properties.js';
import $ from 'jquery'

const __defaults = {
  fov: 30,
  position: new Vector3(0, -10_000, 0),
  far: 200_000
};
PerspectiveCamera.defaults = __defaults;

export default class RenderScene {

  constructor(parent_selector, objectProperties) {

    const $parent = $(parent_selector);
    const scene = new Scene();
    let ratio = $parent.innerWidth() / $parent.innerHeight();
    let camera = new PerspectiveCamera(PerspectiveCamera.defaults.fov, ratio, 0.1, 
      PerspectiveCamera.defaults.far);
    camera.position.copy(PerspectiveCamera.defaults.position);
    camera.lookAt(0, 0, 0);
    camera.navigator = new CameraNavigator(camera);
    new CoordinateArrows(scene, null, 50);
    
    const renderer = new WebGLRenderer();
    renderer.setSize($parent.innerWidth(), $parent.innerHeight());
    const canvas = $parent.append(renderer.domElement)[0];

    scene.background = new Color(0x0a5acc);
    scene.add(camera);

    const light = new AmbientLight(0xaaaaaa, 1); // soft white light
    camera.add(light);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.name = 'Directional Light';
    directionalLight.position.set(1, 1, 1); // Position of the light
    directionalLight.target.position.set(0, 0, 0); // Direction the light is pointing at
    scene.add(directionalLight.target); // Add the target to the scene
    camera.add(directionalLight);

    camera.wireframe = true;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.setSize($parent.innerWidth(), $parent.innerHeight());
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }

    //  Objektzugriffe
    this.scene = scene;
    this.camera = camera;
    this.animate = animate;
    this.domElement = renderer.domElement;
    this.objectProps = objectProperties;
    objectProperties.objectSelector = new ObjectSelector(renderer, scene, camera);

    // rendern
    animate();

  }

  objectProperties = (op) => {
    this.objectProps = op;
  }
}
