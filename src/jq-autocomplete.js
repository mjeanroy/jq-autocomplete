/**
 * jQuery AutoComplete Component.
 */

(function($) {

  'use strict';

  var identity = function(param) {
    return param;
  };

  var noop = function() {
  };

  /**
   * Plugin name in jQuery cache data.
   * @type {string}
   * @const
   * @private
   */
  var PLUGIN_NAME = 'jqAutoComplete';

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

  /**
   * Key associated to tab on keyboard.
   * @type {number}
   * @const
   * @private
   */
  var TAB = 9;

  /**
   * Css class use on list items.
   * @type {string}
   * @const
   * @private
   */
  var ITEM_CLASS = 'jq-autocomplete-item';

  /**
   * Css class use on active items.
   * @type {string}
   * @const
   * @private
   */
  var ACTIVE_CLASS = 'jq-autocomplete-item-active';

  /**
   * Css class use on result list.
   * @type {string}
   * @const
   * @private
   */
  var RESULT_CLASS = 'jq-autocomplete-results';

  /**
   * Get attribute value of object.
   * @param {object} obj Object to look for.
   * @param {string} key Name of attribute.
   * @returns {*} Value associated to key in object.
   * @private
   */
  var attr = function(obj, key) {
    if (!obj || !key) {
      return obj;
    }

    var subKeys = key.split('.');
    var current = obj;
    var ln = subKeys.length;
    for (var i = 0; i < (ln - 1); ++i) {
      current = current[subKeys[i]];
      if (current === null || current === undefined) {
        return '';
      }
    }

    return current[subKeys[ln - 1]];
  };

  var data = function($obj, data) {
    var value = $obj.attr('data-' + data);
    if (value === '') {
      value = undefined;
    }
    return value;
  };

  var AutoComplete = function(options, input) {
    this.$input = $(input);

    // Override options with data attributes
    this.opts = $.extend({}, options, this.readDatas());

    this.caches = {};
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
      this.$ul = $('<ul></ul>').addClass(RESULT_CLASS);
      this.positionResult();

      this.$input.after(this.$ul);

      // Bind User-Events
      this.bind();
    },

    /**
     * Read data attributes used to initialize autocomplete.
     * @return {object} Initialization object initialized with data attributes.
     * @public
     */
    readDatas: function() {
      var datas = {};
      var $input = this.$input;
      datas.minSize = data($input, 'min-size');
      datas.limit = data($input, 'limit');
      datas.url = data($input, 'url');
      datas.method = data($input, 'method');
      datas.limitName = data($input, 'limit-name');
      datas.filterName = data($input, 'filter-name');
      datas.label = data($input, 'label');
      datas.cache = data($input, 'cache') || false;

      if (datas.minSize !== undefined) {
        datas.minSize = parseInt(datas.minSize, 10);
      }
      if (datas.limit !== undefined) {
        datas.limit = parseInt(datas.limit, 10);
      }
      if (typeof datas.cache === 'string') {
        datas.cache = datas.cache === 'true' ? true : false;
      }

      return datas;
    },

    /**
     * Position result list in fixed position below input field.
     * @public
     */
    positionResult: function() {
      // Get Input Position
      var position = this.$input.offset();
      var width = this.$input.outerWidth();
      var height = this.$input.outerHeight();

      this.$ul.css({
        'position': 'fixed',
        'left': position.left,
        'top': position.top + height,
        'width': width
      });
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
            that.clear();
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
        else if (keyCode === TAB) {
          that.select(that.idx);
        }
      });

      this.$input.on('focusout.jqauto', function() {
        that.focus = false;
        var $this = $(this);
        setTimeout(function() {
          if (!that.focus && that.$ul) {
            that.$ul.hide();
            if (!that.item) {
              that.autoSelect($.trim($this.val()));
            }
          }
        }, 200);
      });

      this.$input.on('focusin.jqauto', function() {
        that.focus = true;
        if ((!that.item) && (that.results.length > 0)) {
          that.$ul.show();
        }
      });

      this.$ul.on('mouseenter.jqauto', function() {
        $(this).find('li').removeClass(ACTIVE_CLASS);
      });

      this.$ul.on('click.jqauto', 'li', function() {
        that.select(parseInt($(this).attr('data-idx'), 10));
        that.$input.focus();
      });
    },

    /**
     * Check if item is set.
     * @returns {boolean} True if item is set, false otherwise.
     * @public
     */
    itemIsEmpty: function () {
      return this.item === undefined || this.item === null;
    },

    /**
     * Fetch results with given filter.
     * @param {string} filter Filter to fetch.
     * @public
     */
    fetch: function(filter) {
      if (this.filter === filter) {
        // If filter do not change, don't do anything
        if (this.itemIsEmpty()) {
          this.$ul.show();
        }
        return;
      }

      if (!this.itemIsEmpty()) {
        this.opts.unSelect.call(this);
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

      // Use a case-insensitive cache
      var key = filter.toLowerCase();

      if (this.opts.cache && this.caches[key]) {
        // Get from cache
        this.show(this.caches[key]);
      }
      else {
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

            if (that.opts.cache) {
              // Store in cache
              that.caches[key] = datas;
            }

            that.show(datas);
          });
        };

        // Launch request in 200ms
        // If user type something else in the meantime, request will be aborted
        this.timer = setTimeout(request, 200);
      }
    },

    /**
     * Clear cache.
     * @public
     */
    clearCache: function() {
      this.caches = {};
    },

    /**
     * Show current datas in results list.
     * @param {Array<object>} datas New results to display.
     * @public
     */
    show: function(datas) {
      this.results = datas;

      if (datas.length === 0) {
        this.clear();
        return;
      }

      this.$ul.hide().empty();

      for (var i = 0, ln = datas.length; i < ln; ++i) {
        $('<li />')
          .addClass(ITEM_CLASS)
          .attr('data-idx', i)
          .html(this.renderItem(datas[i]))
          .appendTo(this.$ul);
      }

      this.$ul.show();
    },

    /**
     * Set item as selected value.
     * @param {*} obj Object to select.
     * @public
     */
    setItem: function(obj) {
      this.item = obj;
      this.filter = this.renderItem(obj);
      this.$input.val(this.filter);
      this.$ul.hide();
      this.idx = -1;
      this.opts.select.call(this, obj);
    },

    /**
     * Render an item.
     * @param {object|string|number} obj Object to render.
     * @returns {*} Result of render function.
     * @public
     */
    renderItem: function(obj) {
      var label = this.opts.label;
      var txt = $.isFunction(label) ? label.call(null, obj) : attr(obj, label);
      if (txt === undefined || txt === null) {
        txt = '';
      }
      return txt;
    },

    /**
     * Select item at given index (into results list).
     * @param {number} idx Index.
     * @public
     */
    select: function(idx) {
      if (idx >= 0 && idx < this.results.length) {
        this.setItem(this.results[idx]);
      }
    },

    /**
     * Auto Select a result in the list of results.<br />
     * We search for the same filter (case insensitive) in the list of results.
     * @param {string} filter Current filter to search.
     * @public
     */
    autoSelect: function(filter) {
      var results = this.results;
      var f = filter.toLowerCase();

      for (var i = 0, ln = results.length; i < ln; ++i) {
        var label = this.renderItem(results[i]).toLowerCase();
        if (label === f) {
          this.select(i);
          return;
        }
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

      this.$ul.find('li')
        .removeClass(ACTIVE_CLASS)
        .eq(idx).addClass(ACTIVE_CLASS);

      this.idx = idx;
    },

    /**
     * Clear autocomplete :
     * - Clear and hide results.
     * - Reset variable storing results and current selected item.
     * @public
     */
    clear: function() {
      if (this.item !== undefined && this.item !== null) {
        this.opts.unSelect.call(this);
      }

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
    },

    /**
     * Unbind user events handlers.
     * @public
     */
    unbind: function() {
      this.$input.off('.jqauto');
      this.$ul.off('.jqauto');
    },

    /**
     * Destroy autocomplete component.
     * @public
     */
    destroy: function() {
      this.unbind();
      this.$ul.remove();

      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (this.xhr) {
        this.xhr.abort();
      }

      for (var i in this) {
        if (this.hasOwnProperty(i)) {
          this[i] = null;
        }
      }
    }
  };

  $.fn.jqAutoComplete = function(options) {
    var that = this;

    this.destroy = function() {
      $(this).data(PLUGIN_NAME).destroy();
      return that;
    };

    this.clear = function() {
      $(this).data(PLUGIN_NAME).clear();
      return that;
    };

    this.empty = function() {
      $(this).data(PLUGIN_NAME).empty();
      return that;
    };

    this.item = function(obj) {
      var autocomplete = $(this).data(PLUGIN_NAME);
      if (obj) {
        autocomplete.setItem(obj);
        return that;
      }
      return autocomplete.item;
    };

    this.clearCache = function() {
      $(this).data(PLUGIN_NAME).clearCache();
      return that;
    };

    return this.each(function() {
      var autocomplete = $(this).data(PLUGIN_NAME);
      if (!autocomplete) {
        var opts = $.extend({}, $.fn.jqAutoComplete.options);
        if (typeof options === 'object') {
          opts = $.extend(opts, options);
        }
        autocomplete = new AutoComplete(opts, this);
        autocomplete.init();
      }
      $(this).data(PLUGIN_NAME, autocomplete);
    });
  };

  $.fn.jqAutoComplete.options = {
    url: '',
    label: identity,
    minSize: 3,
    method: 'GET',
    filterName: 'filter',
    limitName: 'limit',
    limit: 10,
    datas: null,
    cache: false,
    select: noop,
    unSelect: noop
  };

})(jQuery);
