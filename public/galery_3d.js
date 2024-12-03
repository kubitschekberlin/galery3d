import $ from 'jquery'
import { Events3D } from './events_3d.js';
import RenderScene from './render_scene.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import * as renderObject from './render_object.js';
import './extend_js.js';
import { ObjectProperties } from './object_properties.js';

$(function () {
  const renderer = new RenderScene('#canvas_parent');
  $('#top_area').data('scene', renderer);
  let objectProperties = new ObjectProperties();
  renderer.objectProperties(objectProperties);
  new Events3D(renderer.camera, renderer.scene, renderer.animate, objectProperties);
  new renderObject.RenderCube(renderer.scene, renderer, './dist/zebra.jpg');
  //new RenderHorizonSphere(renderer.scene, './dist/zebra.jpg');
});