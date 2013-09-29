/**
 * jQuery AutoComplete Component.
 */

(function($, window) {

  'use strict';

  /**
   * Enter Key Code.
   * @type {number}
   * @const
   * @private
   */
  var ENTER_KEY = 13;

  var AutoComplete = function(options, input) {
    this.$input = $(input);
    this.opts = options;

    this.filter = '';
    this.results = [];
    this.idx = -1;

    this.timer = null;
    this.xhr = null;
  };

  AutoComplete.prototype = {
    /**
     * Initialize autocomplete.
     * @public
     */
    init: function() {
      // Add relative position to parent
      this.$input.parent().css('position', 'relative');

      // Get Input Position
      var position = this.$input.offset();
      var width = this.$input.outerWidth();
      var height = this.$input.outerHeight();

      // Add UL element to append results
      this.$ul = $('<ul></ul>')
        .addClass('jq-autocomplete-results')
        .css({
          'position': 'fixed',
          'left': position.left,
          'top': position.top + height,
          'width': width
        });

      this.$input.after(this.$ul);

      // Bind User-Events
      this.bind();
    },

    /**
     * Bind User-Events on autocomplete.
     * @public
     */
    bind: function() {
      var that = this;

      this.$input.on('keyup.jqauto', function(e) {
        if (e.keyCode === ENTER_KEY) {
          // Enter key
          that.select(that.idx);
          $(this).focus();
        }
      });
    },

    select: function(idx) {
      if (idx >= 0 && idx < this.results.length) {
      }
    },

    clear: function() {
      this.$ul.hide();
      this.clearResults();
    },

    clearResults: function() {
      this.results = [];
      this.idx = -1;
      this.item = null;
    }
  };

  $.fn.jqAutoComplete = function(options) {

    return this.each(function() {
      var autocomplete = $(this).data('jqAutoComplete');
      if (!autocomplete) {
        var opts = {};
        if (typeof options === 'object') {
          opts = $.extend({}, $.fn.jqAutoComplete.options, options);
        }
        autocomplete = new AutoComplete(opts, this);
        autocomplete.init();
      }
      $(this).data('jqAutoComplete', autocomplete);
    });
  };

  $.fn.jqAutoComplete.options = {
    url: '',
    label: 'label'
  };

})(jQuery, window);
