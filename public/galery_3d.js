import $ from 'jquery'
import { Events3D } from './events_3d.js';
import RenderScene from './render_scene.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import {
  RenderCube,
  RenderHorizonSphere
} from './render_object.js';
import './extend_js.js';
import { ObjectProperties } from './object_properties.js';

$(function () {
  const  objectProperties = new ObjectProperties(),
    renderer = new RenderScene('#canvas_parent', objectProperties);
  $('#top_area').data('scene', renderer);
  new Events3D(renderer.camera, renderer.scene, renderer.animate, objectProperties);
  // new RenderCube(renderer.scene, renderer, './dist/zebra.jpg');
  // new RenderHorizonSphere(renderer.scene, './dist/zebra.jpg');
});