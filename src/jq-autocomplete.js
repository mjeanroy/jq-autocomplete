/**
 * jQuery AutoComplete Component.
 */

(function($) {

  'use strict';

  /**
   * Enter Key Code.
   * @type {number}
   * @const
   * @private
   */
  var ENTER_KEY = 13;

  /**
   * Key associated to arrow down on keyboard.
   * @type {number}
   * @const
   * @private
   */
  var ARROW_DOWN = 40;

  /**
   * Key associated to arrow up on keyboard.
   * @type {number}
   * @const
   * @private
   */
  var ARROW_UP = 38;

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
        var keyCode = e.keyCode;
        if (keyCode === ENTER_KEY) {
          // Enter key
          that.select(that.idx);
          $(this).focus();
        }
        else if (keyCode !== ARROW_DOWN && keyCode !== ARROW_UP) {
          var filter = $.trim($(this).val());
          if (filter.length >= that.opts.minSize) {
            that.fetch(filter);
          }
          else {
            that.filter = filter;
            that.$ul.hide();
            that.clearResults();
          }
        }
      });

      this.$input.on('keydown.jqauto', function(e) {
        var keyCode = e.keyCode;
        if (keyCode === ARROW_DOWN) {
          e.preventDefault();
          e.stopPropagation();
          that.highlight(that.idx + 1);
        }
        else if (keyCode === ARROW_UP) {
          e.preventDefault();
          e.stopPropagation();
          that.highlight(that.idx - 1);
        }
      });
    },

    /**
     * Fetch results with given filter.
     * @param {string} filter Filter to fetch.
     * @public
     */
    fetch: function(filter) {
      if (this.filter === filter) {
        // If filter do not change, don't do anything
        this.$ul.show();
        return;
      }

      // Filter changed, unset item
      this.item = null;

      // Update filter
      this.filter = filter;

      // Abort current request if a request is pending
      if (this.xhr) {
        this.xhr.abort();
        this.xhr = null;
      }

      // Abort current timer
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      var that = this;

      var request = function() {
        // Build default parameters
        var params = {};

        params[that.opts.filterName] = that.filter;
        if (that.opts.limit > 0) {
          params[that.opts.limitName] = that.opts.limit;
        }

        // Append custom datas to parameters
        if (that.opts.datas) {
          if (typeof that.opts.datas === 'object') {
            params = $.extend(params, that.opts.datas);
          }
          else if (typeof that.opts.datas === 'function') {
            params = $.extend(params, that.opts.datas.apply(this));
          }
        }

        // Launch request
        that.xhr = $.ajax({
          url: that.opts.url,
          type: that.opts.method,
          dataType: 'json',
          data: params
        });

        that.xhr.done(function(datas) {
          that.timer = null;
          that.xhr = null;
          that.show(datas);
        });
      };

      // Launch request in 200ms
      // If user type something else in the meantime, request will be aborted
      this.timer = setTimeout(request, 200);
    },

    show: function(datas) {

    },

    select: function(idx) {
      if (idx >= 0 && idx < this.results.length) {
      }
    },

    /**
     * Highlight item at given index.
     * @param {number} idx Index.
     * @public
     */
    highlight: function(idx) {
      var ln = this.results.length;
      if (!ln) {
        return;
      }

      if (idx < 0) {
        idx = ln - 1;
      }
      else if (idx >= ln) {
        idx = 0;
      }

      var activeClass = 'jq-autocomplete-item-active';
      this.$ul.find('li')
        .removeClass(activeClass)
        .eq(idx).addClass(activeClass);

      this.idx = idx;
    },

    /**
     * Clear autocomplete :
     * - Clear and hide results.
     * - Reset variable storing results and current selected item.
     * @public
     */
    clear: function() {
      this.$ul.empty().hide();
      this.results = [];
      this.idx = -1;
      this.item = null;
    },

    /**
     * Clear autocomplete and set input to an empty string.
     * @public
     */
    empty: function() {
      this.clear();
      this.$input.val('');
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
    label: 'label',
    minSize: 3,
    method: 'GET',
    filterName: 'filter',
    limitName: 'limit',
    limit: 10,
    datas: null
  };

})(jQuery);
