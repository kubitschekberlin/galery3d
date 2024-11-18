import $ from 'jquery';
import ejs from 'ejs';
import 'jquery-ui-dist/jquery-ui.css'; 
import 'jquery-ui-dist/jquery-ui.js'

// itemTemplate: Erzeugt Zeile mit key-value Paar. Ist value ein Objekt, wird es als Schaltfläche zum Öffnen eines
// weiteren Objekts dargestellt durch einen rekursiven Call von printObject.import itemTemplate from '../views/partials/_print-item.ejs';
import itemTemplate from '../views/partials/_print-item.ejs';

// objectTemplate: popup mit den Daten eines Objekts
import objectTemplate from '../views/partials/_print-object.ejs';


export class ObjectProperties {
  #popoverNumber = 0;
  #objects = {};
  static initialized;

  show = (name, object) => {
    console.log(object);
    $('#object_properties').empty();

    const popoverID = () => {
      return 'popover_' + this.#popoverNumber;
    };

    
    const getObject = (id) => {
      return this.#objects[id];
    }

    const printItem = (key, value, popoverID) => {
      let parameter = {
        key: key,
        value: value,
        popoverID: popoverID
      };
      if(typeof value === 'object'){
        this.#objects[popoverID] = value;
      }
      const html = ejs.render(itemTemplate, parameter);
      return html;
    }

    const printObject = (name, data) => {
      const html = ejs.render(objectTemplate, {
        name: name,
        data: data,
        popoverID: popoverID(),
        printItem: printItem
      });

      // Nächste popup ID
      this.#popoverNumber += 1;

      return html;
    };
    
    const html = printObject(name, object);
    console.log(html);
    $('#object_properties').html(html);
    
    const onClick = (event) => {
      let button = event.target,
      key = $(button).data('key'),
      id = $(button).data('popover-id'),
      object = getObject(id);
      $(button).dialog({autoOpen: false})
      .html(printObject(key, object))
      .dialog('open');
    };

    if(!ObjectProperties.initialized) {
      ObjectProperties.initialized = true;
      $('#object_properties').on('click', '.popover-object-button', onClick.bind(this));
    }
  }
}
