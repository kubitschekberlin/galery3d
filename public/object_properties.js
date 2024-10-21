import $ from 'jquery';
import ejs from 'ejs';

export class ObjectProperties {
  #template;
  #innerTemplate;

  constructor(template, innerTemplate) {
    this.#template = template;
    this.#innerTemplate = innerTemplate;
  }

  show = (object) => {
    console.log(object);
    const html = ejs.render(this.#template, { 
      data: object,
      renderItem: (key, value) => { return ejs.render(this.#innerTemplate, {key: key, value: value}) }
     });
    console.log(html);
    $('#object_properties').html(html);
  }
}

