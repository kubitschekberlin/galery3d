import $ from 'jquery';
(function ($) { 
  $.fn.isEmpty = function (value) { 
    if (Array.isArray(value)) { 
      return value.length === 0; 
    } else if ($.isPlainObject(value)) { 
      return Object.keys(value).length === 0; 
    } else { 
      return false;
    } 
  };
})(jQuery);

