import $ from 'jquery'
import { Events3D } from './events_3d.js';
import RenderScene from './render_scene.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { RenderHorizonSphere } from './render_object.js';
import { ObjectSelector } from './object_selector.js';
import './extend_js.js';
import { ObjectProperties } from './object_properties.js';

$(function () {
  const scene = new RenderScene('#canvas_parent');
  $('#top_area').data('scene', scene);
  let objectProperties = new ObjectProperties();
  scene.objectProperties(objectProperties);
  new Events3D(scene.camera, scene.scene, scene.animate, objectProperties);
  new RenderHorizonSphere(scene.scene, './dist/dolomiten_panorama_1.jpg');
  new ObjectSelector(scene, $('canvas')[0]);
});