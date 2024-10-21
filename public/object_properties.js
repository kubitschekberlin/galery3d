import $ from 'jquery';
import ejs from 'ejs';
import propertiesTemplate from '../views/partials/_object-properties.ejs';
import itemTemplate from '../views/partials/_print-object-item.ejs';

export class ObjectProperties {
  show = (object) => {
    console.log(object);
    const html = ejs.render(propertiesTemplate, { 
      data: object,
      renderItem: (key, value) => { return ejs.render(itemTemplate, {key: key, value: value}) }
     });
    console.log(html);
    $('#object_properties').html(html);
  }
}

