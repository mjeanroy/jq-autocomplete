/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 mickael.jeanroy@gmail.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function(window, undefined) {
  'use strict';

  (function(factory) {

    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(['jquery'], factory);
    } else {
      // Browser globals
      factory(jQuery);
    }

  }(function($) {

    // Label constants
    var FIXED = 'fixed';
    var TYPE = 'type';
    var TITLE = 'title';

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

    /**
     * Prefix added to every autocomplete classes.
     * @type {string}
     * @const
     */
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

    /**
     * Convert value to integer using radix 10.
     * @param {number|string} Value to convert.
     * @return {number} Parsed number.
     */
    var toInt = function(val) {
      return val === undefined || val === null ? val : parseInt(val, 10);
    };

    /**
     * Check if a string starts with another given string.
     * @param {string} str String to check.
     * @param {string} start Start pattern.
     * @returns {*} True if string start with given pattern, false otherwise.
     */
    var startsWith = function(str, start) {
      if (!String.prototype.startsWith) {
        return str.indexOf(start) === 0;
      } else {
        return str.startsWith(start);
      }
    };

    // Add special event to destroy plugin before it is removed from the DOM
    // Think about DOM Mutation Observer (DOMNodeRemoved event) if needed
    $.event.special.jqAutoCompleteRemoved = {
      remove: function(o) {
        if (o.handler) {
          o.handler();
        }
      }
    };

    var AutoComplete = function(options, input) {
      var that = this;

      that.$input = $(input);

      // Override options with data attributes
      var htmlData = options.parseHtml ? that.readData() : {};
      that.opts = $.extend({}, options, htmlData);

      that.caches = {};
      that.filter = '';
      that.results = [];
      that.idx = -1;

      that.top = -1;
      that.left = -1;
      that.width = -1;

      that.timer = null;
      that.xhr = null;
    };

    AutoComplete.prototype = {
      /** Initialize autocomplete. */
      init: function() {
        var that = this;

        that.$ul = $('<ul></ul>').addClass(RESULT_LIST_CLASS);

        var relativeTo = that.opts.relativeTo;
        var position = FIXED;
        var isFixed = !!(relativeTo === FIXED);

        if (!isFixed) {
          var $relativeTo = relativeTo ? $(relativeTo) : that.$input.parent();
          $relativeTo.css('position', 'relative');
          position = 'absolute';
        }

        that.position = position;
        that.fixed = isFixed;

        that.$results = $('<div></div>')
          .addClass(RESULT_CLASS)
          .append(that.$ul);

        if (that.opts.$createForm) {
          that.appendForm();
        }

        that.$input.after(that.$results);

        that.positionResult();

        // Bind User-Events
        that.bind();
      },

      /** Append creation form to custom results */
      appendForm: function() {
        var that = this;
        var $results = that.$results;

        var createLabel = that.opts.createLabel;
        if (createLabel) {
          that.$link = $('<a></a>')
            .attr('href', '#')
            .addClass(CREATE_LINK_CLASS)
            .html(createLabel)
            .prependTo($results);
        }

        that.$form = $(that.opts.$createForm)
          .clone()
          .addClass(CREATE_FORM_CLASS)
          .appendTo($results);

        var submitLabel = that.opts.submit;
        var cancelLabel = that.opts.cancel;

        if (submitLabel || cancelLabel) {
          var $buttonsWrappers = $('<div></div>')
            .addClass(FORM_BUTTONS_CLASS)
            .appendTo(that.$form);

          // Append 'submit' button
          if (submitLabel) {
            $('<button></button>')
              .attr(TYPE, 'submit')
              .attr(TITLE, submitLabel)
              .addClass('btn')
              .addClass('btn-success')
              .html(submitLabel)
              .appendTo($buttonsWrappers);
          }

          // Append 'cancel' button
          if (cancelLabel) {
            that.$cancel = $('<button></button>')
              .attr(TYPE, 'button')
              .attr(TITLE, cancelLabel)
              .addClass('btn')
              .addClass('btn-default')
              .html(cancelLabel)
              .appendTo($buttonsWrappers);
          }
        }
      },

      /**
       * Read data attributes used to initialize autocomplete.
       * @return {object} Initialization object initialized with data attributes.
       */
      readData: function() {
        var dataAttrs = this.$input.data();

        dataAttrs.$createForm = dataAttrs.createForm;
        delete dataAttrs.createForm;

        return dataAttrs;
      },

      /** Position result list in fixed position below input field. */
      positionResult: function() {
        var that = this;

        // Get Input Position
        var $input = that.$input;

        var position = that.fixed ? $input.offset() : $input.position();
        var width = $input.outerWidth();
        var height = $input.outerHeight();

        var left = position.left;
        var top = position.top + height;

        if (that.left !== left || that.top !== top || that.width !== width) {
          that.left = left;
          that.top = top;
          that.width = width;

          that.$results.css({
            'position': that.position,
            'left': left,
            'top': top,
            'width': width
          });
        }
      },

      /** Bind User-Events on autocomplete. */
      bind: function() {
        var that = this;
        var $input = that.$input;
        var $ul = that.$ul;

        var prevent = function(e, stopImmediate) {
          e.preventDefault();
          e.stopPropagation();
          if (stopImmediate) {
            e.stopImmediatePropagation();
          }
        };

        var onKeyup = function(e) {
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
        };

        var onKeydown = function(e) {
          var keyCode = e.keyCode;
          if (keyCode === ARROW_DOWN) {
            prevent(e);
            that.highlight(that.idx + 1);
          }
          else if (keyCode === ARROW_UP) {
            prevent(e);
            that.highlight(that.idx - 1);
          }
          else if (keyCode === ENTER_KEY) {
            if (that.idx >= 0 && that.idx < that.results.length) {
              prevent(e, true);
              that.select(that.idx);
              $(this).focus();
            }
          }
          else if (keyCode === TAB) {
            that.select(that.idx);
          }
        };

        var onFocusout = function() {
          that.focus = false;
          var $this = $(this);
          setTimeout(function() {
            if (that && !that.focus && !that.$creation && that.$ul) {
              that.$hide();
              if (!that.item) {
                that.autoSelect($.trim($this.val()));
              }
              that.opts.focusout.call(that, that.item);
            }
          }, 200);
        };

        var onFocusin = function() {
          that.focus = true;
          if ((!that.item) && (that.results.length > 0)) {
            that.$show();
          }
        };

        $input.on('keyup' + NAMESPACE, onKeyup);
        $input.on('keydown' + NAMESPACE, onKeydown);
        $input.on('focusout' + NAMESPACE, onFocusout);
        $input.on('focusin' + NAMESPACE, onFocusin);

        var onMouseenter = function() {
          $(this).find('li').removeClass(ACTIVE_CLASS);
        };

        var onClickItem = function() {
          that.select(toInt($(this).attr('data-idx')));
          that.$input.focus();
        };

        $ul.on('mouseenter' + NAMESPACE, onMouseenter);
        $ul.on('click' + NAMESPACE, 'li', onClickItem);

        var destroy = function() {
          if (that.destroy) {
            that.destroy();
          }
          that = null;
          $input = null;
          $ul = null;
        };

        $input.on('jqAutoCompleteRemoved', destroy);

        that.bindForm();
      },

      /** Bind events used to manage creation form */
      bindForm: function() {
        var that = this;

        if (that.$link) {
          var onClickShowForm = function(e) {
            e.preventDefault();
            that.showCreationForm();
          };
          that.$link.on('click' + NAMESPACE, onClickShowForm);
        }

        if (that.$cancel) {
          var onClickCancel = function() {
            that.hideCreationForm();
          };
          that.$cancel.on('click' + NAMESPACE, onClickCancel);
        }

        if (that.$form) {
          var onSubmit = function(e) {
            e.preventDefault();
            that.create();
          };
          that.$form.on('submit' + NAMESPACE, onSubmit);
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
        var that = this;

        if (that.filter === filter) {
          // If filter do not change, don't do anything
          if (that.isEmpty()) {
            that.$show();
          }
          return;
        }

        if (!that.isEmpty()) {
          that.opts.unSelect.call(that);
        }

        // Filter changed, unset item
        that.item = null;

        // Update filter
        that.filter = filter;

        // Abort current request if a request is pending
        if (that.xhr) {
          that.xhr.abort();
          that.xhr = null;
        }

        // Abort current timer
        if (that.timer) {
          clearTimeout(that.timer);
          that.timer = null;
        }

        // Use a case-insensitive cache
        var key = filter.toLowerCase();

        if (that.opts.cache && that.caches[key]) {
          // Get from cache
          that.show(that.caches[key]);
        }
        else {
          var request = function() {
            var opts = that.opts;

            // Build default parameters
            var params = {};

            params[opts.filterName] = that.filter;
            if (opts.limit > 0) {
              params[opts.limitName] = opts.limit;
            }

            // Append custom datas to parameters
            if (opts.datas) {
              if (typeof opts.datas === 'object') {
                params = $.extend(params, opts.datas);
              }
              else if (typeof opts.datas === 'function') {
                params = $.extend(params, opts.datas.apply(that));
              }
            }

            var dataType = opts.dataType;

            var ajaxOpts = {
              url: opts.url,
              type: opts.method,
              dataType: dataType,
              data: params
            };

            var isJsonp = (dataType || '').toLowerCase().indexOf('jsonp') >= 0;
            if (isJsonp) {
              ajaxOpts.jsonp = opts.jsonp;
              ajaxOpts.jsonpCallback = opts.jsonpCallback;
            }

            // Launch request
            that.xhr = $.ajax(ajaxOpts);

            var onDone = function(results) {
              that.timer = null;
              that.xhr = null;

              var transformedResults = opts.transformResults(results);

              if (opts.cache) {
                // Store in cache
                that.caches[key] = transformedResults;
              }

              that.show(transformedResults);
            };

            var onComplete = function() {
              // Prevent memory leak
              that = null;
              params = null;
              key = null;
              opts = null;
            };

            that.xhr.done(onDone);
            that.xhr.always(onComplete);

            // Prevent memory leak
            request = null;
          };

          // Launch request in 200ms
          // If user type something else in the meantime, request will be aborted
          that.timer = setTimeout(request, 200);
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
        var that = this;

        that.results = datas;

        if (datas.length === 0 && !that.$form) {
          that.clear();
          return;
        }

        that.$hide();
        that.$ul.empty();

        for (var i = 0, ln = datas.length; i < ln; ++i) {
          var label = that.renderItem(datas[i]);
          $('<li />')
            .addClass(ITEM_CLASS)
            .attr('data-idx', i)
            .attr(TITLE, label)
            .html(label)
            .appendTo(that.$ul);
        }

        that.$show();
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
        if (!this.$visible) {
          this.$visible = true;
          this.positionResult();
          this.$results.show();
          this.opts.onShown.call(this);
        }
      },

      /**
       * Hide result list.
       * @returns {jQuery} Result object.
       */
      $hide: function() {
        if (this.$visible) {
          this.$results.hide();
          this.hideCreationForm();
          this.opts.onHidden.call(this);
          this.$visible = false;
        }
      },

      /** Show form used to create new item. */
      showCreationForm: function() {
        var that = this;
        if (that.$form && !that.$creation) {
          that.$creation = true;
          that.$ul.hide();

          if (that.$link) {
            that.$link.hide();
          }

          that.$form.show();
          that.$form.find('input[type="text"]').eq(0)
            .val(that.$input.val())
            .focus();
        }
        that = null;
      },

      /** Hide form used to create new item. */
      hideCreationForm: function() {
        var that = this;
        if (that.$form && that.$creation) {
          that.$creation = false;

          that.$form.hide();

          if (that.$link) {
            that.$link.show();
          }

          that.$ul.show();
          that.$input.focus();
        }
        that = null;
      },

      /** Create new item */
      create: function() {
        var that = this;
        if (that.$creation && !that.$saving) {
          that.$saving = true;

          // Check form validity
          var array = that.$form.serializeArray();

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

          if (!that.opts.isValid(datas, that.$form)) {
            that.$saving = false;
            return;
          }

          // Callback
          datas = $.extend(datas, that.opts.onSaved(datas) || {});

          var url = that.opts.saveUrl || that.$form.attr('action') || that.opts.url;
          var method = that.opts.saveMethod || that.$form.attr('method');
          var dataType = that.opts.saveDataType;
          var contentType = that.opts.saveContentType;

          if (startsWith(contentType, 'application/json') && JSON && JSON.stringify) {
            datas = JSON.stringify(datas);
          }

          var xhr = $.ajax({
            url: url,
            type: method,
            dataType: dataType,
            contentType: contentType,
            data: datas
          });

          var destroy = function() {
            // Prevent memory leak
            that = null;
            array = null;
            datas = null;
            xhr = null;
            onDone = null;
            onFail = null;
            onComplete = null;
          };

          var onDone = function(data) {
            that.opts.onSavedSuccess.apply(null, arguments);
            that.set(data);
            that.$hide();
          };

          var onFail = function() {
            that.opts.onSavedFailed.apply(null, arguments);
          };

          var onComplete = function() {
            that.$saving = false;
            destroy();
          };

          xhr.done(onDone);
          xhr.fail(onFail);
          xhr.always(onComplete);
        }
      },

      /**
       * Set item as selected value.
       * @param {*} obj Object to select.
       */
      set: function(obj) {
        var that = this;
        that.item = obj;
        that.filter = that.renderItem(obj);
        that.$input.val(that.filter);
        that.$hide();
        that.idx = -1;
        that.opts.select.call(that, obj);
      },

      /**
       * Get selected value.
       * @param {*} Selected value.
       */
      get: function() {
        return this.item;
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
          this.set(this.results[idx]);
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
        var that = this;

        var ln = that.results.length;
        if (!ln) {
          return;
        }

        if (idx < 0) {
          idx = ln - 1;
        }
        else if (idx >= ln) {
          idx = 0;
        }

        that.$ul.find('li')
          .removeClass(ACTIVE_CLASS)
          .eq(idx).addClass(ACTIVE_CLASS);

        that.idx = idx;
      },

      /**
       * Clear autocomplete :
       * - Clear and hide results.
       * - Reset variable storing results and current selected item.
       */
      clear: function() {
        var that = this;

        if (that.item !== undefined && that.item !== null) {
          this.opts.unSelect.call(that);
        }

        that.$hide();
        that.$ul.empty();
        that.results = [];
        that.idx = -1;
        that.item = null;
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
        var that = this;

        if (that.$form) {
          that.$form.off();
        }

        if (that.$cancel) {
          that.$cancel.off();
        }

        if (that.$link) {
          that.$link.off();
        }
      },

      /** Destroy autocomplete component. */
      destroy: function() {
        var that = this;

        // Do not destroy plugin if it is already destroyed
        // If opts is null, then plugin is destroyed
        if (that.opts !== null) {
          that.opts.onDestroyed.call(that);
          that.unbind();

          if (that.timer) {
            clearTimeout(that.timer);
          }

          if (that.xhr) {
            that.xhr.abort();
          }

          if (that.$link) {
            that.$link.remove();
          }

          if (that.$cancel) {
            that.$cancel.remove();
          }

          if (that.$form) {
            that.$form.remove();
          }

          that.$ul.remove();
          that.$results.remove();

          for (var i in that) {
            if (that.hasOwnProperty(i)) {
              that[i] = null;
            }
          }
        }
      }
    };

    $.fn.jqAutoComplete = function(options) {
      var that = this;
      var $that = $(this);

      /** Destroy autocomplete */
      that.destroy = function() {
        var plugin = $that.data(PLUGIN_NAME);
        if (plugin) {
          // Destroy internal data
          plugin.destroy();
        }

        // Remove data attributes from DOM
        $that.removeData(PLUGIN_NAME);
      };

      // Shortcuts to functions
      $.each(['hide', 'show', 'clearCache', 'empty', 'clear', 'get', 'set'], function(idx, value) {
        that[value] = function() {
          var plugin = $that.data(PLUGIN_NAME);
          var result = plugin[value].apply(plugin, arguments);
          return result !== undefined ? result : that;
        };
      });

      return that.each(function() {
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
      dataType: 'json',
      jsonp: undefined,
      jsonpCallback: undefined,
      saveMethod: '',
      saveDataType: 'json',
      saveContentType: 'application/x-www-form-urlencoded; charset=UTF-8',
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
      parseHtml: true,
      transformResults: identity,
      focusout: noop,
      select: noop,
      unSelect: noop,
      onShown: noop,
      onHidden: noop,
      onDestroyed: noop
    };

  }));
})(window, void 0);

;/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 mickael.jeanroy@gmail.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function(angular, $) {

  'use strict';

  var module = angular.module('jqAutoComplete', []);

  module.directive('jqAutocomplete', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, tElement, tAttrs) {
        var $input = angular.element(tElement);

        var opts = {};
        var defaults = $.fn.jqAutoComplete.options;

        var obj = scope.$eval(tAttrs.jqAutocomplete);
        if (angular.isObject(obj)) {
          opts = obj;
        } else {
          angular.forEach(defaults, function(value, name) {
            var attrValue = tAttrs[name];
            if (angular.isDefined(attrValue)) {
              opts[name] = attrValue;
            }
          });
        }

        var onSelection = function(obj) {
          scope.$apply(function() {
            var value = $input.val();

            scope.selected = obj;

            $timeout(function() {
              scope.onSelection({
                $value: value,
                $selected: scope.selected
              });

              scope.ngChange();
            });
          });
        };

        opts = angular.extend(opts, {
          parseHtml: false,
          transformResults: function(data) {
            var results = scope.transformResults({
              $results: data
            });
            return angular.isDefined(results) ? results : data;
          },
          onShown: function() {
            scope.$apply(function() {
              scope.onShown({
                $value: $input.val(),
                $selected: scope.selected
              });
            });
          },
          onHidden: function() {
            scope.$apply(function() {
              scope.onHidden({
                $value: $input.val(),
                $selected: scope.selected
              });
            });
          },
          select: function(obj) {
            onSelection(obj);
          },
          unSelect: function() {
            onSelection(undefined);
          },
          onDestroyed: function() {
            scope.$apply(function() {
              scope.onDestroyed();
            });
          }
        });

        var $autocomplete = $input.jqAutoComplete(opts);

        scope.$on('$destroy', function() {
          $autocomplete.destroy();

          // Prevent memory leak
          $autocomplete = null;
          onSelection = null;
        });
      },
      scope: {
        ngChange: '&',
        selected: '=?jqAcSelected',
        onSelection: '&jqAcOnSelection',
        onShown: '&jqAcOnShown',
        onHidden: '&jqAcOnHidden',
        onDestroyed: '&jqAcOnDestroyed',
        transformResults: '&jqAcTransformResults'
      },
      template: '<input type="text" />',
      replace: true
    };
  }]);

})(angular, jQuery);
