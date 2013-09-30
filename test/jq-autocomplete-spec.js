/**
 *
 */

describe("jQuery AutoComplete Test Suite", function() {

  beforeEach(function() {
    this.$fixtures = $('<div><input type="text" /></div>');
    this.$input = this.$fixtures.find('input');

    // Spy jQuery
    spyOn($.fn, 'outerWidth').andReturn(30);
    spyOn($.fn, 'outerHeight').andReturn(20);
    spyOn($.fn, 'on').andCallThrough();
    spyOn($.fn, 'off').andCallThrough();
    spyOn($.fn, 'delegate').andCallThrough();
    spyOn($.fn, 'focus').andCallThrough();
    spyOn($.fn, 'hide').andCallThrough();
    spyOn($.fn, 'show').andCallThrough();
    spyOn($.fn, 'empty').andCallThrough();
    spyOn($.fn, 'val').andCallThrough();
    spyOn($.fn, 'addClass').andCallThrough();
    spyOn($.fn, 'removeClass').andCallThrough();
  });

  it("should initialize autocomplete", function() {
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

    expect(ac.opts).toEqual({
      url: '/search',
      label: jasmine.any(Function),
      minSize: 3,
      method: 'GET',
      limit: 10,
      filterName: 'filter',
      limitName: 'limit',
      datas: null,
      select: jasmine.any(Function),
      unSelect: jasmine.any(Function)
    });
  });

  it("should call destroy function", function() {
    this.$input.jqAutoComplete();
    var ac = this.$input.data('jqAutoComplete');
    spyOn(ac, 'destroy');

    var result = this.$input.jqAutoComplete().destroy();
    expect(ac.destroy).toHaveBeenCalled();
    expect(result).toBe(this.$input);
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
    spyOn(ac, 'setItem');

    var result = this.$input.jqAutoComplete().item('foo');
    expect(ac.setItem).toHaveBeenCalledWith('foo');
    expect(result).toBe(this.$input);
  });

  it("should get selected item", function() {
    this.$input.jqAutoComplete();
    var ac = this.$input.data('jqAutoComplete');
    ac.item = 'foo';

    var result = this.$input.jqAutoComplete().item();
    expect(result).toBe('foo');
  });

  describe("Check Behavior of AutoComplete", function() {
    beforeEach(function() {
      spyOn($.fn, 'offset').andReturn({
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

    it("should append ul element to display results at correct position and correct size", function() {
      var $ul = this.$fixtures.find('ul');
      expect($ul.length).toBe(1);

      $ul = $ul.eq(0);
      expect($ul.hasClass('jq-autocomplete-results')).toBe(true);
      expect($ul.css('position')).toBe('fixed');
      expect($ul.css('top')).toBe('70px');
      expect($ul.css('left')).toBe('100px');
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
      this.autocomplete.idx = 0;

      this.autocomplete.results = [
        { id: 1, label: 'foo' },
        { id: 2, label: 'bar' }
      ];

      this.autocomplete.item = this.autocomplete.results[0];

      var fn = jasmine.createSpy('fn');
      this.autocomplete.opts.unSelect = fn;

      this.autocomplete.clear();
      expect(this.autocomplete.$input.val).not.toHaveBeenCalled();

      expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
      expect(this.autocomplete.$ul.empty).toHaveBeenCalled();

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
      this.autocomplete.idx = 0;
      this.autocomplete.results = this.results;
      this.autocomplete.item = this.results[0];

      this.autocomplete.empty();
      expect(this.autocomplete.$input.val).toHaveBeenCalledWith('');

      expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
      expect(this.autocomplete.$ul.empty).toHaveBeenCalled();

      expect(this.autocomplete.results).toEqual([]);
      expect(this.autocomplete.idx).toBe(-1);
      expect(this.autocomplete.item).toBe(null);
    });

    describe("Check Selection Functions", function() {

      it("should set a string value", function () {
        var fn = jasmine.createSpy('fn');
        this.autocomplete.opts.select = fn;

        this.autocomplete.idx = 0;
        this.autocomplete.setItem('foo');

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
        this.autocomplete.setItem(obj);

        expect(this.autocomplete.item).toBe(obj);
        expect(this.autocomplete.filter).toBe('foo');
        expect(this.autocomplete.$input.val).toHaveBeenCalledWith('foo');
        expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
        expect(fn).toHaveBeenCalledWith(obj);
      });

      it("should select item at given index", function () {
        spyOn(this.autocomplete, 'setItem');

        this.autocomplete.results = ['foo', 'bar', 'quix'];
        this.autocomplete.select(0);

        expect(this.autocomplete.setItem).toHaveBeenCalledWith('foo');
      });

      it("should not select if index is outside of range", function () {
        spyOn(this.autocomplete, 'setItem');

        this.autocomplete.results = ['foo', 'bar', 'quix'];

        this.autocomplete.select(-1);
        expect(this.autocomplete.setItem).not.toHaveBeenCalled();

        this.autocomplete.select(3);
        expect(this.autocomplete.setItem).not.toHaveBeenCalled();
      });
    });

    describe("Check Show Function", function() {
      it("should display some strings", function () {
        var datas = ['foo', 'bar', 'quix'];
        this.autocomplete.show(datas);

        expect(this.autocomplete.results).toEqual(datas);
        expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
        expect(this.autocomplete.$ul.empty).toHaveBeenCalled();
        expect(this.autocomplete.$ul.show).toHaveBeenCalled();

        var $lis = this.autocomplete.$ul.find('li');
        expect($lis.length).toBe(3);

        var $li1 = $lis.eq(0);
        var $li2 = $lis.eq(1);
        var $li3 = $lis.eq(2);

        expect($li1.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li1.attr('data-idx')).toBe('0');
        expect($li1.html()).toBe('foo');

        expect($li2.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li2.attr('data-idx')).toBe('1');
        expect($li2.html()).toBe('bar');

        expect($li3.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li3.attr('data-idx')).toBe('2');
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
        expect($li1.html()).toBe('1');

        expect($li2.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li2.attr('data-idx')).toBe('1');
        expect($li2.html()).toBe('2');

        expect($li3.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li3.attr('data-idx')).toBe('2');
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
        expect($li1.html()).toBe('foo called');

        expect($li2.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li2.attr('data-idx')).toBe('1');
        expect($li2.html()).toBe('bar called');

        expect($li3.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li3.attr('data-idx')).toBe('2');
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
        expect($li1.html()).toBe('foo');

        expect($li2.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li2.attr('data-idx')).toBe('1');
        expect($li2.html()).toBe('bar');

        expect($li3.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li3.attr('data-idx')).toBe('2');
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
        expect($li1.html()).toBe('foo');

        expect($li2.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li2.attr('data-idx')).toBe('1');
        expect($li2.html()).toBe('bar');

        expect($li3.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li3.attr('data-idx')).toBe('2');
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
        expect($li1.html()).toBe('foo');

        expect($li2.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li2.attr('data-idx')).toBe('1');
        expect($li2.html()).toBe('');

        expect($li3.hasClass('jq-autocomplete-item')).toBe(true);
        expect($li3.attr('data-idx')).toBe('2');
        expect($li3.html()).toBe('');
      });
    });

    describe("Check Fetching", function() {
      beforeEach(function() {
        this.fakeAjax = {
          abort: jasmine.createSpy('abort'),
          done: jasmine.createSpy('done')
        };

        this.timer = {};

        spyOn($, 'ajax').andReturn(this.fakeAjax);
        spyOn(window, 'clearTimeout');
        spyOn(window, 'setTimeout').andReturn(this.timer);

        spyOn(this.autocomplete, 'show');
      });

      it("should not fetch if filter does not change", function() {
        this.autocomplete.filter = 'foo';
        this.autocomplete.fetch('foo');

        expect(window.setTimeout).not.toHaveBeenCalled();
        expect($.ajax).not.toHaveBeenCalled();
        expect(this.autocomplete.$ul.show).toHaveBeenCalled();
      });

      it("should not fetch and not display result if filter does not change and item is already selected", function() {
        this.autocomplete.item = 'foo';
        this.autocomplete.filter = 'foo';
        this.autocomplete.fetch('foo');

        expect(window.setTimeout).not.toHaveBeenCalled();
        expect($.ajax).not.toHaveBeenCalled();
        expect(this.autocomplete.$ul.show).not.toHaveBeenCalled();
      });

      it("should fetch results", function() {
        var fn = jasmine.createSpy('fn');
        this.autocomplete.opts.unSelect = fn;

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

        expect(this.fakeAjax.abort).not.toHaveBeenCalled();
        expect(this.fakeAjax.done).toHaveBeenCalledWith(jasmine.any(Function));
        expect(this.autocomplete.show).not.toHaveBeenCalled();

        this.fakeAjax.done.argsForCall[0][0](['foo']);
        expect(this.autocomplete.timer).toBe(null);
        expect(this.autocomplete.xhr).toBe(null);
        expect(this.autocomplete.show).toHaveBeenCalledWith(['foo']);
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
        expect(this.fakeAjax.abort).not.toHaveBeenCalled();

        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
        expect(this.autocomplete.timer).toBeDefined();
      });

      it("should abort current timeout and current request if a new is coming", function() {
        this.autocomplete.xhr = this.fakeAjax;
        this.autocomplete.timer = this.timer;
        this.autocomplete.fetch('foo');

        expect(window.clearTimeout).toHaveBeenCalledWith(this.timer);
        expect(this.fakeAjax.abort).toHaveBeenCalled();

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

        spyOn(this.keyupEvent, 'preventDefault');
        spyOn(this.keyupEvent, 'stopPropagation');

        spyOn(this.autocomplete, 'highlight');
        spyOn(this.autocomplete, 'select');
        spyOn(this.autocomplete, 'fetch');
        spyOn(this.autocomplete, 'clear');
        spyOn(this.autocomplete, 'autoSelect');

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
        this.keyupEvent.keyCode = 13;
        this.autocomplete.$input.trigger(this.keyupEvent);
        expect(this.autocomplete.$input.focus).toHaveBeenCalled();
      });

      it("should show last results on focus", function() {
        this.autocomplete.results = ['foo', 'bar', 'quix'];
        this.autocomplete.$input.trigger(this.focusin);

        expect(this.autocomplete.focus).toBe(true);
        expect(this.autocomplete.$ul.show).toHaveBeenCalled();
      });

      it("should not show last results on focus if an item is already selected", function() {
        this.autocomplete.results = ['foo', 'bar', 'quix'];
        this.autocomplete.item = 'foo';
        this.autocomplete.$input.trigger(this.focusin);

        expect(this.autocomplete.focus).toBe(true);
        expect(this.autocomplete.$ul.show).not.toHaveBeenCalled();
      });

      it("should not show last results if no results are known", function() {
        this.autocomplete.results = [];
        this.autocomplete.$input.trigger(this.focusin);

        expect(this.autocomplete.focus).toBe(true);
        expect(this.autocomplete.$ul.show).not.toHaveBeenCalled();
      });

      it("hide results on focusout", function() {
        this.autocomplete.$input.val('foo');
        this.autocomplete.$input.trigger(this.focusout);

        expect(this.autocomplete.focus).toBe(false);
        expect(this.autocomplete.$ul.hide).not.toHaveBeenCalled();
        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);

        window.setTimeout.argsForCall[0][0]();
        expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
        expect(this.autocomplete.autoSelect).toHaveBeenCalledWith('foo');
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