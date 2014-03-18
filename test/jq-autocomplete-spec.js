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

describe("jQuery AutoComplete Test Suite", function() {

  beforeEach(function() {
    this.$fixtures = $('<div><input type="text" /></div>');
    this.$fixtures.append($('<form id="foo"></form>'));
    this.$input = this.$fixtures.find('input');

    // Spy jQuery
    this.xhr = jasmine.createSpyObj('xhr', ['abort', 'done', 'fail', 'always']);
    spyOn($, 'ajax').andReturn(this.xhr);

    spyOn($.fn, 'outerWidth').andReturn(30);
    spyOn($.fn, 'outerHeight').andReturn(20);
    spyOn($.fn, 'on').andCallThrough();
    spyOn($.fn, 'off').andCallThrough();
    spyOn($.fn, 'delegate').andCallThrough();
    spyOn($.fn, 'focus').andCallThrough();
    spyOn($.fn, 'css').andCallThrough();
    spyOn($.fn, 'position').andCallThrough();
    spyOn($.fn, 'offset').andCallThrough();
    spyOn($.fn, 'hide').andCallThrough();
    spyOn($.fn, 'show').andCallThrough();
    spyOn($.fn, 'empty').andCallThrough();
    spyOn($.fn, 'parent').andCallThrough();
    spyOn($.fn, 'val').andCallThrough();
    spyOn($.fn, 'addClass').andCallThrough();
    spyOn($.fn, 'removeClass').andCallThrough();
    spyOn($.fn, 'eq').andCallThrough();
    spyOn($.fn, 'fadeOut').andCallFake(function(speed, callback) {
      callback.call(null);
    });
  });

  it("should initialize autocomplete without form", function() {
    // WHEN
    expect(this.$input.data('jqAutoComplete')).toBeFalsy();
    this.$input.jqAutoComplete({
      url: '/search'
    });

    // THEN
    expect(this.$input.data('jqAutoComplete')).toBeDefined();

    var ac = this.$input.data('jqAutoComplete');
    expect(ac.$input).toBeDefined();
    expect(ac.filter).toBe('');
    expect(ac.results).toEqual([]);
    expect(ac.idx).toEqual(-1);
    expect(ac.timer).toBe(null);
    expect(ac.xhr).toBe(null);
    expect(ac.caches).toEqual({});
    expect(ac.$form).toBeUndefined();

    expect(ac.opts).not.toBe($.fn.jqAutoComplete.options);
    expect(ac.opts).toEqual({
      url: '/search',
      dataType: 'json',
      jsonp: undefined,
      jsonpCallback: undefined,
      saveUrl: '',
      label: jasmine.any(Function),
      minSize: 3,
      method: 'GET',
      saveMethod: '',
      saveDataType: 'json',
      saveContentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      limit: 10,
      filterName: 'filter',
      limitName: 'limit',
      datas: null,
      cache: false,
      relativeTo: null,
      transformResults: jasmine.any(Function),
      $createForm: null,
      createLabel: 'Not here? Create it!',
      cancel: 'Cancel',
      submit: 'Save',
      onSaved: jasmine.any(Function),
      onSavedSuccess: jasmine.any(Function),
      onSavedFailed: jasmine.any(Function),
      isValid: jasmine.any(Function),
      select: jasmine.any(Function),
      unSelect: jasmine.any(Function),
      focusout: jasmine.any(Function),
      onShown: jasmine.any(Function),
      onHidden: jasmine.any(Function),
      onDestroyed: jasmine.any(Function)
    });
  });

  it("should initialize autocomplete with data attributes", function() {
    // GIVEN
    this.$input.attr('data-min-size', '2');
    this.$input.attr('data-limit', '5');
    this.$input.attr('data-url', '/search');
    this.$input.attr('data-save-url', '/save');
    this.$input.attr('data-save-method', 'PUT');
    this.$input.attr('data-save-data-type', 'json');
    this.$input.attr('data-save-content-type', 'application/json');
    this.$input.attr('data-submit', 'Save');
    this.$input.attr('data-cancel', 'Cancel');
    this.$input.attr('data-create-form', '#foo');
    this.$input.attr('data-create-label', 'Create it!');
    this.$input.attr('data-filter-name', 'myFilter');
    this.$input.attr('data-limit-name', 'myLimit');
    this.$input.attr('data-method', 'POST');
    this.$input.attr('data-label', 'label');
    this.$input.attr('data-cache', 'true');
    this.$input.attr('data-data-type', 'jsonp');
    this.$input.attr('data-jsonp', 'false');
    this.$input.attr('data-jsonp-callback', 'foo');

    // WHEN
    expect(this.$input.data('jqAutoComplete')).toBeFalsy();
    this.$input.jqAutoComplete();

    // THEN
    expect(this.$input.data('jqAutoComplete')).toBeDefined();

    var ac = this.$input.data('jqAutoComplete');
    expect(ac.$input).toBeDefined();
    expect(ac.filter).toBe('');
    expect(ac.results).toEqual([]);
    expect(ac.idx).toEqual(-1);
    expect(ac.timer).toBe(null);
    expect(ac.xhr).toBe(null);

    expect(ac.opts).not.toBe($.fn.jqAutoComplete.options);
    expect(ac.opts).toEqual({
      url: '/search',
      dataType: 'jsonp',
      jsonp: false,
      jsonpCallback: 'foo',
      saveUrl: '/save',
      label: 'label',
      minSize: 2,
      method: 'POST',
      saveMethod: 'PUT',
      saveDataType: 'json',
      saveContentType: 'application/json',
      limit: 5,
      filterName: 'myFilter',
      limitName: 'myLimit',
      datas: null,
      cache: true,
      transformResults: jasmine.any(Function),
      relativeTo: null,
      $createForm: '#foo',
      createLabel: 'Create it!',
      cancel: 'Cancel',
      submit: 'Save',
      onSaved: jasmine.any(Function),
      onSavedSuccess: jasmine.any(Function),
      onSavedFailed: jasmine.any(Function),
      isValid: jasmine.any(Function),
      select: jasmine.any(Function),
      unSelect: jasmine.any(Function),
      focusout: jasmine.any(Function),
      onShown: jasmine.any(Function),
      onHidden: jasmine.any(Function),
      onDestroyed: jasmine.any(Function)
    });
  });

  it("should initialize autocomplete with an absolute position", function() {
    // WHEN
    this.$input.jqAutoComplete();

    // THEN
    expect(this.$input.data('jqAutoComplete')).toBeDefined();

    var autocomplete = this.$input.data('jqAutoComplete');

    expect(this.$input.position).toHaveBeenCalled();
    expect(this.$input.parent).toHaveBeenCalled();
    expect(this.$input.parent().css).toHaveBeenCalledWith('position', 'relative');
    expect(autocomplete.fixed).toBe(false);
    expect(autocomplete.position).toBe('absolute');
    expect(autocomplete.left).toBe(0);
    expect(autocomplete.top).toBe(20);
    expect(autocomplete.width).toBe(30);
  });

  it("should set absolute position relative to another element", function() {
    // GIVEN
    var options = {
      relativeTo: 'body'
    };

    // WHEN
    this.$input.jqAutoComplete(options);

    // THEN
    expect($('body').css).toHaveBeenCalledWith('position', 'relative');
    expect(this.$input.data('jqAutoComplete')).toBeDefined();
    expect(this.$input.position).toHaveBeenCalled();
    expect(this.$input.parent).not.toHaveBeenCalled();

    var autocomplete = this.$input.data('jqAutoComplete');
    expect(autocomplete.fixed).toBe(false);
    expect(autocomplete.position).toBe('absolute');
    expect(autocomplete.left).toBe(0);
    expect(autocomplete.top).toBe(20);
    expect(autocomplete.width).toBe(30);
  });

  it("should set fixed position", function() {
    // GIVEN
    var options = {
      relativeTo: 'fixed'
    };

    // WHEN
    this.$input.jqAutoComplete(options);

    // THEN
    expect($.fn.css).not.toHaveBeenCalledWith('position', 'relative');
    expect(this.$input.data('jqAutoComplete')).toBeDefined();
    expect(this.$input.offset).toHaveBeenCalled();
    expect(this.$input.parent).not.toHaveBeenCalled();

    var autocomplete = this.$input.data('jqAutoComplete');
    expect(autocomplete.fixed).toBe(true);
    expect(autocomplete.position).toBe('fixed');
  });

  it("should call destroy function", function() {
    // GIVEN
    this.$input.jqAutoComplete();
    var autocomplete = this.$input.data('jqAutoComplete');
    spyOn(autocomplete, 'destroy');

    // WHEN
    this.$input.jqAutoComplete().destroy();

    // THEN
    expect(autocomplete.destroy).toHaveBeenCalled();
    expect(this.$input.data('jqAutoComplete')).toBeUndefined();
  });

  it("should call clear function", function() {
    // GIVEN
    this.$input.jqAutoComplete();
    var autocomplete = this.$input.data('jqAutoComplete');
    spyOn(autocomplete, 'clear');

    // WHEN
    var result = this.$input.jqAutoComplete().clear();

    // THEN
    expect(autocomplete.clear).toHaveBeenCalled();
    expect(result).toBe(this.$input);
  });

  it("should call clear cache function", function() {
    // GIVEN
    this.$input.jqAutoComplete();
    var autocomplete = this.$input.data('jqAutoComplete');
    spyOn(autocomplete, 'clearCache');

    // WHEN
    var result = this.$input.jqAutoComplete().clearCache();

    // THEN
    expect(autocomplete.clearCache).toHaveBeenCalled();
    expect(result).toBe(this.$input);
  });

  it("should call empty function", function() {
    // GIVEN
    this.$input.jqAutoComplete();
    var autocomplete = this.$input.data('jqAutoComplete');
    spyOn(autocomplete, 'empty');

    // WHEN
    var result = this.$input.jqAutoComplete().empty();

    // THEN
    expect(autocomplete.empty).toHaveBeenCalled();
    expect(result).toBe(this.$input);
  });

  it("should set item on autocomplete", function() {
    // GIVEN
    this.$input.jqAutoComplete();
    var autocomplete = this.$input.data('jqAutoComplete');
    spyOn(autocomplete, 'val');

    // WHEN
    var result = this.$input.jqAutoComplete().val('foo');

    // THEN
    expect(autocomplete.val).toHaveBeenCalledWith('foo');
    expect(result).toBe(this.$input);
  });

  it("should get selected item", function() {
    // GIVEN
    this.$input.jqAutoComplete();
    var autocomplete = this.$input.data('jqAutoComplete');
    autocomplete.item = 'foo';

    // WHEN
    var result = this.$input.jqAutoComplete().val();

    // THEN
    expect(result).toBe('foo');
  });

  it("should call clearCache function", function() {
    // GIVEN
    this.$input.jqAutoComplete();
    var autocomplete = this.$input.data('jqAutoComplete');
    spyOn(autocomplete, 'clearCache');

    // WHEN
    var result = this.$input.jqAutoComplete().clearCache();

    // THEN
    expect(autocomplete.clearCache).toHaveBeenCalled();
    expect(result).toBe(this.$input);
  });

  it("should hide autocomplete", function() {
    // GIVEN
    var $autocomplete = this.$input.jqAutoComplete();

    var autocomplete = this.$input.data('jqAutoComplete');
    spyOn(autocomplete, 'hide');

    // WHEN
    $autocomplete.hide();

    // THEN
    expect(autocomplete.hide).toHaveBeenCalled();
  });

  it("should show autocomplete", function() {
    // GIVEN
    var $autocomplete = this.$input.jqAutoComplete();

    var data = ['foo', 'bar'];
    var autocomplete = this.$input.data('jqAutoComplete');
    spyOn(autocomplete, 'show');

    // WHEN
    $autocomplete.show(data);

    // THEN
    expect(autocomplete.show).toHaveBeenCalledWith(data);
  });

  describe("Check Behavior of AutoComplete", function() {
    beforeEach(function() {
      $.fn.offset.andReturn({
        left: 100,
        top: 50
      });

      $.fn.position.andReturn({
        left: 100,
        top: 50
      });

      this.$input.jqAutoComplete({
        url: '/search'
      });

      this.results = [
        { id: 1, label: 'foo'  },
        { id: 2, label: 'bar'  },
        { id: 3, label: 'quix' }
      ];

      this.$li1 = $('<li>foo</li>');
      this.$li2 = $('<li>bar</li>');
      this.$li3 = $('<li>quix</li>');

      this.autocomplete = this.$input.data('jqAutoComplete');

      this.cssActive = 'jq-autocomplete-item-active';
    });

    it("should bind user events on initialization", function() {
      expect(this.autocomplete.$input.on).toHaveBeenCalledWith('keyup.jqauto', jasmine.any(Function));
      expect(this.autocomplete.$input.on).toHaveBeenCalledWith('keydown.jqauto', jasmine.any(Function));
      expect(this.autocomplete.$input.on).toHaveBeenCalledWith('focusin.jqauto', jasmine.any(Function));
      expect(this.autocomplete.$input.on).toHaveBeenCalledWith('focusout.jqauto', jasmine.any(Function));
      expect(this.autocomplete.$ul.on).toHaveBeenCalledWith('mouseenter.jqauto', jasmine.any(Function));
      expect(this.autocomplete.$ul.on).toHaveBeenCalledWith('click.jqauto', 'li', jasmine.any(Function));
      expect(this.autocomplete.$ul.delegate).not.toHaveBeenCalledWith();
    });

    it("should unbind user events", function() {
      // GIVEN
      spyOn(this.autocomplete, 'unbindForm').andCallThrough();
      this.autocomplete.$form = undefined;
      this.autocomplete.$cancel = undefined;
      this.autocomplete.$link = undefined;

      // WHEN
      this.autocomplete.unbind();

      // THEN
      expect(this.autocomplete.$input.off).toHaveBeenCalledWith('.jqauto');
      expect(this.autocomplete.$ul.off).toHaveBeenCalledWith('.jqauto');
      expect(this.autocomplete.unbindForm).toHaveBeenCalled();
    });

    it("should unbind user events and unbind form", function() {
      // GIVEN
      spyOn(this.autocomplete, 'unbindForm').andCallThrough();
      this.autocomplete.$form = $('<form></form>');
      this.autocomplete.$cancel = $('<button></button>');
      this.autocomplete.$link = $('<a href="#"/>');

      // WHEN
      this.autocomplete.unbind();

      // THEN
      expect(this.autocomplete.$input.off).toHaveBeenCalledWith('.jqauto');
      expect(this.autocomplete.$ul.off).toHaveBeenCalledWith('.jqauto');

      expect(this.autocomplete.unbindForm).toHaveBeenCalled();
      expect(this.autocomplete.$form.off).toHaveBeenCalledWith('.jqauto');
      expect(this.autocomplete.$cancel.off).toHaveBeenCalledWith('.jqauto');
      expect(this.autocomplete.$link.off).toHaveBeenCalledWith('.jqauto');
    });

    it("should destroy autocomplete", function() {
      // GIVEN
      spyOn(this.autocomplete, 'unbind');
      spyOn(this.autocomplete.opts, 'onDestroyed');

      var onDestroyed = this.autocomplete.opts.onDestroyed;
      var unbind = this.autocomplete.unbind;

      this.autocomplete.results = [];
      this.autocomplete.item = 'foo';
      this.autocomplete.idx = -1;

      // WHEN
      this.autocomplete.destroy();

      // THEN
      expect(unbind).toHaveBeenCalled();
      expect(onDestroyed).toHaveBeenCalled();
      expect(this.autocomplete.results).toBe(null);
      expect(this.autocomplete.item).toBe(null);
      expect(this.autocomplete.idx).toBe(null);
    });

    it("should clear timer and xhr when autocomplete is destroyed", function() {
      // GIVEN
      spyOn(this.autocomplete, 'unbind');
      spyOn(window, 'clearTimeout');

      var timer = {};
      var xhr = jasmine.createSpyObj('xhr', ['abort']);

      this.autocomplete.timer = timer;
      this.autocomplete.xhr = xhr;

      this.autocomplete.results = [];
      this.autocomplete.item = 'foo';
      this.autocomplete.idx = -1;

      // WHEN
      this.autocomplete.destroy();

      // THEN
      expect(window.clearTimeout).toHaveBeenCalledWith(timer);
      expect(xhr.abort).toHaveBeenCalled();
    });

    it("should clear results and hide results list", function() {
      // GIVEN
      spyOn(this.autocomplete, 'resetForm').andCallThrough();
      spyOn(this.autocomplete.opts, 'onHidden').andCallThrough();

      var results = [
        { id: 1, label: 'foo' },
        { id: 2, label: 'bar' }
      ];

      this.autocomplete.$visible = true;
      this.autocomplete.idx = 0;
      this.autocomplete.results = results;
      this.autocomplete.item = this.autocomplete.results[0];

      var fn = jasmine.createSpy('fn');
      this.autocomplete.opts.unSelect = fn;

      // WHEN
      this.autocomplete.clear();

      // THEN
      expect(this.autocomplete.resetForm).not.toHaveBeenCalled();
      expect(this.autocomplete.opts.onHidden).toHaveBeenCalled();

      expect(this.autocomplete.$input.val).not.toHaveBeenCalled();

      expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
      expect(this.autocomplete.$ul.empty).toHaveBeenCalled();
      expect(this.autocomplete.$ul.html()).toBe('');

      expect(this.autocomplete.results).toEqual([]);
      expect(this.autocomplete.idx).toBe(-1);
      expect(this.autocomplete.item).toBe(null);

      expect(fn).toHaveBeenCalled();
    });

    it("should clear results and hide results list and not call callback if item is was not selected", function() {
      // GIVEN
      spyOn(this.autocomplete.opts, 'onHidden').andCallThrough();

      var results = [
        { id: 1, label: 'foo' },
        { id: 2, label: 'bar' }
      ];

      this.autocomplete.$visible = true;
      this.autocomplete.idx = 0;
      this.autocomplete.results = results;

      var fn = jasmine.createSpy('fn');
      this.autocomplete.opts.unSelect = fn;

      // WHEN
      this.autocomplete.clear();

      // THEN
      expect(this.autocomplete.opts.onHidden).toHaveBeenCalled();
      expect(this.autocomplete.$input.val).not.toHaveBeenCalled();

      expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
      expect(this.autocomplete.$ul.empty).toHaveBeenCalled();

      expect(this.autocomplete.results).toEqual([]);
      expect(this.autocomplete.idx).toBe(-1);
      expect(this.autocomplete.item).toBe(null);

      expect(fn).not.toHaveBeenCalled();
    });

    it("should clear results, hide results list and clear input value", function() {
      // GIVEN
      spyOn(this.autocomplete, 'resetForm').andCallThrough();
      spyOn(this.autocomplete.opts, 'onHidden').andCallThrough();

      this.autocomplete.$visible = true;
      this.autocomplete.idx = 0;
      this.autocomplete.results = this.results;
      this.autocomplete.item = this.results[0];

      // WHEN
      this.autocomplete.empty();

      // THEN
      expect(this.autocomplete.resetForm).toHaveBeenCalled();
      expect(this.autocomplete.opts.onHidden).toHaveBeenCalled();
      expect(this.autocomplete.$input.val).toHaveBeenCalledWith('');
      expect(this.autocomplete.$input.val()).toBe('');

      expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
      expect(this.autocomplete.$ul.empty).toHaveBeenCalled();
      expect(this.autocomplete.$ul.html()).toBe('');

      expect(this.autocomplete.results).toEqual([]);
      expect(this.autocomplete.idx).toBe(-1);
      expect(this.autocomplete.item).toBe(null);
    });

    describe("Check creation form", function() {
      beforeEach(function() {
        this.$input.removeData();

        this.$input.jqAutoComplete({
          url: '/search',
          saveUrl: '/save',
          $createForm: '#foo'
        });

        this.autocomplete = this.$input.data('jqAutoComplete');
      });

      it("should hide creation form if form is defined", function() {
        // GIVEN
        spyOn(this.autocomplete, '$hide').andCallThrough();

        // WHEN
        this.autocomplete.hide();

        // THEN
        expect(this.autocomplete.$hide).toHaveBeenCalled();
      });

      it("should $hide creation form if form is defined", function() {
        // GIVEN
        this.autocomplete.$visible = true;
        spyOn(this.autocomplete, 'hideCreationForm').andCallThrough();

        // WHEN
        this.autocomplete.$hide();

        // THEN
        expect(this.autocomplete.$visible).toBeFalsy();
        expect(this.autocomplete.hideCreationForm).toHaveBeenCalled();
      });

      it("should hide creation form", function() {
        // GIVEN
        this.autocomplete.$creation = true;

        // WHEN
        this.autocomplete.hideCreationForm();

        // THEN
        expect(this.autocomplete.$creation).toBe(false);
        expect(this.autocomplete.$form.hide).toHaveBeenCalled();
        expect(this.autocomplete.$ul.show).toHaveBeenCalled();
        expect(this.autocomplete.$input.focus).toHaveBeenCalled();
        expect(this.autocomplete.$link.show).toHaveBeenCalled();
      });

      it("should not hide creation form if form was not visible", function() {
        // GIVEN
        this.autocomplete.$creation = false;

        // WHEN
        this.autocomplete.hideCreationForm();

        // THEN
        expect(this.autocomplete.$creation).toBe(false);
        expect(this.autocomplete.$form.hide).not.toHaveBeenCalled();
        expect(this.autocomplete.$ul.show).not.toHaveBeenCalled();
        expect(this.autocomplete.$input.focus).not.toHaveBeenCalled();
        expect(this.autocomplete.$link.show).not.toHaveBeenCalled();
      });

      it("should show creation form", function() {
        // GIVEN
        var $input = jasmine.createSpyObj('$input', ['focus', 'val']);
        $input.val.andReturn($input);
        $input.focus.andReturn($input);

        this.autocomplete.$form.eq.andReturn($input);

        // WHEN
        this.autocomplete.showCreationForm();

        // THEN
        expect(this.autocomplete.$creation).toBe(true);
        expect(this.autocomplete.$ul.hide).toHaveBeenCalledWith();
        expect(this.autocomplete.$form.show).toHaveBeenCalled();
        expect(this.autocomplete.$form.eq).toHaveBeenCalledWith(0);
        expect(this.autocomplete.$link.hide).toHaveBeenCalled();
        expect($input.val).toHaveBeenCalled();
        expect($input.focus).toHaveBeenCalled();
      });

      it("should create new item", function() {
        // GIVEN
        this.autocomplete.$creation = true;
        this.autocomplete.opts.saveMethod = 'POST';

        var item1 = {
          name: 'name',
          value: 'foo'
        };

        var item2 = {
          name: 'bar',
          value: 'quix'
        };

        spyOn(this.autocomplete.$form, 'serializeArray').andReturn([item1, item2]);
        spyOn(this.autocomplete.opts, 'onSaved');
        spyOn(this.autocomplete.opts, 'isValid').andReturn(true);

        // WHEN
        this.autocomplete.create();

        // THEN
        var data = {
          name: 'foo',
          bar: 'quix'
        };

        expect(this.autocomplete.$saving).toBe(true);
        expect(this.autocomplete.opts.isValid).toHaveBeenCalledWith(data, this.autocomplete.$form);
        expect(this.autocomplete.opts.onSaved).toHaveBeenCalledWith(data);
        expect($.ajax).toHaveBeenCalledWith({
          url: '/save',
          type: 'POST',
          data: data,
          dataType: 'json',
          contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
        });

        expect(this.xhr.done).toHaveBeenCalledWith(jasmine.any(Function));
        expect(this.xhr.fail).toHaveBeenCalledWith(jasmine.any(Function));
        expect(this.xhr.always).toHaveBeenCalledWith(jasmine.any(Function));

        // Call fail
        spyOn(this.autocomplete.opts, 'onSavedFailed');
        this.xhr.fail.argsForCall[0][0]();
        expect(this.autocomplete.$saving).toBe(true);
        expect(this.autocomplete.opts.onSavedFailed).toHaveBeenCalled();

        // Call done
        spyOn(this.autocomplete.opts, 'onSavedSuccess');
        spyOn(this.autocomplete, 'val');
        spyOn(this.autocomplete, '$hide');
        var item = { id: 1 };
        this.xhr.done.argsForCall[0][0](item);
        expect(this.autocomplete.$saving).toBe(true);
        expect(this.autocomplete.val).toHaveBeenCalledWith(item);
        expect(this.autocomplete.$hide).toHaveBeenCalled();
        expect(this.autocomplete.opts.onSavedSuccess).toHaveBeenCalled();

        // Call always
        this.xhr.always.argsForCall[0][0]();
        expect(this.autocomplete.$saving).toBe(false);
      });

      it("should create new item using json content type", function() {
        // GIVEN
        window.JSON = jasmine.createSpyObj('JSON', ['stringify']);
        window.JSON.stringify.andCallFake(function() {
          return '{"name": "foo", "bar": "quix"}';
        });

        this.autocomplete.$creation = true;
        this.autocomplete.opts.saveMethod = 'POST';
        this.autocomplete.opts.saveContentType = 'application/json';

        var item1 = {
          name: 'name',
          value: 'foo'
        };

        var item2 = {
          name: 'bar',
          value: 'quix'
        };

        spyOn(this.autocomplete.$form, 'serializeArray').andReturn([item1, item2]);
        spyOn(this.autocomplete.opts, 'onSaved');
        spyOn(this.autocomplete.opts, 'isValid').andReturn(true);

        // WHEN
        this.autocomplete.create();

        // THEN
        var datas = {
          name: 'foo',
          bar: 'quix'
        };

        expect(this.autocomplete.$saving).toBe(true);
        expect(this.autocomplete.opts.isValid).toHaveBeenCalledWith(datas, this.autocomplete.$form);
        expect(this.autocomplete.opts.onSaved).toHaveBeenCalledWith(datas);
        expect($.ajax).toHaveBeenCalledWith({
          url: '/save',
          type: 'POST',
          data: '{"name": "foo", "bar": "quix"}',
          dataType: 'json',
          contentType: 'application/json'
        });

        expect(this.xhr.done).toHaveBeenCalledWith(jasmine.any(Function));
        expect(this.xhr.fail).toHaveBeenCalledWith(jasmine.any(Function));
        expect(this.xhr.always).toHaveBeenCalledWith(jasmine.any(Function));

        // Call fail
        spyOn(this.autocomplete.opts, 'onSavedFailed');
        this.xhr.fail.argsForCall[0][0]();
        expect(this.autocomplete.$saving).toBe(true);
        expect(this.autocomplete.opts.onSavedFailed).toHaveBeenCalled();

        // Call done
        spyOn(this.autocomplete.opts, 'onSavedSuccess');
        spyOn(this.autocomplete, 'val');
        spyOn(this.autocomplete, '$hide');
        var item = { id: 1 };
        this.xhr.done.argsForCall[0][0](item);
        expect(this.autocomplete.$saving).toBe(true);
        expect(this.autocomplete.val).toHaveBeenCalledWith(item);
        expect(this.autocomplete.$hide).toHaveBeenCalled();
        expect(this.autocomplete.opts.onSavedSuccess).toHaveBeenCalled();

        // Call always
        this.xhr.always.argsForCall[0][0]();
        expect(this.autocomplete.$saving).toBe(false);
      });

      it("should reset form", function() {
        // GIVEN
        var $items = jasmine.createSpyObj('$items', ['each']);
        spyOn($.fn, 'find').andReturn($items);

        // WHEN
        this.autocomplete.resetForm();

        // THEN
        expect(this.autocomplete.$form.find).toHaveBeenCalled();
        expect($items.each).toHaveBeenCalledWith(jasmine.any(Function));

        var $item = $('<input type="text" value="foo"/>');
        $items.each.argsForCall[0][0].call($item);
        expect($item.val).toHaveBeenCalledWith('');
        expect($item.val()).toBe('');
      });

      it("should not reset form if form is not set", function() {
        // GIVEN
        spyOn($.fn, 'find')
        this.autocomplete.$form = undefined;

        // WHEN
        this.autocomplete.resetForm();

        // THEN
        expect($.fn.find).not.toHaveBeenCalled();
      });
    });

    describe("Check position of results", function() {
      beforeEach(function() {
        this.autocomplete.$ul.css.reset();
      });

      it("should append ul element to display results at correct position and correct size", function() {
        var $ul = this.$fixtures.find('ul');
        var $results = this.$fixtures.find('div');

        expect($ul.length).toBe(1);
        expect($results.length).toBe(1);

        $results = $results.eq(0);
        $ul = $ul.eq(0);

        expect($results.hasClass('jq-autocomplete-results')).toBe(true);
        expect($ul.hasClass('jq-autocomplete-results-list')).toBe(true);

        expect($results.css('position')).toBe('absolute');
        expect($results.css('top')).toBe('70px');
        expect($results.css('left')).toBe('100px');
      });

      it("should save last position", function() {
        // GIVEN
        this.autocomplete.left = 50;
        this.autocomplete.top = 30;
        this.autocomplete.width = 10;

        // WHEN
        this.autocomplete.positionResult();

        // THEN
        expect(this.autocomplete.$input.position).toHaveBeenCalled();

        expect(this.autocomplete.left).toBe(100);
        expect(this.autocomplete.top).toBe(70);
        expect(this.autocomplete.width).toBe(30);

        expect(this.autocomplete.$ul.css).toHaveBeenCalledWith({
          position: 'absolute',
          left: 100,
          top: 70,
          width: 30
        });
      });

      it("should not call css twice if position does not change", function() {
        // WHEN
        this.autocomplete.positionResult();

        // THEN
        expect(this.autocomplete.$input.position).toHaveBeenCalled();
        expect(this.autocomplete.left).toBe(100);
        expect(this.autocomplete.top).toBe(70);
        expect(this.autocomplete.width).toBe(30);
        expect(this.autocomplete.$ul.css).not.toHaveBeenCalledWith();
      });
    });

    describe("Check Selection Functions", function() {

      it("should set a string value", function() {
        // GIVEN
        var fn = jasmine.createSpy('fn');
        this.autocomplete.opts.select = fn;
        this.autocomplete.idx = 0;
        this.autocomplete.$visible = true;

        // WHEN
        this.autocomplete.val('foo');

        // THEN
        expect(this.autocomplete.item).toBe('foo');
        expect(this.autocomplete.filter).toBe('foo');
        expect(this.autocomplete.$input.val).toHaveBeenCalledWith('foo');
        expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
        expect(fn).toHaveBeenCalledWith('foo');
        expect(this.autocomplete.idx).toBe(-1);
      });

      it("should set an object value", function() {
        // GIVEN
        var obj = {
          id: 1,
          label: 'foo'
        };

        var fn = jasmine.createSpy('fn');
        this.autocomplete.$visible = true;
        this.autocomplete.opts.label = 'label';
        this.autocomplete.opts.select = fn;

        // WHEN
        this.autocomplete.val(obj);

        // THEN
        expect(this.autocomplete.item).toBe(obj);
        expect(this.autocomplete.filter).toBe('foo');
        expect(this.autocomplete.$input.val).toHaveBeenCalledWith('foo');
        expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
        expect(fn).toHaveBeenCalledWith(obj);
      });

      it("should select item at given index", function() {
        // GIVEN
        this.autocomplete.results = ['foo', 'bar', 'quix'];
        spyOn(this.autocomplete, 'val');

        // WHEN
        this.autocomplete.select(0);

        // THEN
        expect(this.autocomplete.val).toHaveBeenCalledWith('foo');
      });

      it("should not select if index is lower than zero", function() {
        // GIVEN
        this.autocomplete.results = ['foo', 'bar', 'quix'];
        spyOn(this.autocomplete, 'val');

        // WHEN
        this.autocomplete.select(-1);

        // THEN
        expect(this.autocomplete.val).not.toHaveBeenCalled();
      });

      it("should not select if index is greater than max available item", function() {
        // GIVEN
        this.autocomplete.results = ['foo', 'bar', 'quix'];
        spyOn(this.autocomplete, 'val');

        // WHEN
        this.autocomplete.select(3);

        // THEN
        expect(this.autocomplete.val).not.toHaveBeenCalled();
      });
    });

    describe("Check Show / Hide Function", function() {
      beforeEach(function() {
        spyOn(this.autocomplete, 'positionResult').andCallThrough();
        spyOn(this.autocomplete, 'hideCreationForm').andCallThrough();
        spyOn(this.autocomplete, '$show').andCallThrough();
        spyOn(this.autocomplete.opts, 'onShown').andCallThrough();
        spyOn(this.autocomplete.opts, 'onHidden').andCallThrough();
      });

      it("should $show if autocomplete was not visible", function() {
        // GIVEN
        var data = ['foo', 'bar', 'quix'];
        this.autocomplete.$visible = false;

        // WHEN
        this.autocomplete.$show();

        // THEN
        expect(this.autocomplete.opts.onShown).toHaveBeenCalled();

        expect(this.autocomplete.$ul.show).toHaveBeenCalled();
        expect(this.autocomplete.positionResult).toHaveBeenCalled();
        expect(this.autocomplete.$visible).toBeTruthy();
      });

      it("should not $show if autocomplete is visible", function() {
        // GIVEN
        var data = ['foo', 'bar', 'quix'];
        this.autocomplete.$visible = true;

        // WHEN
        this.autocomplete.$show();

        // THEN
        expect(this.autocomplete.opts.onShown).not.toHaveBeenCalled();
        expect(this.autocomplete.$ul.show).not.toHaveBeenCalled();
        expect(this.autocomplete.positionResult).not.toHaveBeenCalled();
        expect(this.autocomplete.$visible).toBeTruthy();
      });

      it("should $hide if autocomplete is visible", function() {
        // GIVEN
        var data = ['foo', 'bar', 'quix'];
        this.autocomplete.$visible = true;

        // WHEN
        this.autocomplete.$hide();

        // THEN
        expect(this.autocomplete.opts.onHidden).toHaveBeenCalled();

        expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
        expect(this.autocomplete.hideCreationForm).toHaveBeenCalled();
        expect(this.autocomplete.$visible).toBeFalsy();
      });

      it("should not $hide if autocomplete is not visible", function() {
        // GIVEN
        var data = ['foo', 'bar', 'quix'];
        this.autocomplete.$visible = false;

        // WHEN
        this.autocomplete.$hide();

        // THEN
        expect(this.autocomplete.opts.onHidden).not.toHaveBeenCalled();

        expect(this.autocomplete.$ul.hide).not.toHaveBeenCalled();
        expect(this.autocomplete.hideCreationForm).not.toHaveBeenCalled();
        expect(this.autocomplete.$visible).toBeFalsy();
      });

      it("should display some strings", function() {
        // GIVEN
        var data = ['foo', 'bar', 'quix'];
        this.autocomplete.$visible = true;

        // WHEN
        this.autocomplete.show(data);

        // THEN
        expect(this.autocomplete.$show).toHaveBeenCalled();
        expect(this.autocomplete.opts.onShown).toHaveBeenCalled();

        expect(this.autocomplete.results).toEqual(data);
        expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
        expect(this.autocomplete.$ul.empty).toHaveBeenCalled();
        expect(this.autocomplete.$ul.show).toHaveBeenCalled();
        expect(this.autocomplete.positionResult).toHaveBeenCalled();

        var $lis = this.autocomplete.$ul.find('li');
        expect($lis.length).toBe(3);

        var $li1 = $lis.eq(0);
        var $li2 = $lis.eq(1);
        var $li3 = $lis.eq(2);

        expect($li1.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li1.attr('data-idx')).toBe('0');
        expect($li1.attr('title')).toBe('foo');
        expect($li1.html()).toBe('foo');

        expect($li2.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li2.attr('data-idx')).toBe('1');
        expect($li2.attr('title')).toBe('bar');
        expect($li2.html()).toBe('bar');

        expect($li3.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li3.attr('data-idx')).toBe('2');
        expect($li3.attr('title')).toBe('quix');
        expect($li3.html()).toBe('quix');
      });

      it("should display some numbers", function() {
        // GIVEN
        var data = [1, 2, 3];

        // WHEN
        this.autocomplete.show(data);

        // THEN
        expect(this.autocomplete.$show).toHaveBeenCalled();
        expect(this.autocomplete.opts.onShown).toHaveBeenCalled();

        expect(this.autocomplete.results).toEqual(data);
        expect(this.autocomplete.$ul.empty).toHaveBeenCalled();

        var $lis = this.autocomplete.$ul.find('li');
        expect($lis.length).toBe(3);

        var $li1 = $lis.eq(0);
        var $li2 = $lis.eq(1);
        var $li3 = $lis.eq(2);

        expect($li1.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li1.attr('data-idx')).toBe('0');
        expect($li1.attr('title')).toBe('1');
        expect($li1.html()).toBe('1');

        expect($li2.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li2.attr('data-idx')).toBe('1');
        expect($li2.attr('title')).toBe('2');
        expect($li2.html()).toBe('2');

        expect($li3.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li3.attr('data-idx')).toBe('2');
        expect($li3.attr('title')).toBe('3');
        expect($li3.html()).toBe('3');
      });

      it("should display object with a custom renderer", function() {
        // GIVEN
        var data = ['foo', 'bar', 'quix'];

        var fn = jasmine.createSpy('label').andCallFake(function(obj) {
          return obj + ' called';
        });

        this.autocomplete.opts.label = fn;

        // WHEN
        this.autocomplete.show(data);

        // THEN
        expect(this.autocomplete.$show).toHaveBeenCalled();
        expect(this.autocomplete.opts.onShown).toHaveBeenCalled();

        expect(this.autocomplete.results).toEqual(data);
        expect(this.autocomplete.$ul.empty).toHaveBeenCalled();

        expect(fn).toHaveBeenCalledWith('foo');
        expect(fn).toHaveBeenCalledWith('bar');
        expect(fn).toHaveBeenCalledWith('quix');

        var $lis = this.autocomplete.$ul.find('li');
        expect($lis.length).toBe(3);

        var $li1 = $lis.eq(0);
        var $li2 = $lis.eq(1);
        var $li3 = $lis.eq(2);

        expect($li1.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li1.attr('data-idx')).toBe('0');
        expect($li1.attr('title')).toBe('foo called');
        expect($li1.html()).toBe('foo called');

        expect($li2.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li2.attr('data-idx')).toBe('1');
        expect($li2.attr('title')).toBe('bar called');
        expect($li2.html()).toBe('bar called');

        expect($li3.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li3.attr('data-idx')).toBe('2');
        expect($li3.attr('title')).toBe('quix called');
        expect($li3.html()).toBe('quix called');
      });

      it("should display object with simple attribute", function() {
        // GIVEN
        var data = [
          { id: 1, text: 'foo' },
          { id: 2, text: 'bar' },
          { id: 3, text: 'quix'}
        ];

        this.autocomplete.opts.label = 'text';

        // WHEN
        this.autocomplete.show(data);

        // THEN
        expect(this.autocomplete.$show).toHaveBeenCalled();
        expect(this.autocomplete.opts.onShown).toHaveBeenCalled();

        expect(this.autocomplete.results).toEqual(data);
        expect(this.autocomplete.$ul.empty).toHaveBeenCalled();

        var $lis = this.autocomplete.$ul.find('li');
        expect($lis.length).toBe(3);

        var $li1 = $lis.eq(0);
        var $li2 = $lis.eq(1);
        var $li3 = $lis.eq(2);

        expect($li1.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li1.attr('data-idx')).toBe('0');
        expect($li1.attr('title')).toBe('foo');
        expect($li1.html()).toBe('foo');

        expect($li2.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li2.attr('data-idx')).toBe('1');
        expect($li2.attr('title')).toBe('bar');
        expect($li2.html()).toBe('bar');

        expect($li3.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li3.attr('data-idx')).toBe('2');
        expect($li3.attr('title')).toBe('quix');
        expect($li3.html()).toBe('quix');
      });

      it("should display object with nested attribute", function() {
        // GIVEN
        var data = [
          { id: 1, value: { text: 'foo', text2: 'foo2' } },
          { id: 2, value: { text: 'bar', text2: 'bar2' } },
          { id: 3, value: { text: 'quix', text2: 'quix2' } }
        ];

        this.autocomplete.opts.label = 'value.text';

        // WHEN
        this.autocomplete.show(data);

        // THEN
        expect(this.autocomplete.$show).toHaveBeenCalled();
        expect(this.autocomplete.opts.onShown).toHaveBeenCalled();

        expect(this.autocomplete.results).toEqual(data);
        expect(this.autocomplete.$ul.empty).toHaveBeenCalled();

        var $lis = this.autocomplete.$ul.find('li');
        expect($lis.length).toBe(3);

        var $li1 = $lis.eq(0);
        var $li2 = $lis.eq(1);
        var $li3 = $lis.eq(2);

        expect($li1.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li1.attr('data-idx')).toBe('0');
        expect($li1.attr('title')).toBe('foo');
        expect($li1.html()).toBe('foo');

        expect($li2.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li2.attr('data-idx')).toBe('1');
        expect($li2.attr('title')).toBe('bar');
        expect($li2.html()).toBe('bar');

        expect($li3.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li3.attr('data-idx')).toBe('2');
        expect($li3.attr('title')).toBe('quix');
        expect($li3.html()).toBe('quix');
      });

      it("should not display null or undefined values", function() {
        // GIVEN
        var data = [ 'foo', null, undefined ];

        // WHEN
        this.autocomplete.show(data);

        // THEN
        expect(this.autocomplete.$show).toHaveBeenCalled();
        expect(this.autocomplete.opts.onShown).toHaveBeenCalled();

        expect(this.autocomplete.results).toEqual(data);
        expect(this.autocomplete.$ul.empty).toHaveBeenCalled();

        var $lis = this.autocomplete.$ul.find('li');
        expect($lis.length).toBe(3);

        var $li1 = $lis.eq(0);
        var $li2 = $lis.eq(1);
        var $li3 = $lis.eq(2);

        expect($li1.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li1.attr('data-idx')).toBe('0');
        expect($li1.attr('title')).toBe('foo');
        expect($li1.html()).toBe('foo');

        expect($li2.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li2.attr('data-idx')).toBe('1');
        expect($li2.attr('title')).toBe('');
        expect($li2.html()).toBe('');

        expect($li3.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li3.attr('data-idx')).toBe('2');
        expect($li3.attr('title')).toBe('');
        expect($li3.html()).toBe('');
      });
    });

    describe("Check Fetching", function() {
      beforeEach(function() {
        this.timer = {};

        spyOn(window, 'clearTimeout');
        spyOn(window, 'setTimeout').andReturn(this.timer);

        spyOn(this.autocomplete, 'show').andCallThrough();
        spyOn(this.autocomplete.opts, 'onShown').andCallThrough();
        spyOn(this.autocomplete, 'positionResult');
      });

      it("should not fetch if filter does not change", function() {
        // GIVEN
        this.autocomplete.filter = 'foo';

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        expect(window.setTimeout).not.toHaveBeenCalled();
        expect($.ajax).not.toHaveBeenCalled();
        expect(this.autocomplete.$ul.show).toHaveBeenCalled();
        expect(this.autocomplete.positionResult).toHaveBeenCalled();
      });

      it("should not fetch and not display result if filter does not change and item is already selected", function() {
        // GIVEN
        this.autocomplete.item = 'foo';
        this.autocomplete.filter = 'foo';

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        expect(window.setTimeout).not.toHaveBeenCalled();
        expect($.ajax).not.toHaveBeenCalled();
        expect(this.autocomplete.$ul.show).not.toHaveBeenCalled();
        expect(this.autocomplete.positionResult).not.toHaveBeenCalled();
      });

      it("should fetch results", function() {
        // GIVEN
        var fn = jasmine.createSpy('fn');
        this.autocomplete.opts.unSelect = fn;

        // Disable cache
        this.autocomplete.opts.cache = false;

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        expect(fn).not.toHaveBeenCalled();
        expect(window.clearTimeout).not.toHaveBeenCalled();
        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
        expect($.ajax).not.toHaveBeenCalled();
        expect(this.autocomplete.timer).toBeDefined();
        expect(this.autocomplete.xhr).toBeDefined();

        window.setTimeout.argsForCall[0][0]();

        expect($.ajax).toHaveBeenCalledWith({
          url: '/search',
          type: 'GET',
          dataType: 'json',
          data: {
            filter: 'foo',
            limit: 10
          }
        });

        expect(this.xhr.abort).not.toHaveBeenCalled();
        expect(this.xhr.done).toHaveBeenCalledWith(jasmine.any(Function));
        expect(this.autocomplete.show).not.toHaveBeenCalled();

        this.xhr.done.argsForCall[0][0](['foo']);
        expect(this.autocomplete.timer).toBe(null);
        expect(this.autocomplete.xhr).toBe(null);
        expect(this.autocomplete.show).toHaveBeenCalledWith(['foo']);
        expect(this.autocomplete.caches['foo']).toBeUndefined();
      });

      it("should fetch results and transform result object", function() {
        // GIVEN
        var transformResults = jasmine.createSpy('fn').andCallFake(function(result) {
          return result.data;
        });

        this.autocomplete.opts.transformResults = transformResults;

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        expect(transformResults).not.toHaveBeenCalled();
        expect(window.clearTimeout).not.toHaveBeenCalled();
        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
        expect($.ajax).not.toHaveBeenCalled();
        expect(this.autocomplete.timer).toBeDefined();
        expect(this.autocomplete.xhr).toBeDefined();

        window.setTimeout.argsForCall[0][0]();

        expect($.ajax).toHaveBeenCalledWith({
          url: '/search',
          type: 'GET',
          dataType: 'json',
          data: {
            filter: 'foo',
            limit: 10
          }
        });

        expect(this.xhr.abort).not.toHaveBeenCalled();
        expect(this.xhr.done).toHaveBeenCalledWith(jasmine.any(Function));
        expect(this.autocomplete.show).not.toHaveBeenCalled();

        var response = {
          data: ['foo']
        };

        this.xhr.done.argsForCall[0][0](response);

        expect(this.autocomplete.timer).toBe(null);
        expect(this.autocomplete.xhr).toBe(null);
        expect(transformResults).toHaveBeenCalledWith(response);
        expect(this.autocomplete.show).toHaveBeenCalledWith(['foo']);
      });

      it("should fetch results using jsonp data type", function() {
        // GIVEN
        this.autocomplete.opts.dataType = 'jsonp';

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
        expect($.ajax).not.toHaveBeenCalled();
        expect(this.autocomplete.timer).toBeDefined();
        expect(this.autocomplete.xhr).toBeDefined();

        window.setTimeout.argsForCall[0][0]();

        expect($.ajax).toHaveBeenCalledWith({
          url: '/search',
          type: 'GET',
          dataType: 'jsonp',
          data: {
            filter: 'foo',
            limit: 10
          }
        });
      });

      it("should fetch results using jsonp data type and add jsonp and jsonpCallback parameters", function() {
        // GIVEN
        this.autocomplete.opts.jsonp = false;
        this.autocomplete.opts.jsonpCallback = 'foo';
        this.autocomplete.opts.dataType = 'jsonp';

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
        expect($.ajax).not.toHaveBeenCalled();
        expect(this.autocomplete.timer).toBeDefined();
        expect(this.autocomplete.xhr).toBeDefined();

        window.setTimeout.argsForCall[0][0]();

        expect($.ajax).toHaveBeenCalledWith({
          url: '/search',
          type: 'GET',
          dataType: 'jsonp',
          jsonp: false,
          jsonpCallback: 'foo',
          data: {
            filter: 'foo',
            limit: 10
          }
        });
      });

      it("should fetch results and store in cache if cache is enable", function() {
        // GIVEN
        this.autocomplete.opts.unSelect = jasmine.createSpy('fn');

        // Enable cache
        this.autocomplete.opts.cache = true;

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        window.setTimeout.argsForCall[0][0]();
        expect($.ajax).toHaveBeenCalledWith({
          url: '/search',
          type: 'GET',
          dataType: 'json',
          data: {
            filter: 'foo',
            limit: 10
          }
        });

        expect(this.xhr.abort).not.toHaveBeenCalled();
        expect(this.xhr.done).toHaveBeenCalledWith(jasmine.any(Function));
        expect(this.autocomplete.show).not.toHaveBeenCalled();

        this.xhr.done.argsForCall[0][0](['foo']);
        expect(this.autocomplete.timer).toBe(null);
        expect(this.autocomplete.xhr).toBe(null);
        expect(this.autocomplete.show).toHaveBeenCalledWith(['foo']);
        expect(this.autocomplete.caches['foo']).toEqual(['foo']);
      });

      it("should not call fetch if cache is enable and result has been fetched", function() {
        // GIVEN
        this.autocomplete.opts.unSelect = jasmine.createSpy('fn');

        // Enable cache
        this.autocomplete.opts.cache = true;
        this.autocomplete.caches['foo'] = ['foo'];

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        expect(window.setTimeout).not.toHaveBeenCalled();
        expect(this.autocomplete.show).toHaveBeenCalledWith(['foo']);
        expect(this.autocomplete.caches['foo']).toEqual(['foo']);
      });

      it("should not call fetch if cache is enable and result has been fetched and is case-insensitive", function() {
        // GIVEN
        this.autocomplete.opts.unSelect = jasmine.createSpy('fn');

        // Enable cache
        this.autocomplete.opts.cache = true;
        this.autocomplete.caches['foo'] = ['foo'];

        // WHEN
        this.autocomplete.fetch('FOO');

        // THEN
        expect(window.setTimeout).not.toHaveBeenCalled();
        expect(this.autocomplete.show).toHaveBeenCalledWith(['foo']);
        expect(this.autocomplete.caches['foo']).toEqual(['foo']);
      });

      it("should clear cache", function() {
        // GIVEN
        // Enable cache
        this.autocomplete.opts.cache = true;
        this.autocomplete.caches['foo'] = ['foo'];

        // WHEN
        this.autocomplete.clearCache();

        // THEN
        expect(this.autocomplete.caches).toEqual({});
      });

      it("should fetch results and call callback if an item was selected", function() {
        // GIVEN
        var fn = jasmine.createSpy('fn');
        this.autocomplete.opts.unSelect = fn;
        this.autocomplete.item = 'bar';

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        expect(fn).toHaveBeenCalled();
        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
      });

      it("should abort current timeout if a new is coming", function() {
        // GIVEN
        this.autocomplete.timer = this.timer;

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        expect(window.clearTimeout).toHaveBeenCalledWith(this.timer);
        expect(this.xhr.abort).not.toHaveBeenCalled();

        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
        expect(this.autocomplete.timer).toBeDefined();
      });

      it("should abort current timeout and current request if a new is coming", function() {
        // GIVEN
        this.autocomplete.xhr = this.xhr;
        this.autocomplete.timer = this.timer;

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        expect(window.clearTimeout).toHaveBeenCalledWith(this.timer);
        expect(this.xhr.abort).toHaveBeenCalled();

        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
        expect(this.autocomplete.timer).toBeDefined();
      });

      it("should fetch results without limit if limit is null", function() {
        // GIVEN
        this.autocomplete.opts.limit = null;

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        window.setTimeout.argsForCall[0][0]();
        expect($.ajax).toHaveBeenCalledWith({
          url: '/search',
          type: 'GET',
          dataType: 'json',
          data: {
            filter: 'foo'
          }
        });
      });

      it("should append some parameters to request if datas are given in options as object", function() {
        // GIVEN
        this.autocomplete.opts.datas = {
          foo: 'bar'
        };

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        window.setTimeout.argsForCall[0][0]();
        expect($.ajax).toHaveBeenCalledWith({
          url: '/search',
          type: 'GET',
          dataType: 'json',
          data: {
            filter: 'foo',
            limit: 10,
            foo: 'bar'
          }
        });
      });

      it("should append some parameters to request if datas are given in options as function", function() {
        // GIVEN
        this.autocomplete.opts.datas = function() {
          return {
            foo: 'bar'
          };
        };

        // WHEN
        this.autocomplete.fetch('foo');

        // THEN
        window.setTimeout.argsForCall[0][0]();
        expect($.ajax).toHaveBeenCalledWith({
          url: '/search',
          type: 'GET',
          dataType: 'json',
          data: {
            filter: 'foo',
            limit: 10,
            foo: 'bar'
          }
        });
      });
    });

    describe("Check Highlight behavior", function() {
      beforeEach(function() {
        this.autocomplete.$ul
          .append(this.$li1)
          .append(this.$li2)
          .append(this.$li3);

        this.autocomplete.results = this.results;
        this.autocomplete.idx = -1;
      });

      it("should highlight first item if index 0 is given", function() {
        // WHEN
        this.autocomplete.highlight(0);

        // THEN
        expect(this.autocomplete.idx).toBe(0);
        expect(this.autocomplete.item).toBeUndefined();
        expect(this.$li1.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li1.addClass).toHaveBeenCalledWith(this.cssActive);
      });

      it("should highlight second item if index 1 is given", function() {
        // WHEN
        this.autocomplete.highlight(1);

        // THEN
        expect(this.autocomplete.idx).toBe(1);
        expect(this.autocomplete.item).toBeUndefined();
        expect(this.$li1.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.addClass).toHaveBeenCalledWith(this.cssActive);
      });

      it("should highlight second item if index 2 is given", function() {
        // WHEN
        this.autocomplete.highlight(2);

        // THEN
        expect(this.autocomplete.idx).toBe(2);
        expect(this.autocomplete.item).toBeUndefined();
        expect(this.$li1.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.addClass).toHaveBeenCalledWith(this.cssActive);
      });

      it("should highlight last item if index -1 is given", function() {
        // WHEN
        this.autocomplete.highlight(-1);

        // THEN
        expect(this.autocomplete.idx).toBe(2);
        expect(this.autocomplete.item).toBeUndefined();
        expect(this.$li1.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.addClass).toHaveBeenCalledWith(this.cssActive);
      });

      it("should highlight last item if index -2 is given", function() {
        // WHEN
        this.autocomplete.highlight(-2);

        // THEN
        expect(this.autocomplete.idx).toBe(2);
        expect(this.autocomplete.item).toBeUndefined();
        expect(this.$li1.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.addClass).toHaveBeenCalledWith(this.cssActive);
      });

      it("should highlight first item if index 3 is given", function() {
        // WHEN
        this.autocomplete.highlight(3);

        // THEN
        expect(this.autocomplete.idx).toBe(0);
        expect(this.autocomplete.item).toBeUndefined();
        expect(this.$li1.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li1.addClass).toHaveBeenCalledWith(this.cssActive);
      });
    });

    describe("Check Keydow/Keypress/MouseEnter Events", function() {
      beforeEach(function() {
        this.mouseenter = jQuery.Event('mouseenter');
        this.keydownEvent = jQuery.Event('keydown');
        this.keyupEvent = jQuery.Event('keyup');
        this.click = jQuery.Event('click');
        this.focusin = jQuery.Event('focusin');
        this.focusout = jQuery.Event('focusout');

        spyOn(this.keydownEvent, 'preventDefault');
        spyOn(this.keydownEvent, 'stopPropagation');
        spyOn(this.keydownEvent, 'stopImmediatePropagation');

        spyOn(this.keyupEvent, 'preventDefault');
        spyOn(this.keyupEvent, 'stopPropagation');
        spyOn(this.keyupEvent, 'stopImmediatePropagation');

        spyOn(this.autocomplete, 'highlight');
        spyOn(this.autocomplete, 'select');
        spyOn(this.autocomplete, 'fetch');
        spyOn(this.autocomplete, 'clear');
        spyOn(this.autocomplete, 'autoSelect');
        spyOn(this.autocomplete, 'positionResult');

        spyOn(window, 'setTimeout');
      });

      it("should remove active item style if mouse enter in list of results", function() {
        // GIVEN
        var $li1 = $('<li class="jq-autocomplete-item-active">foo</li>');
        var $li2 = $('<li>bar</li>');
        this.autocomplete.$ul.append($li1).append($li2);

        // WHEN
        this.autocomplete.$ul.trigger(this.mouseenter);

        // THEN
        expect($li1.removeClass).toHaveBeenCalledWith('jq-autocomplete-item-active');
        expect($li2.removeClass).toHaveBeenCalledWith('jq-autocomplete-item-active');

        expect($li1.hasClass('jq-autocomplete-item-active')).toBe(false);
        expect($li2.hasClass('jq-autocomplete-item-active')).toBe(false);
      });

      it("should select item if user click on it", function() {
        // GIVEN
        var $li1 = $('<li data-idx="0" class="jq-autocomplete-item-active">foo</li>');
        var $li2 = $('<li data-idx="1">bar</li>');
        this.autocomplete.$ul.append($li1).append($li2);

        // WHEN
        $li1.trigger(this.click);

        // THEN
        expect(this.autocomplete.select).toHaveBeenCalledWith(0);
        expect(this.autocomplete.$input.focus).toHaveBeenCalled();
      });

      it("should set focus if enter key is pressed", function() {
        // GIVEN
        this.keydownEvent.keyCode = 13;
        this.autocomplete.idx = 0;
        this.autocomplete.results = [
          { id: 1 }
        ];

        // WHEN
        this.autocomplete.$input.trigger(this.keydownEvent);

        // THEN
        expect(this.autocomplete.$input.focus).toHaveBeenCalled();
        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.keydownEvent.stopImmediatePropagation).toHaveBeenCalled();
      });

      it("should not set focus if enter key is pressed", function() {
        // GIVEN
        this.keydownEvent.keyCode = 13;
        this.autocomplete.idx = -1;

        // WHEN
        this.autocomplete.$input.trigger(this.keydownEvent);

        // THEN
        expect(this.autocomplete.$input.focus).not.toHaveBeenCalled();
        expect(this.keydownEvent.preventDefault).not.toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).not.toHaveBeenCalled();
        expect(this.keydownEvent.stopImmediatePropagation).not.toHaveBeenCalled();
      });

      it("should show last results on focus", function() {
        // GIVEN
        this.autocomplete.results = ['foo', 'bar', 'quix'];

        // WHEN
        this.autocomplete.$input.trigger(this.focusin);

        // THEN
        expect(this.autocomplete.focus).toBe(true);
        expect(this.autocomplete.$ul.show).toHaveBeenCalled();
        expect(this.autocomplete.positionResult).toHaveBeenCalled();
      });

      it("should not show last results on focus if an item is already selected", function() {
        // GIVEN
        this.autocomplete.results = ['foo', 'bar', 'quix'];
        this.autocomplete.item = 'foo';

        // WHEN
        this.autocomplete.$input.trigger(this.focusin);

        // THEN
        expect(this.autocomplete.focus).toBe(true);
        expect(this.autocomplete.$ul.show).not.toHaveBeenCalled();
        expect(this.autocomplete.positionResult).not.toHaveBeenCalled();
      });

      it("should not show last results if no results are known", function() {
        // GIVEN
        this.autocomplete.results = [];

        // WHEN
        this.autocomplete.$input.trigger(this.focusin);

        // THEN
        expect(this.autocomplete.focus).toBe(true);
        expect(this.autocomplete.$ul.show).not.toHaveBeenCalled();
        expect(this.autocomplete.positionResult).not.toHaveBeenCalled();
      });

      it("hide results on focusout", function() {
        // GIVEN
        spyOn(this.autocomplete.opts, 'focusout').andCallThrough();
        this.autocomplete.$visible = true;
        this.autocomplete.$input.val('foo');

        // WHEN
        this.autocomplete.$input.trigger(this.focusout);

        // THEN
        expect(this.autocomplete.focus).toBe(false);
        expect(this.autocomplete.$ul.hide).not.toHaveBeenCalled();
        expect(this.autocomplete.positionResult).not.toHaveBeenCalled();
        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
        expect(this.autocomplete.opts.focusout).not.toHaveBeenCalledWith(this.autocomplete.item);

        window.setTimeout.argsForCall[0][0]();
        expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
        expect(this.autocomplete.positionResult).not.toHaveBeenCalled();
        expect(this.autocomplete.autoSelect).toHaveBeenCalledWith('foo');
        expect(this.autocomplete.opts.focusout).toHaveBeenCalledWith(this.autocomplete.item);
      });

      it("should fetch results if filter is long enough", function() {
        // GIVEN
        this.keyupEvent.keyCode = 25;
        this.autocomplete.$input.val('foo');
        this.autocomplete.opts.minSize = 2;

        // WHEN
        this.autocomplete.$input.trigger(this.keyupEvent);

        // THEN
        expect(this.autocomplete.fetch).toHaveBeenCalledWith('foo');
      });

      it("should fetch results if filter is equal to min size", function() {
        // GIVEN
        this.keyupEvent.keyCode = 25;
        this.autocomplete.$input.val('foo');
        this.autocomplete.opts.minSize = 3;

        // WHEN
        this.autocomplete.$input.trigger(this.keyupEvent);

        // THEN
        expect(this.autocomplete.fetch).toHaveBeenCalledWith('foo');
      });

      it("should trim filter and fetch", function() {
        // GIVEN
        this.keyupEvent.keyCode = 25;
        this.autocomplete.$input.val(' foo ');
        this.autocomplete.opts.minSize = 2;

        // WHEN
        this.autocomplete.$input.trigger(this.keyupEvent);

        // THEN
        expect(this.autocomplete.fetch).toHaveBeenCalledWith('foo');
      });

      it("should not fetch results if filter is too small", function() {
        // GIVEN
        this.keyupEvent.keyCode = 25;
        this.autocomplete.$visible = true;
        this.autocomplete.$input.val('foo');
        this.autocomplete.opts.minSize = 5;

        // WHEN
        this.autocomplete.$input.trigger(this.keyupEvent);

        // THEN
        expect(this.autocomplete.fetch).not.toHaveBeenCalled();
        expect(this.autocomplete.filter).toEqual('foo');
        expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
        expect(this.autocomplete.positionResult).not.toHaveBeenCalled();
        expect(this.autocomplete.clear).toHaveBeenCalled();
      });

      it("should highlight first item if arrow down is pressed and current idx is -1", function() {
        // GIVEN
        this.keydownEvent.keyCode = 40;

        // WHEN
        this.autocomplete.$input.trigger(this.keydownEvent);

        // THEN
        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(0);
      });

      it("should highlight second item if arrow down is pressed and current idx is 0", function() {
        // GIVEN
        this.keydownEvent.keyCode = 40;
        this.autocomplete.idx = 0;

        // WHEN
        this.autocomplete.$input.trigger(this.keydownEvent);

        // THEN
        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(1);
      });

      it("should highlight third item if arrow down is pressed and current idx is 1", function() {
        // GIVEN
        this.keydownEvent.keyCode = 40;
        this.autocomplete.idx = 1;

        // WHEN
        this.autocomplete.$input.trigger(this.keydownEvent);

        // THEN
        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(2);
      });

      it("should highlight first item if arrow down is pressed and current idx is 2", function() {
        // GIVEN
        this.keydownEvent.keyCode = 40;
        this.autocomplete.idx = 2;

        // WHEN
        this.autocomplete.$input.trigger(this.keydownEvent);

        // THEN
        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(3);
      });

      it("should highlight last item if arrow up is pressed and current idx is -1", function() {
        // GIVEN
        this.keydownEvent.keyCode = 38;

        // WHEN
        this.autocomplete.$input.trigger(this.keydownEvent);

        // THEN
        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(-2);
      });

      it("should highlight second item if arrow up is pressed and current idx is 2", function() {
        // GIVEN
        this.keydownEvent.keyCode = 38;
        this.autocomplete.idx = 2;

        // WHEN
        this.autocomplete.$input.trigger(this.keydownEvent);

        // THEN
        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(1);
      });

      it("should highlight first item if arrow down is pressed and current idx is 1", function() {
        // GIVEN
        this.keydownEvent.keyCode = 38;
        this.autocomplete.idx = 1;

        // WHEN
        this.autocomplete.$input.trigger(this.keydownEvent);

        // THEN
        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(0);
      });

      it("should highlight last item if arrow down is pressed and current idx is 0", function() {
        // GIVEN
        this.keydownEvent.keyCode = 38;
        this.autocomplete.idx = 0;

        // WHEN
        this.autocomplete.$input.trigger(this.keydownEvent);

        // THEN
        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(-1);
      });

      it("should select current index with tab event", function() {
        // GIVEN
        this.keydownEvent.keyCode = 9;
        this.autocomplete.idx = 0;

        // WHEN
        this.autocomplete.$input.trigger(this.keydownEvent);

        // THEN
        expect(this.keydownEvent.preventDefault).not.toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).not.toHaveBeenCalled();
        expect(this.autocomplete.select).toHaveBeenCalledWith(0);
      });
    });

    describe("Check Destroy Events", function() {
      beforeEach(function() {
        spyOn(this.autocomplete, 'destroy');
        spyOn(this.autocomplete, 'unbind');
      });

      it("should destroy plugin when input is removed from dom", function() {
        // WHEN
        this.autocomplete.$input.remove();

        // THEN
        expect(this.autocomplete.destroy).toHaveBeenCalled();
      });

      it("should not destroy plugin twice", function() {
        // GIVEN
        var unbind = this.autocomplete.unbind;
        var $input = this.autocomplete.$input;
        this.autocomplete.destroy.andCallThrough();

        // WHEN
        this.autocomplete.destroy();
        $input.remove();

        // THEN
        expect(unbind).toHaveBeenCalled();
        expect(unbind.callCount).toBe(1);
      });
    });
  });
});
