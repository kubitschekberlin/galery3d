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
  static initialized;
  constructor() {
    this.objects = [];
    this.dialogs = [];
  }
  show = (name, object) => {
    console.log(object);

    const popoverID = () => {
      return 'popover_' + this.#popoverNumber;
    };

    const getObject = (id) => {
      return this.objects[id];
    }
  
    const isEmpty = (value) => { 
      if (Array.isArray(value)) { 
        return value.length === 0; 
      } else if ($.isPlainObject(value)) { 
        return Object.keys(value).length === 0; 
      }
      return false;
    };

    const readOnly = (key) => {
      return key == 'uuid' || key == 'type' ? 'readonly' : '';
    }

    const isPresent = (object) => {
      return typeof value !== 'function' && object && !isEmpty(object);
    }

    const printItem = (key, value, popoverID) => {
      let parameter = {
        key: key,
        value: value,
        popoverID: popoverID,
        readOnly: readOnly
      };
      if (typeof value === 'object') {
        this.objects[popoverID] = value;
      }
      const html = ejs.render(itemTemplate, parameter);
      return html;
    }

    const onDialogOpen = (event, ui) => {
      var $dialog = $(event.target);
      $dialog.find('.value-text').each(function(_index, text) {
        $(text).spinner({});
      });
    }
    const printObject = (name, data) => {
      const html = ejs.render(objectTemplate, {
        name: name,
        data: data,
        popoverID: popoverID(),
        printItem: printItem,
        isPresent: isPresent
      });

      // Nächste popup ID
      this.#popoverNumber += 1;

      return html;
    };

    const openDialog = (key, object) => {
      let id = 'object_properties_' + this.#popoverNumber;
      this.dialogs.push(id);
      $('#object_properties').append('<div id="' + id + '" class="object-properties"></div>');
      $('#' + id).dialog({
        autoOpen: false,
        close: function() {
          $(this).dialog("destroy").remove();
        },
        title: key,
        maxHeight: $(window).height() * 0.9, // geht nicht mit CSS!
        maxWidth: $(window).width() * 0.9,
        open: onDialogOpen      
      }).html(printObject(key, object))
      .dialog('open');
    }

    const onClick = (event) => {
      let button = event.target,
      key = $(button).data('key'),
      id = $(button).data('popover-id'),
      object = getObject.call(this, id);
      openDialog(key, object);
    };
    
    if (!ObjectProperties.initialized) {
      ObjectProperties.initialized = true;
      $(document).on('click', '.object-property-button', onClick.bind(this));
    }
    
    // Dialog zeigen
    openDialog(name, object);
  };

  removeAll = () => {
    this.dialogs.forEach(function (dlg) {
      $('#' + dlg).dialog('close');
    });
    this.dialogs  = [];
  }
}
