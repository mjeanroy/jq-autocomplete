/**
 *
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
    expect(this.$input.data('jqAutoComplete')).toBeFalsy();

    this.$input.jqAutoComplete({
      url: '/search'
    });

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
      saveUrl: '',
      label: jasmine.any(Function),
      minSize: 3,
      method: 'GET',
      saveMethod: '',
      saveDataType: 'json',
      limit: 10,
      filterName: 'filter',
      limitName: 'limit',
      datas: null,
      cache: false,
      relativeTo: null,
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
      focusout: jasmine.any(Function)
    });
  });

   it("should initialize autocomplete with data attributes", function() {
    expect(this.$input.data('jqAutoComplete')).toBeFalsy();

    this.$input.attr('data-min-size', '2');
    this.$input.attr('data-limit', '5');
    this.$input.attr('data-url', '/search');
    this.$input.attr('data-save-url', '/save');
    this.$input.attr('data-save-method', 'PUT');
    this.$input.attr('data-save-data-type', 'json');
    this.$input.attr('data-submit', 'Save');
    this.$input.attr('data-cancel', 'Cancel');
    this.$input.attr('data-create-form', '#foo');
    this.$input.attr('data-create-label', 'Create it!');
    this.$input.attr('data-filter-name', 'myFilter');
    this.$input.attr('data-limit-name', 'myLimit');
    this.$input.attr('data-method', 'POST');
    this.$input.attr('data-label', 'label');
    this.$input.attr('data-cache', 'true');

    this.$input.jqAutoComplete();
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
      saveUrl: '/save',
      label: 'label',
      minSize: 2,
      method: 'POST',
      saveMethod: 'PUT',
      saveDataType: 'json',
      limit: 5,
      filterName: 'myFilter',
      limitName: 'myLimit',
      datas: null,
      cache: true,
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
      focusout: jasmine.any(Function)
    });
  });

  it("should set absolute position", function() {
    this.$input.jqAutoComplete();
    expect(this.$input.data('jqAutoComplete')).toBeDefined();

    var ac = this.$input.data('jqAutoComplete');

    expect(ac.fixed).toBe(false);
    expect(ac.position).toBe('absolute');
    expect(this.$input.position).toHaveBeenCalled();
    expect(this.$input.parent).toHaveBeenCalled();
    expect(this.$input.parent().css).toHaveBeenCalledWith('position', 'relative');

    expect(ac.left).toBe(0);
    expect(ac.top).toBe(20);
    expect(ac.width).toBe(30);
  });

  it("should set absolute position relative to another element", function() {
    this.$input.jqAutoComplete({
      relativeTo: 'body'
    });

    expect(this.$input.data('jqAutoComplete')).toBeDefined();

    var ac = this.$input.data('jqAutoComplete');

    expect(ac.fixed).toBe(false);
    expect(ac.position).toBe('absolute');
    expect(this.$input.position).toHaveBeenCalled();
    expect(this.$input.parent).not.toHaveBeenCalled();
    expect($('body').css).toHaveBeenCalledWith('position', 'relative');

    expect(ac.left).toBe(0);
    expect(ac.top).toBe(20);
    expect(ac.width).toBe(30);
  });

  it("should set fixed position", function() {
    this.$input.jqAutoComplete({
      relativeTo: 'fixed'
    });
    expect(this.$input.data('jqAutoComplete')).toBeDefined();

    var ac = this.$input.data('jqAutoComplete');

    expect(ac.fixed).toBe(true);
    expect(ac.position).toBe('fixed');
    expect(this.$input.offset).toHaveBeenCalled();
    expect(this.$input.parent).not.toHaveBeenCalled();
    expect($.fn.css).not.toHaveBeenCalledWith('position', 'relative');
  });

  it("should call destroy function", function() {
    this.$input.jqAutoComplete();
    var ac = this.$input.data('jqAutoComplete');
    spyOn(ac, 'destroy');

    this.$input.jqAutoComplete().destroy();
    expect(ac.destroy).toHaveBeenCalled();
    expect(this.$input.data('jqAutoComplete')).toBeUndefined();
  });

  it("should call clear function", function() {
    this.$input.jqAutoComplete();
    var ac = this.$input.data('jqAutoComplete');
    spyOn(ac, 'clear');

    var result = this.$input.jqAutoComplete().clear();
    expect(ac.clear).toHaveBeenCalled();
    expect(result).toBe(this.$input);
  });

  it("should call empty function", function() {
    this.$input.jqAutoComplete();
    var ac = this.$input.data('jqAutoComplete');
    spyOn(ac, 'empty');

    var result = this.$input.jqAutoComplete().empty();
    expect(ac.empty).toHaveBeenCalled();
    expect(result).toBe(this.$input);
  });

  it("should set item on autocomplete", function() {
    this.$input.jqAutoComplete();
    var ac = this.$input.data('jqAutoComplete');
    spyOn(ac, 'val');

    var result = this.$input.jqAutoComplete().val('foo');
    expect(ac.val).toHaveBeenCalledWith('foo');
    expect(result).toBe(this.$input);
  });

  it("should get selected item", function() {
    this.$input.jqAutoComplete();
    var ac = this.$input.data('jqAutoComplete');
    ac.item = 'foo';

    var result = this.$input.jqAutoComplete().val();
    expect(result).toBe('foo');
  });

  it("should call clearCache function", function() {
    this.$input.jqAutoComplete();
    var ac = this.$input.data('jqAutoComplete');
    spyOn(ac, 'clearCache');

    var result = this.$input.jqAutoComplete().clearCache();
    expect(ac.clearCache).toHaveBeenCalled();
    expect(result).toBe(this.$input);
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

    it("should bind user events", function() {
      expect(this.autocomplete.$input.on).toHaveBeenCalledWith('keyup.jqauto', jasmine.any(Function));
      expect(this.autocomplete.$input.on).toHaveBeenCalledWith('keydown.jqauto', jasmine.any(Function));
      expect(this.autocomplete.$input.on).toHaveBeenCalledWith('focusin.jqauto', jasmine.any(Function));
      expect(this.autocomplete.$input.on).toHaveBeenCalledWith('focusout.jqauto', jasmine.any(Function));
      expect(this.autocomplete.$ul.on).toHaveBeenCalledWith('mouseenter.jqauto', jasmine.any(Function));
      expect(this.autocomplete.$ul.on).toHaveBeenCalledWith('click.jqauto', 'li', jasmine.any(Function));
      expect(this.autocomplete.$ul.delegate).not.toHaveBeenCalledWith();
    });

    it("should unbind user events", function() {
      this.autocomplete.unbind();
      expect(this.autocomplete.$input.off).toHaveBeenCalledWith('.jqauto');
      expect(this.autocomplete.$ul.off).toHaveBeenCalledWith('.jqauto');
    });

    it("should destroy autocomplete", function() {
      spyOn(this.autocomplete, 'unbind');
      var unbind = this.autocomplete.unbind;

      this.autocomplete.results = [];
      this.autocomplete.item = 'foo';
      this.autocomplete.idx = -1;

      this.autocomplete.destroy();

      expect(unbind).toHaveBeenCalled();
      expect(this.autocomplete.results).toBe(null);
      expect(this.autocomplete.item).toBe(null);
      expect(this.autocomplete.idx).toBe(null);
    });

    it("should clear timer and xhr when autocomplete is destroyed", function() {
      spyOn(this.autocomplete, 'unbind');
      spyOn(window, 'clearTimeout');

      var timer = {};
      var xhr = jasmine.createSpyObj('xhr', ['abort']);

      this.autocomplete.timer = timer;
      this.autocomplete.xhr = xhr;

      this.autocomplete.results = [];
      this.autocomplete.item = 'foo';
      this.autocomplete.idx = -1;

      this.autocomplete.destroy();

      expect(window.clearTimeout).toHaveBeenCalledWith(timer);
      expect(xhr.abort).toHaveBeenCalled();
    });

    it("should clear results and hide results list", function() {
      spyOn(this.autocomplete, 'resetForm').andCallThrough();

      this.autocomplete.idx = 0;

      this.autocomplete.results = [
        { id: 1, label: 'foo' },
        { id: 2, label: 'bar' }
      ];

      this.autocomplete.item = this.autocomplete.results[0];

      var fn = jasmine.createSpy('fn');
      this.autocomplete.opts.unSelect = fn;

      this.autocomplete.clear();
      expect(this.autocomplete.resetForm).not.toHaveBeenCalled();
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
      this.autocomplete.idx = 0;

      this.autocomplete.results = [
        { id: 1, label: 'foo' },
        { id: 2, label: 'bar' }
      ];

      var fn = jasmine.createSpy('fn');
      this.autocomplete.opts.unSelect = fn;

      this.autocomplete.clear();
      expect(this.autocomplete.$input.val).not.toHaveBeenCalled();

      expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
      expect(this.autocomplete.$ul.empty).toHaveBeenCalled();

      expect(this.autocomplete.results).toEqual([]);
      expect(this.autocomplete.idx).toBe(-1);
      expect(this.autocomplete.item).toBe(null);

      expect(fn).not.toHaveBeenCalled();
    });

    it("should clear results, hide results list and clear input value", function() {
      spyOn(this.autocomplete, 'resetForm').andCallThrough();

      this.autocomplete.idx = 0;
      this.autocomplete.results = this.results;
      this.autocomplete.item = this.results[0];

      this.autocomplete.empty();
      expect(this.autocomplete.resetForm).toHaveBeenCalled();
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
        spyOn(this.autocomplete, 'hideCreationForm').andCallThrough();
        this.autocomplete.$hide();
        expect(this.autocomplete.hideCreationForm).toHaveBeenCalled();
      });

      it("should hide creation form", function() {
        this.autocomplete.hideCreationForm();

        expect(this.autocomplete.$creation).toBe(false);
        expect(this.autocomplete.$form.fadeOut).toHaveBeenCalledWith('fast', jasmine.any(Function));
        expect(this.autocomplete.$ul.show).toHaveBeenCalled();
        expect(this.autocomplete.$input.focus).toHaveBeenCalled();
      });

      it("should show creation form", function() {
        var $input = jasmine.createSpyObj('$input', ['focus', 'val']);
        $input.val.andReturn($input);
        $input.focus.andReturn($input);

        this.autocomplete.$form.eq.andReturn($input);

        this.autocomplete.showCreationForm();

        expect(this.autocomplete.$creation).toBe(true);
        expect(this.autocomplete.$ul.fadeOut).toHaveBeenCalledWith('fast', jasmine.any(Function));
        expect(this.autocomplete.$form.show).toHaveBeenCalled();
        expect(this.autocomplete.$form.eq).toHaveBeenCalledWith(0);
        expect($input.val).toHaveBeenCalled();
        expect($input.focus).toHaveBeenCalled();
      });

      it("should create new item", function() {
        this.autocomplete.$creation = true;
        this.autocomplete.opts.saveMethod = 'POST';

        spyOn(this.autocomplete.$form, 'serializeArray').andReturn([
          {
            name: 'name',
            value: 'foo'
          },
          {
            name: 'bar',
            value: 'quix'
          }
        ]);

        spyOn(this.autocomplete.opts, 'onSaved');
        spyOn(this.autocomplete.opts, 'isValid').andReturn(true);

        this.autocomplete.create();

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
          data: datas,
          dataType: 'json'
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
        var $items = jasmine.createSpyObj('$items', ['each']);
        spyOn($.fn, 'find').andReturn($items);

        this.autocomplete.resetForm();
        expect(this.autocomplete.$form.find).toHaveBeenCalled();
        expect($items.each).toHaveBeenCalledWith(jasmine.any(Function));

        var $item = $('<input type="text" value="foo"/>');
        $items.each.argsForCall[0][0].call($item);
        expect($item.val).toHaveBeenCalledWith('');
        expect($item.val()).toBe('');
      });

      it("should not reset form if form is not set", function() {
        spyOn($.fn, 'find')
        this.autocomplete.$form = undefined;
        this.autocomplete.resetForm();
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
        this.autocomplete.left = 50;
        this.autocomplete.top = 30;
        this.autocomplete.width = 10;

        this.autocomplete.positionResult();

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
        this.autocomplete.positionResult();

        expect(this.autocomplete.$input.position).toHaveBeenCalled();

        expect(this.autocomplete.left).toBe(100);
        expect(this.autocomplete.top).toBe(70);
        expect(this.autocomplete.width).toBe(30);

        expect(this.autocomplete.$ul.css).not.toHaveBeenCalledWith();
      });
    });

    describe("Check Selection Functions", function() {

      it("should set a string value", function () {
        var fn = jasmine.createSpy('fn');
        this.autocomplete.opts.select = fn;

        this.autocomplete.idx = 0;
        this.autocomplete.val('foo');

        expect(this.autocomplete.item).toBe('foo');
        expect(this.autocomplete.filter).toBe('foo');
        expect(this.autocomplete.$input.val).toHaveBeenCalledWith('foo');
        expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
        expect(fn).toHaveBeenCalledWith('foo');
        expect(this.autocomplete.idx).toBe(-1);
      });

      it("should set an object value", function () {
        var obj = {
          id: 1,
          label: 'foo'
        };

        var fn = jasmine.createSpy('fn');

        this.autocomplete.opts.label = 'label';
        this.autocomplete.opts.select = fn;
        this.autocomplete.val(obj);

        expect(this.autocomplete.item).toBe(obj);
        expect(this.autocomplete.filter).toBe('foo');
        expect(this.autocomplete.$input.val).toHaveBeenCalledWith('foo');
        expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
        expect(fn).toHaveBeenCalledWith(obj);
      });

      it("should select item at given index", function () {
        spyOn(this.autocomplete, 'val');

        this.autocomplete.results = ['foo', 'bar', 'quix'];
        this.autocomplete.select(0);

        expect(this.autocomplete.val).toHaveBeenCalledWith('foo');
      });

      it("should not select if index is outside of range", function () {
        spyOn(this.autocomplete, 'val');

        this.autocomplete.results = ['foo', 'bar', 'quix'];

        this.autocomplete.select(-1);
        expect(this.autocomplete.val).not.toHaveBeenCalled();

        this.autocomplete.select(3);
        expect(this.autocomplete.val).not.toHaveBeenCalled();
      });
    });

    describe("Check Show Function", function() {
      beforeEach(function() {
        spyOn(this.autocomplete, 'positionResult').andCallThrough();
      });

      it("should display some strings", function () {
        var datas = ['foo', 'bar', 'quix'];
        this.autocomplete.show(datas);

        expect(this.autocomplete.results).toEqual(datas);
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

      it("should display some numbers", function () {
        var datas = [1, 2, 3];
        this.autocomplete.show(datas);

        expect(this.autocomplete.results).toEqual(datas);
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

      it("should display object with a custom renderer", function () {
        var datas = ['foo', 'bar', 'quix'];
        var fn = jasmine.createSpy('label').andCallFake(function (obj) {
          return obj + ' called';
        });
        this.autocomplete.opts.label = fn;

        this.autocomplete.show(datas);

        expect(this.autocomplete.results).toEqual(datas);
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

      it("should display object with simple attribute", function () {
        var datas = [
          { id: 1, text: 'foo' },
          { id: 2, text: 'bar' },
          { id: 3, text: 'quix'}
        ];

        this.autocomplete.opts.label = 'text';

        this.autocomplete.show(datas);

        expect(this.autocomplete.results).toEqual(datas);
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

      it("should display object with nested attribute", function () {
        var datas = [
          { id: 1, value: { text: 'foo', text2: 'foo2' } },
          { id: 2, value: { text: 'bar', text2: 'bar2' } },
          { id: 3, value: { text: 'quix', text2: 'quix2' } }
        ];

        this.autocomplete.opts.label = 'value.text';

        this.autocomplete.show(datas);

        expect(this.autocomplete.results).toEqual(datas);
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

      it("should not display null or undefined values", function () {
        var datas = [ 'foo', null, undefined ];
        this.autocomplete.show(datas);

        expect(this.autocomplete.results).toEqual(datas);
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

        spyOn(this.autocomplete, 'show');
        spyOn(this.autocomplete, 'positionResult');
      });

      it("should not fetch if filter does not change", function() {
        this.autocomplete.filter = 'foo';
        this.autocomplete.fetch('foo');

        expect(window.setTimeout).not.toHaveBeenCalled();
        expect($.ajax).not.toHaveBeenCalled();
        expect(this.autocomplete.$ul.show).toHaveBeenCalled();
        expect(this.autocomplete.positionResult).toHaveBeenCalled();
      });

      it("should not fetch and not display result if filter does not change and item is already selected", function() {
        this.autocomplete.item = 'foo';
        this.autocomplete.filter = 'foo';
        this.autocomplete.fetch('foo');

        expect(window.setTimeout).not.toHaveBeenCalled();
        expect($.ajax).not.toHaveBeenCalled();
        expect(this.autocomplete.$ul.show).not.toHaveBeenCalled();
        expect(this.autocomplete.positionResult).not.toHaveBeenCalled();
      });

      it("should fetch results", function() {
        var fn = jasmine.createSpy('fn');
        this.autocomplete.opts.unSelect = fn;

        // Disable cache
        this.autocomplete.opts.cache = false;

        this.autocomplete.fetch('foo');

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

      it("should fetch results and store in cache if cache is enable", function() {
        var fn = jasmine.createSpy('fn');
        this.autocomplete.opts.unSelect = fn;

        // Enable cache
        this.autocomplete.opts.cache = true;

        this.autocomplete.fetch('foo');

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
        var fn = jasmine.createSpy('fn');
        this.autocomplete.opts.unSelect = fn;

        // Enable cache
        this.autocomplete.opts.cache = true;
        this.autocomplete.caches['foo'] = ['foo'];

        this.autocomplete.fetch('foo');

        expect(window.setTimeout).not.toHaveBeenCalled();
        expect(this.autocomplete.show).toHaveBeenCalledWith(['foo']);
        expect(this.autocomplete.caches['foo']).toEqual(['foo']);
      });

      it("should not call fetch if cache is enable and result has been fetched and is case-insensitive", function() {
        var fn = jasmine.createSpy('fn');
        this.autocomplete.opts.unSelect = fn;

        // Enable cache
        this.autocomplete.opts.cache = true;
        this.autocomplete.caches['foo'] = ['foo'];

        this.autocomplete.fetch('FOO');

        expect(window.setTimeout).not.toHaveBeenCalled();
        expect(this.autocomplete.show).toHaveBeenCalledWith(['foo']);
        expect(this.autocomplete.caches['foo']).toEqual(['foo']);
      });

       it("should clear cache", function() {
        // Enable cache
        this.autocomplete.opts.cache = true;
        this.autocomplete.caches['foo'] = ['foo'];

        this.autocomplete.clearCache();
        expect(this.autocomplete.caches).toEqual({});
      });

      it("should fetch results and call callback if an item was selected", function() {
        var fn = jasmine.createSpy('fn');
        this.autocomplete.opts.unSelect = fn;
        this.autocomplete.item = 'bar';

        this.autocomplete.fetch('foo');

        expect(fn).toHaveBeenCalled();
        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
      });

      it("should abort current timeout if a new is coming", function() {
        this.autocomplete.timer = this.timer;
        this.autocomplete.fetch('foo');

        expect(window.clearTimeout).toHaveBeenCalledWith(this.timer);
        expect(this.xhr.abort).not.toHaveBeenCalled();

        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
        expect(this.autocomplete.timer).toBeDefined();
      });

      it("should abort current timeout and current request if a new is coming", function() {
        this.autocomplete.xhr = this.xhr;
        this.autocomplete.timer = this.timer;
        this.autocomplete.fetch('foo');

        expect(window.clearTimeout).toHaveBeenCalledWith(this.timer);
        expect(this.xhr.abort).toHaveBeenCalled();

        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
        expect(this.autocomplete.timer).toBeDefined();
      });

      it("should fetch results without limit if limit is null", function() {
        this.autocomplete.opts.limit = null;
        this.autocomplete.fetch('foo');

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
        this.autocomplete.opts.datas = {
          foo: 'bar'
        };

        this.autocomplete.fetch('foo');

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
        this.autocomplete.opts.datas = function() {
          return {
            foo: 'bar'
          };
        };

        this.autocomplete.fetch('foo');

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
        this.autocomplete.highlight(0);

        expect(this.autocomplete.idx).toBe(0);
        expect(this.autocomplete.item).toBeUndefined();
        expect(this.$li1.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li1.addClass).toHaveBeenCalledWith(this.cssActive);
      });

      it("should highlight second item if index 1 is given", function() {
        this.autocomplete.highlight(1);

        expect(this.autocomplete.idx).toBe(1);
        expect(this.autocomplete.item).toBeUndefined();
        expect(this.$li1.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.addClass).toHaveBeenCalledWith(this.cssActive);
      });

      it("should highlight second item if index 2 is given", function() {
        this.autocomplete.highlight(2);

        expect(this.autocomplete.idx).toBe(2);
        expect(this.autocomplete.item).toBeUndefined();
        expect(this.$li1.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.addClass).toHaveBeenCalledWith(this.cssActive);
      });

      it("should highlight last item if index -1 is given", function() {
        this.autocomplete.highlight(-1);

        expect(this.autocomplete.idx).toBe(2);
        expect(this.autocomplete.item).toBeUndefined();
        expect(this.$li1.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.addClass).toHaveBeenCalledWith(this.cssActive);
      });

      it("should highlight last item if index -2 is given", function() {
        this.autocomplete.highlight(-2);

        expect(this.autocomplete.idx).toBe(2);
        expect(this.autocomplete.item).toBeUndefined();
        expect(this.$li1.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li2.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.removeClass).toHaveBeenCalledWith(this.cssActive);
        expect(this.$li3.addClass).toHaveBeenCalledWith(this.cssActive);
      });

      it("should highlight first item if index 3 is given", function() {
        this.autocomplete.highlight(3);

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
        var $li1 = $('<li class="jq-autocomplete-item-active">foo</li>');
        var $li2 = $('<li>bar</li>');
        this.autocomplete.$ul.append($li1).append($li2);

        this.autocomplete.$ul.trigger(this.mouseenter);
        expect($li1.removeClass).toHaveBeenCalledWith('jq-autocomplete-item-active');
        expect($li2.removeClass).toHaveBeenCalledWith('jq-autocomplete-item-active');

        expect($li1.hasClass('jq-autocomplete-item-active')).toBe(false);
        expect($li2.hasClass('jq-autocomplete-item-active')).toBe(false);
      });

      it("should select item if user click on it", function() {
        var $li1 = $('<li data-idx="0" class="jq-autocomplete-item-active">foo</li>');
        var $li2 = $('<li data-idx="1">bar</li>');
        this.autocomplete.$ul.append($li1).append($li2);

        $li1.trigger(this.click);
        expect(this.autocomplete.select).toHaveBeenCalledWith(0);
        expect(this.autocomplete.$input.focus).toHaveBeenCalled();
      });

      it("should set focus if enter key is pressed", function() {
        this.keydownEvent.keyCode = 13;
        this.autocomplete.idx = 0;
        this.autocomplete.results = [
          { id: 1 }
        ];
        this.autocomplete.$input.trigger(this.keydownEvent);
        expect(this.autocomplete.$input.focus).toHaveBeenCalled();
        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.keydownEvent.stopImmediatePropagation).toHaveBeenCalled();
      });

      it("should not set focus if enter key is pressed", function() {
        this.keydownEvent.keyCode = 13;
        this.autocomplete.idx = -1;
        this.autocomplete.$input.trigger(this.keydownEvent);
        expect(this.autocomplete.$input.focus).not.toHaveBeenCalled();
        expect(this.keydownEvent.preventDefault).not.toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).not.toHaveBeenCalled();
        expect(this.keydownEvent.stopImmediatePropagation).not.toHaveBeenCalled();
      });

      it("should show last results on focus", function() {
        this.autocomplete.results = ['foo', 'bar', 'quix'];
        this.autocomplete.$input.trigger(this.focusin);

        expect(this.autocomplete.focus).toBe(true);
        expect(this.autocomplete.$ul.show).toHaveBeenCalled();
        expect(this.autocomplete.positionResult).toHaveBeenCalled();
      });

      it("should not show last results on focus if an item is already selected", function() {
        this.autocomplete.results = ['foo', 'bar', 'quix'];
        this.autocomplete.item = 'foo';
        this.autocomplete.$input.trigger(this.focusin);

        expect(this.autocomplete.focus).toBe(true);
        expect(this.autocomplete.$ul.show).not.toHaveBeenCalled();
        expect(this.autocomplete.positionResult).not.toHaveBeenCalled();
      });

      it("should not show last results if no results are known", function() {
        this.autocomplete.results = [];
        this.autocomplete.$input.trigger(this.focusin);

        expect(this.autocomplete.focus).toBe(true);
        expect(this.autocomplete.$ul.show).not.toHaveBeenCalled();
        expect(this.autocomplete.positionResult).not.toHaveBeenCalled();
      });

      it("hide results on focusout", function() {
        spyOn(this.autocomplete.opts, 'focusout').andCallThrough();

        this.autocomplete.$input.val('foo');
        this.autocomplete.$input.trigger(this.focusout);

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
        this.autocomplete.$input.val('foo');
        this.autocomplete.opts.minSize = 2;

        this.keyupEvent.keyCode = 25;
        this.autocomplete.$input.trigger(this.keyupEvent);

        expect(this.autocomplete.fetch).toHaveBeenCalledWith('foo');
      });

      it("should fetch results if filter is equal to min size", function() {
        this.autocomplete.$input.val('foo');
        this.autocomplete.opts.minSize = 3;

        this.keyupEvent.keyCode = 25;
        this.autocomplete.$input.trigger(this.keyupEvent);

        expect(this.autocomplete.fetch).toHaveBeenCalledWith('foo');
      });

      it("should trim filter and fetch", function() {
        this.autocomplete.$input.val(' foo ');
        this.autocomplete.opts.minSize = 2;

        this.keyupEvent.keyCode = 25;
        this.autocomplete.$input.trigger(this.keyupEvent);

        expect(this.autocomplete.fetch).toHaveBeenCalledWith('foo');
      });

      it("should not fetch results if filter is too small", function() {
        this.autocomplete.$input.val('foo');
        this.autocomplete.opts.minSize = 5;

        this.keyupEvent.keyCode = 25;
        this.autocomplete.$input.trigger(this.keyupEvent);

        expect(this.autocomplete.fetch).not.toHaveBeenCalled();
        expect(this.autocomplete.filter).toEqual('foo');
        expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
        expect(this.autocomplete.positionResult).not.toHaveBeenCalled();
        expect(this.autocomplete.clear).toHaveBeenCalled();
      });

      it("should highlight first item if arrow down is pressed and current idx is -1", function() {
        this.keydownEvent.keyCode = 40;
        this.autocomplete.$input.trigger(this.keydownEvent);

        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(0);
      });

      it("should highlight second item if arrow down is pressed and current idx is 0", function() {
        this.keydownEvent.keyCode = 40;
        this.autocomplete.idx = 0;
        this.autocomplete.$input.trigger(this.keydownEvent);

        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(1);
      });

      it("should highlight third item if arrow down is pressed and current idx is 1", function() {
        this.keydownEvent.keyCode = 40;
        this.autocomplete.idx = 1;
        this.autocomplete.$input.trigger(this.keydownEvent);

        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(2);
      });

      it("should highlight first item if arrow down is pressed and current idx is 2", function() {
        this.keydownEvent.keyCode = 40;
        this.autocomplete.idx = 2;
        this.autocomplete.$input.trigger(this.keydownEvent);

        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(3);
      });

      it("should highlight last item if arrow up is pressed and current idx is -1", function() {
        this.keydownEvent.keyCode = 38;
        this.autocomplete.$input.trigger(this.keydownEvent);

        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(-2);
      });

      it("should highlight second item if arrow up is pressed and current idx is 2", function() {
        this.keydownEvent.keyCode = 38;
        this.autocomplete.idx = 2;
        this.autocomplete.$input.trigger(this.keydownEvent);

        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(1);
      });

      it("should highlight first item if arrow down is pressed and current idx is 1", function() {
        this.keydownEvent.keyCode = 38;
        this.autocomplete.idx = 1;
        this.autocomplete.$input.trigger(this.keydownEvent);

        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(0);
      });

      it("should highlight last item if arrow down is pressed and current idx is 0", function() {
        this.keydownEvent.keyCode = 38;
        this.autocomplete.idx = 0;
        this.autocomplete.$input.trigger(this.keydownEvent);

        expect(this.keydownEvent.preventDefault).toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(-1);
      });

      it("should select current index with tab event", function() {
        this.keydownEvent.keyCode = 9;
        this.autocomplete.idx = 0;
        this.autocomplete.$input.trigger(this.keydownEvent);

        expect(this.keydownEvent.preventDefault).not.toHaveBeenCalled();
        expect(this.keydownEvent.stopPropagation).not.toHaveBeenCalled();
        expect(this.autocomplete.select).toHaveBeenCalledWith(0);
      });
    });
  });
});
