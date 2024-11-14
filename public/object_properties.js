import $ from 'jquery';
import ejs from 'ejs';

// itemTemplate: Erzeugt Zeile mit key-value Paar. Ist value ein Objekt, wird es als Schaltfläche zum Öffnen eines
// weiteren Objekts dargestellt durch einen rekursiven Call von printObject.import itemTemplate from '../views/partials/_print-item.ejs';
import itemTemplate from '../views/partials/_print-item.ejs';

// objectTemplate: popup mit den Daten eines Objekts
import objectTemplate from '../views/partials/_print-object.ejs';

export class ObjectProperties {
  #popoverNumber = 0;

  show = (name, object) => {
    console.log(object);

    const popoverID = () => {
      return 'popover_' + this.#popoverNumber;
    };

    function printItem(key, value, popoverID) {
      parameter = {
        key: key,
        value: value,
        popoverID: popoverID,
        printObject: printObject
      };
      const html = ejs.print(itemTemplate, parameter);
      return html;
    }

    function printObject(name, data) {
      const html = ejs.print(objectTemplate, {
        name: name,
        data: data,
        popoverID: popoverID(),
        printItem: printItem
      });
      this.#popoverNumber += 1;
      return html;
    };

    const html = printObject(name, object);
    console.log(html);
    $('#object_properties').html(html);
  }
}

