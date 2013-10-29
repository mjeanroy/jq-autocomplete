/**
 * jQuery AutoComplete Component.
 */

(function(factory) {

  'use strict';

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }

}(function($) {

  'use strict';
  /*jshint -W018 */

  /** Function that return parameter */
  var identity = function(param) {
    return param;
  };

  /** No Op function */
  var noop = function() {
  };

  /** Function that return always true */
  var fnTrue = function() {
    return true;
  };

  /**
   * Namespace use to bind user events.
   * @type {string}
   * @const
   */
  var NAMESPACE = '.jqauto';

  /**
   * Plugin name in jQuery cache data.
   * @type {string}
   * @const
   */
  var PLUGIN_NAME = 'jqAutoComplete';

  /**
   * Enter Key Code.
   * @type {number}
   * @const
   */
  var ENTER_KEY = 13;

  /**
   * Key associated to arrow down on keyboard.
   * @type {number}
   * @const
   */
  var ARROW_DOWN = 40;

  /**
   * Key associated to arrow up on keyboard.
   * @type {number}
   * @const
   */
  var ARROW_UP = 38;

  /**
   * Key associated to tab on keyboard.
   * @type {number}
   * @const
   */
  var TAB = 9;

  var CSS_PREFIX = 'jq-autocomplete-';

  /**
   * Css class use on list items.
   * @type {string}
   * @const
   */
  var ITEM_CLASS = CSS_PREFIX + 'item';

  /**
   * Css class use on active items.
   * @type {string}
   * @const
   */
  var ACTIVE_CLASS = CSS_PREFIX + 'item-active';

  /**
   * Css class use on result box.
   * @type {string}
   * @const
   */
  var RESULT_CLASS = CSS_PREFIX + 'results';

  /**
   * Css class use on result list.
   * @type {string}
   * @const
   */
  var RESULT_LIST_CLASS = CSS_PREFIX + 'results-list';

  /**
   * Css class use on result list.
   * @type {string}
   * @const
   */
  var CREATE_LINK_CLASS = CSS_PREFIX + 'create-link';

  /**
   * Css class use on form creation.
   * @type {string}
   * @const
   */
  var CREATE_FORM_CLASS = CSS_PREFIX + 'create-form';

  /**
   * Css class use on wrapper for buttons.
   * @type {string}
   * @const
   */
  var FORM_BUTTONS_CLASS = CSS_PREFIX + 'create-form-buttons';

  /**
   * Get attribute value of object.
   * @param {object} obj Object to look for.
   * @param {string} key Name of attribute.
   * @returns {*} Value associated to key in object.
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

  /**
   * Get data attribute value of dom element.
   * @param {jQuery} $obj jQuery element.
   * @param {string} data Data attribute name (without 'data-')
   * @returns {string} Data attribute value.
   */
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

    this.top = -1;
    this.left = -1;
    this.width = -1;

    this.timer = null;
    this.xhr = null;
  };

  AutoComplete.prototype = {
    /** Initialize autocomplete. */
    init: function() {
      this.$ul = $('<ul></ul>').addClass(RESULT_LIST_CLASS);

      var relativeTo = this.opts.relativeTo;
      var position = 'fixed';
      var isFixed = !!(relativeTo === 'fixed');

      if (!isFixed) {
        var $relativeTo = relativeTo ? $(relativeTo) : this.$input.parent();
        $relativeTo.css('position', 'relative');
        position = 'absolute';
      }

      this.position = position;
      this.fixed = isFixed;

      this.$results = $('<div></div>')
        .addClass(RESULT_CLASS)
        .append(this.$ul);

      if (this.opts.$createForm) {
        this.appendForm();
      }

      this.$input.after(this.$results);

      this.positionResult();

      // Bind User-Events
      this.bind();
    },

    /** Append creation form to custom results */
    appendForm: function() {
      if (this.opts.createLabel) {
        this.$link = $('<a></a>')
          .attr('href', '#')
          .addClass(CREATE_LINK_CLASS)
          .html(this.opts.createLabel)
          .prependTo(this.$results);
      }

      this.$form = $(this.opts.$createForm)
        .clone()
        .addClass(CREATE_FORM_CLASS)
        .appendTo(this.$results);

      var submitLabel = this.opts.submit;
      var cancelLabel = this.opts.cancel;

      if (submitLabel || cancelLabel) {
        var $btnsWrappers = $('<div></div>')
          .addClass(FORM_BUTTONS_CLASS)
          .appendTo(this.$form);

        // Append 'submit' button
        if (submitLabel) {
          $('<button></button>')
            .attr('type', 'submit')
            .attr('title', submitLabel)
            .addClass('btn')
            .addClass('btn-success')
            .html(submitLabel)
            .appendTo($btnsWrappers);
        }

        // Append 'cancel' button
        if (cancelLabel) {
          this.$cancel = $('<button></button>')
            .attr('type', 'button')
            .attr('title', cancelLabel)
            .addClass('btn')
            .addClass('btn-default')
            .html(cancelLabel)
            .appendTo($btnsWrappers);
        }
      }
    },

    /**
     * Read data attributes used to initialize autocomplete.
     * @return {object} Initialization object initialized with data attributes.
     */
    readDatas: function() {
      var datas = {};
      var $input = this.$input;

      datas.minSize = data($input, 'min-size');
      datas.limit = data($input, 'limit');
      datas.url = data($input, 'url');
      datas.saveUrl = data($input, 'save-url');
      datas.saveMethod = data($input, 'save-method');
      datas.saveDataType = data($input, 'save-data-type');
      datas.$createForm = data($input, 'create-form');
      datas.createLabel = data($input, 'create-label');
      datas.cancel = data($input, 'Cancel');
      datas.submit = data($input, 'Submit');
      datas.method = data($input, 'method');
      datas.limitName = data($input, 'limit-name');
      datas.filterName = data($input, 'filter-name');
      datas.label = data($input, 'label');
      datas.cache = data($input, 'cache') || false;
      datas.relativeTo = data($input, 'relative-to');

      if (datas.minSize !== undefined) {
        datas.minSize = parseInt(datas.minSize, 10);
      }
      if (datas.limit !== undefined) {
        datas.limit = parseInt(datas.limit, 10);
      }
      if (typeof datas.cache === 'string') {
        datas.cache = !!(datas.cache === 'true');
      }

      return datas;
    },

    /** Position result list in fixed position below input field. */
    positionResult: function() {
      // Get Input Position
      var $input = this.$input;

      var position = this.fixed ? $input.offset() : $input.position();
      var width = $input.outerWidth();
      var height = $input.outerHeight();

      var left = position.left;
      var top = position.top + height;

      if (this.left !== left || this.top !== top || this.width !== width) {
        this.left = left;
        this.top = top;
        this.width = width;

        this.$results.css({
          'position': this.position,
          'left': left,
          'top': top,
          'width': width
        });
      }
    },

    /** Bind User-Events on autocomplete. */
    bind: function() {
      var that = this;

      this.$input.on('keyup' + NAMESPACE, function(e) {
        var keyCode = e.keyCode;
        if (keyCode !== ENTER_KEY && keyCode !== ARROW_DOWN && keyCode !== ARROW_UP) {
          var filter = $.trim($(this).val());
          if (filter.length >= that.opts.minSize) {
            that.fetch(filter);
          }
          else {
            that.filter = filter;
            that.$hide();
            that.clear();
          }
        }
      });

      this.$input.on('keydown' + NAMESPACE, function(e) {
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
        else if (keyCode === ENTER_KEY) {
          if (that.idx >= 0 && that.idx < that.results.length) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
            that.select(that.idx);
            $(this).focus();
          }
        }
        else if (keyCode === TAB) {
          that.select(that.idx);
        }
      });

      this.$input.on('focusout' + NAMESPACE, function() {
        that.focus = false;
        var $this = $(this);
        setTimeout(function() {
          if (!that.focus && !that.$creation && that.$ul) {
            that.$hide();
            if (!that.item) {
              that.autoSelect($.trim($this.val()));
            }
            that.opts.focusout.call(that, that.item);
          }
        }, 200);
      });

      this.$input.on('focusin' + NAMESPACE, function() {
        that.focus = true;
        if ((!that.item) && (that.results.length > 0)) {
          that.$show();
        }
      });

      this.$ul.on('mouseenter' + NAMESPACE, function() {
        $(this).find('li').removeClass(ACTIVE_CLASS);
      });

      this.$ul.on('click' + NAMESPACE, 'li', function() {
        that.select(parseInt($(this).attr('data-idx'), 10));
        that.$input.focus();
      });

      this.bindForm();
    },

    /** Bind events used to manage creation form */
    bindForm: function() {
      var that = this;

      if (this.$link) {
        this.$link.on('click' + NAMESPACE, function(e) {
          e.preventDefault();
          that.showCreationForm();
        });
      }

      if (this.$cancel) {
        this.$cancel.on('click' + NAMESPACE, function() {
          that.hideCreationForm();
        });
      }

      if (this.$form) {
        this.$form.on('submit' + NAMESPACE, function(e) {
          e.preventDefault();
          that.create();
        });
      }
    },

    /**
     * Check if item is set.
     * @returns {boolean} True if item is set, false otherwise.
     */
    isEmpty: function() {
      return this.item === undefined || this.item === null;
    },

    /**
     * Fetch results with given filter.
     * @param {string} filter Filter to fetch.
     */
    fetch: function(filter) {
      if (this.filter === filter) {
        // If filter do not change, don't do anything
        if (this.isEmpty()) {
          this.$show();
        }
        return;
      }

      if (!this.isEmpty()) {
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

    /** Clear cache. */
    clearCache: function() {
      this.caches = {};
    },

    /**
     * Show current datas in results list.
     * @param {Array<object>} datas New results to display.
     */
    show: function(datas) {
      this.results = datas;

      if (datas.length === 0 && !this.$form) {
        this.clear();
        return;
      }

      this.$hide();
      this.$ul.empty();

      for (var i = 0, ln = datas.length; i < ln; ++i) {
        var label = this.renderItem(datas[i]);
        $('<li />')
          .addClass(ITEM_CLASS)
          .attr('data-idx', i)
          .attr('title', label)
          .html(label)
          .appendTo(this.$ul);
      }

      this.$show();
    },

    /** Hide autocomplete */
    hide: function() {
      this.$hide();
    },

    /**
     * Show result list.
     * @returns {jQuery} Result object.
     */
    $show: function() {
      this.positionResult();
      this.$results.show();
      this.opts.onShown.call(this);
    },

    /**
     * Hide result list.
     * @returns {jQuery} Result object.
     */
    $hide: function() {
      this.$results.hide();
      this.hideCreationForm();
      this.opts.onHidden.call(this);
    },

    /** Show form used to create new item. */
    showCreationForm: function() {
      if (this.$form) {
        var that = this;
        this.$creation = true;
        this.$ul.fadeOut('fast', function() {
          if (that.$link) {
            that.$link.hide();
          }

          that.$form.show();
          that.$form.find('input[type="text"]').eq(0)
            .val(that.$input.val())
            .focus();
        });
      }
    },

    /** Hide form used to create new item. */
    hideCreationForm: function() {
      if (this.$form) {
        var that = this;
        this.$creation = false;
        this.$form.fadeOut('fast', function() {
          if (that.$link) {
            that.$link.show();
          }

          that.$ul.show();
          that.$input.focus();
        });
      }
    },

    /** Create new item */
    create: function() {
      if (this.$creation && !this.$saving) {
        this.$saving = true;

        // Check form validity
        var array = this.$form.serializeArray();

        var datas = {};
        $.each(array, function() {
          if (datas[this.name] !== undefined) {
            if (!datas[this.name].push) {
              datas[this.name] = [datas[this.name]];
            }
            datas[this.name].push(this.value || '');
          } else {
            datas[this.name] = this.value || '';
          }
        });

        if (!this.opts.isValid(datas, this.$form)) {
          this.$saving = false;
          return;
        }

        // Callback
        datas = $.extend(datas, this.opts.onSaved(datas) || {});

        var url = this.opts.saveUrl || this.$form.attr('action') || this.opts.url;
        var method = this.opts.saveMethod || this.$form.attr('method');
        var dataType = this.opts.saveDataType;

        var xhr = $.ajax({
          url: url,
          type: method,
          dataType: dataType,
          data: datas
        });

        var that = this;

        xhr.done(function(data) {
          that.opts.onSavedSuccess.apply(null, arguments);
          that.val(data);
          that.$hide();
        });

        xhr.fail(function() {
          that.opts.onSavedFailed.apply(null, arguments);
        });

        xhr.always(function() {
          that.$saving = false;
        });
      }
    },

    /**
     * Set item as selected value.
     * @param {*} obj Object to select.
     */
    val: function(obj) {
      this.item = obj;
      this.filter = this.renderItem(obj);
      this.$input.val(this.filter);
      this.$hide();
      this.idx = -1;
      this.opts.select.call(this, obj);
    },

    /**
     * Render an item.
     * @param {object|string|number} obj Object to render.
     * @returns {*} Result of render function.
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
     */
    select: function(idx) {
      if (idx >= 0 && idx < this.results.length) {
        this.val(this.results[idx]);
      }
    },

    /**
     * Auto Select a result in the list of results.<br />
     * We search for the same filter (case insensitive) in the list of results.
     * @param {string} filter Current filter to search.
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
     */
    clear: function() {
      if (this.item !== undefined && this.item !== null) {
        this.opts.unSelect.call(this);
      }

      this.$hide();
      this.$ul.empty();
      this.results = [];
      this.idx = -1;
      this.item = null;
    },

    /** Clear autocomplete and set input to an empty string. */
    empty: function() {
      this.clear();
      this.$input.val('');
      this.resetForm();
    },

    /** Reset form values */
    resetForm: function() {
      if (this.$form) {
        this.$form.find('input[type!="hidden"], select').each(function() {
          $(this).val('');
        });
      }
    },

    /** Unbind user events handlers. */
    unbind: function() {
      this.$input.off(NAMESPACE);
      this.$ul.off(NAMESPACE);
      this.unbindForm();
    },

    /** Unbind creation form */
    unbindForm: function() {
      if (this.$form) {
        this.$form.off(NAMESPACE);
      }
      if (this.$cancel) {
        this.$cancel.off(NAMESPACE);
      }
      if (this.$link) {
        this.$link.off(NAMESPACE);
      }
    },

    /** Destroy autocomplete component. */
    destroy: function() {
      this.opts.onDestroyed.call(this);
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

    /** Destroy autocomplete */
    this.destroy = function() {
      var $this = $(this);
      $this.data(PLUGIN_NAME).destroy();
      $this.removeData(PLUGIN_NAME);
    };

    /** Clear autocomplete suggestions */
    this.clear = function() {
      $(this).data(PLUGIN_NAME).clear();
      return that;
    };

    /** Empty autocomplete */
    this.empty = function() {
      $(this).data(PLUGIN_NAME).empty();
      return that;
    };

    /** Get/Set value */
    this.val = function(obj) {
      var autocomplete = $(this).data(PLUGIN_NAME);
      if (obj) {
        autocomplete.val(obj);
        return that;
      }
      return autocomplete.item;
    };

    /** Hide autocomplete */
    this.hide = function() {
      $(this).data(PLUGIN_NAME).hide();
    };

    /**
     * Show autocomplete with specified datas
     * @param {array} datas Datas.
     */
    this.show = function(datas) {
      $(this).data(PLUGIN_NAME).show(datas);
    };

    /** Clear autocomplete internal cache */
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
    saveUrl: '',
    label: identity,
    minSize: 3,
    method: 'GET',
    saveMethod: '',
    saveDataType: 'json',
    filterName: 'filter',
    limitName: 'limit',
    limit: 10,
    datas: null,
    cache: false,
    $createForm: null,
    createLabel: 'Not here? Create it!',
    cancel: 'Cancel',
    submit: 'Save',
    onSaved: identity,
    onSavedSuccess: noop,
    onSavedFailed: noop,
    isValid: fnTrue,
    relativeTo: null,
    focusout: noop,
    select: noop,
    unSelect: noop,
    onShown: noop,
    onHidden: noop,
    onDestroyed: noop
  };

}));
