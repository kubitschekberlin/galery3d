import * as THREE from 'three';
import { OrbitControlsX } from './orbit_controls_x.js';
import { DragControlsX } from './drag_controls_x.js';
import './object_properties.js';
//import { PickHelper, pickPosition } from './picking.js';
import $ from 'jquery'

export default class RenderScene {

  constructor(parent_selector) {
    const $parent = $(parent_selector);
    //const pickHelper = new PickHelper();
    const scene = new THREE.Scene();
    let ratio = $parent.innerWidth() / $parent.innerHeight();
    let camera = new THREE.PerspectiveCamera(75, ratio, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize($parent.innerWidth(), $parent.innerHeight());
    const canvas = $parent.append(renderer.domElement)[0];

    scene.background = new THREE.Color(0x0a5acc);

    // put the camera on a pole (parent it to an object)
    // so we can spin the pole to move the camera around the scene
    const cameraPole = new THREE.Object3D();
    cameraPole.name = 'Camera Pole';
    scene.add(cameraPole);
    cameraPole.add(camera);

    const light = new THREE.AmbientLight(0xaaaaaa, 1); // soft white light
    camera.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.name = 'Directional Light';
    scene.add(directionalLight);

    camera.position.z = 5;
    camera.wireframe = true;

    const animate = () => {
      requestAnimationFrame(animate);
      //pickHelper.pick(pickPosition, scene, camera);
      renderer.setSize($parent.innerWidth(), $parent.innerHeight());
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      let dialogs = this.objectProps;
      if (dialogs) {
        dialogs.updateDialogs();
      }
    }

    //console.log('ID', canvas.getAttribute('id'));
    const cameraControls = new OrbitControlsX(camera, canvas);

    cameraControls.target.set(0, 0, 0); // Set the target point (usually the scene origin);
    scene.addEventListener(cameraControls);

    //  Objektzugriffe
    this.scene = scene;
    this.camera = camera;
    this.animate = animate;
    this.cameraControls = cameraControls;
    this.domElement = renderer.domElement;
    this.objectProps = null;
    this.dragControls = new DragControlsX([], camera, renderer.domElement);

    // rendern
    animate();
  }

  objectProperties = (op) => {
    this.objectProps = op;
  }
}

