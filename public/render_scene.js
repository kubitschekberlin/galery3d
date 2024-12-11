import * as THREE from 'three';
import { ObjectSelector } from './object_selector.js';
import { CameraNavigator } from './camera_navigator.js'
import { CoordinateArrows} from './render_object.js'
import './object_properties.js';
import $ from 'jquery'

export default class RenderScene {

  constructor(parent_selector) {
    const $parent = $(parent_selector);
    //const pickHelper = new PickHelper();
    const scene = new THREE.Scene();
    let ratio = $parent.innerWidth() / $parent.innerHeight();
    let camera = new THREE.PerspectiveCamera(75, ratio, 0.1, 1000);
    camera.name = 'Camera';
    camera.navigator = new CameraNavigator();
    camera.resetPosition = () => {
        camera.position.set(0, 0, 5);
        camera.quaternion.set(0, 0, 0, 0);
    };
    new CoordinateArrows(scene, null, 0.5);
    
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize($parent.innerWidth(), $parent.innerHeight());
    const canvas = $parent.append(renderer.domElement)[0];

    scene.background = new THREE.Color(0x0a5acc);
    scene.add(camera);

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

    //  Objektzugriffe
    this.scene = scene;
    this.camera = camera;
    this.animate = animate;
    this.domElement = renderer.domElement;
    this.objectProps = null;
    
    new ObjectSelector(renderer, scene, camera);

    // rendern
    animate();
  }

  objectProperties = (op) => {
    this.objectProps = op;
  }
}

