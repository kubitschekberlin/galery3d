import $ from 'jquery';
import ejs from 'ejs';
import propertiesTemplate from '../views/partials/_object-properties.ejs';
import itemTemplate from '../views/partials/_render-item.ejs';
import objectTemplate from '../views/partials/_render-object.ejs';

export class ObjectProperties {
  show = (object) => {
    console.log(object);
    const renderObject = (key, value) => { return ejs.render(objectTemplate, {key: key, value: value}) },
      renderItem = (key, value) => { return ejs.render(itemTemplate, {key: key, value: value, renderObject: renderObject}) }
    const html = ejs.render(propertiesTemplate, { 
      data: object,
      renderItem: renderItem
     });
    console.log(html);
    $('#object_properties').html(html);
  }
}

