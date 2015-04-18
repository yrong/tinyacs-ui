/*
 * Impacts the responce rate of some of the responsive elements (lower
 * value affects CPU but improves speed)
 */
var throttle_delay = 350;

/*
 * RESIZER WITH THROTTLE
 * Source: http://benalman.com/code/projects/jquery-resize/examples/resize/
 */
(function($, window, undefined) {

  var elems = $([]),
    jq_resize = $.resize = $.extend($.resize, {}),
    timeout_id, str_setTimeout = 'setTimeout',
    str_resize = 'resize',
    str_data = str_resize + '-special-event',
    str_delay = 'delay',
    str_throttle = 'throttleWindow';

  jq_resize[str_delay] = throttle_delay;

  jq_resize[str_throttle] = true;

  $.event.special[str_resize] = {

    setup: function() {
      if (!jq_resize[str_throttle] && this[str_setTimeout]) {
        return false;
      }

      var elem = $(this);
      elems = elems.add(elem);
      try {
        $.data(this, str_data, {
          w: elem.width(),
          h: elem.height()
        });
      } catch (e) {
        $.data(this, str_data, {
          w: elem.width, // elem.width();
          h: elem.height // elem.height();
        });
      }

      if (elems.length === 1) {
        loopy();
      }
    },
    teardown: function() {
      if (!jq_resize[str_throttle] && this[str_setTimeout]) {
        return false;
      }

      var elem = $(this);
      elems = elems.not(elem);
      elem.removeData(str_data);
      if (!elems.length) {
        clearTimeout(timeout_id);
      }
    },

    add: function(handleObj) {
      if (!jq_resize[str_throttle] && this[str_setTimeout]) {
        return false;
      }
      var old_handler;

      function new_handler(e, w, h) {
        var elem = $(this),
          data = $.data(this, str_data);
        data.w = w !== undefined ? w : elem.width();
        data.h = h !== undefined ? h : elem.height();

        old_handler.apply(this, arguments);
      }
      if ($.isFunction(handleObj)) {
        old_handler = handleObj;
        return new_handler;
      } else {
        old_handler = handleObj.handler;
        handleObj.handler = new_handler;
      }
    }
  };

  function loopy() {
    timeout_id = window[str_setTimeout](function() {
      elems.each(function() {
        var width;
        var height;

        var elem = $(this),
          data = $.data(this, str_data); //width = elem.width(), height = elem.height();

        // Highcharts fix
        try {
          width = elem.width();
        } catch (e) {
          width = elem.width;
        }

        try {
          height = elem.height();
        } catch (e) {
          height = elem.height;
        }
        //fixed bug


        if (width !== data.w || height !== data.h) {
          if (elem.ownerDocument) { // Highcharts/SVG fix
            elem.trigger(str_resize, [data.w = width, data.h = height]);
          }
        }

      });
      loopy();

    }, jq_resize[str_delay]);

  }

})(jQuery, this);
