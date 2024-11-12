import $ from 'jquery';
import ejs from 'ejs';
import itemTemplate from '../views/partials/_print-item.ejs';
import objectTemplate from '../views/partials/_print-object.ejs';

export class ObjectProperties {
  #popoverNumber = 0;

  show = (name, object) => {
    console.log(object);

    const popoverID = () => {
      return 'popover_' + this.#popoverNumber;
    };
    
    // printObject: Erzeugt popup mit den Daten eines Objekts
    // printItem: Erzeugt Zeile mit key-value Paar. Ist value ein Objekt, wird es als Schaltfläche zum rekursiven Öffnen eines
    //             weiteren Objekts dargestellt.
    const printObject = (name, data, print) => { 
      const html = ejs.print(objectTemplate, {
        name: name, 
        data: data, 
        printItem: print,
        popoverID: popoverID()
      });
      this.#popoverNumber += 1;
      return html;
    };

    const printItem = (key, value, id) => { 
      const html = ejs.print(itemTemplate, {
        key: key, 
        value: value, 
        printObject: printObject,
        popoverID: id
      });
      return html;
    };

    const html = printObject(name, object, printItem);
    console.log(html);
    $('#object_properties').html(html);
  }
}

