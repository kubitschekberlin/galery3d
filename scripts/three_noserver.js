import $ from 'jquery'
import { Events3D } from './events_3d.js';
import RenderScene from '../library/render_scene.js'
import 'bootstrap/dist/css/bootstrap.min.css';

$(function () {
  const scene = new RenderScene('#canvas_parent');
  new Events3D(scene.camera, scene.scene, scene.animate);
});