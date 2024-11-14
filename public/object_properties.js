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

    const templates = {
      itemTemplate: itemTemplate,
      objectTemplate: objectTemplate
    };

    const printObject = (name, data) => {
      const html = ejs.print(objectTemplate, {
        ejs: ejs,
        templates: templates,
        name: name,
        data: data,
        popoverID: popoverID()
      });
      this.#popoverNumber += 1;
      return html;
    };

    const html = printObject(name, object);
    console.log(html);
    $('#object_properties').html(html);
  }
}

