import $ from 'jquery'
import { Events3D } from './events_3d.js';
import RenderScene from '../library/render_scene.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import { RenderHorizonSphere } from '../library/render_object.js';
import { ObjectSelector } from '../library/object_selector.js';
import propertiesTemplate from '../views/partials/_object-properties.ejs';
import itemTemplate from '../views/partials/_print-object-item.ejs';

$(function () {
  const scene = new RenderScene('#canvas_parent');
  new Events3D(scene.camera, scene.scene, scene.animate);
  new RenderHorizonSphere(scene.scene, './dist/dolomiten_panorama_1.jpg');
  new ObjectSelector(scene, $('canvas')[0], propertiesTemplate, itemTemplate);
});