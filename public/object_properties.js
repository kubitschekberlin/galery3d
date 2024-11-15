import $ from 'jquery';
import ejs from 'ejs';
import 'bootstrap';

// itemTemplate: Erzeugt Zeile mit key-value Paar. Ist value ein Objekt, wird es als Schaltfläche zum Öffnen eines
// weiteren Objekts dargestellt durch einen rekursiven Call von printObject.import itemTemplate from '../views/partials/_print-item.ejs';
import itemTemplate from '../views/partials/_print-item.ejs';

// objectTemplate: popup mit den Daten eines Objekts
import objectTemplate from '../views/partials/_print-object.ejs';


export class ObjectProperties {
  #popoverNumber = 0;
  static initialized;

  show = (name, object) => {
    console.log(object);
    $('#object_properties').empty();

    const popoverID = () => {
      return 'popover_' + this.#popoverNumber;
    };

    const printItem = (key, value, popoverID) => {
      let parameter = {
        key: key,
        value: value,
        popoverID: popoverID,
      };
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
    
    if(!ObjectProperties.initialized) {
      ObjectProperties.initialized = true;
      $('#object_properties').on('click', '.popover-object-button', function(button) {
        let key = $(button).data('key'),
        object = $(button).data('object');
        $(button).popover({
          title: key, 
          content: printObject(key, object),
          html: true
        });
      });
    }
  }
}
