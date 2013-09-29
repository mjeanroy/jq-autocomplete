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
      label: 'label',
      minSize: 3,
      method: 'GET',
      limit: 10,
      filterName: 'filter',
      limitName: 'limit',
      datas: null
    });
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

    it("should add relative position to parent", function() {
      // Check parent has relative position
      expect(this.$fixtures.css('position')).toBe('relative');
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
    });

    it("should clear results and hide results list", function() {
      this.autocomplete.idx = 0;
      this.autocomplete.results = [
        { id: 1, label: 'foo' },
        { id: 2, label: 'bar' }
      ];
      this.autocomplete.item = this.autocomplete.results[0];

      this.autocomplete.clear();
      expect(this.autocomplete.$input.val).not.toHaveBeenCalled();

      expect(this.autocomplete.$ul.hide).toHaveBeenCalled();
      expect(this.autocomplete.$ul.empty).toHaveBeenCalled();

      expect(this.autocomplete.results).toEqual([]);
      expect(this.autocomplete.idx).toBe(-1);
      expect(this.autocomplete.item).toBe(null);
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

      it("should fetch results", function() {
        this.autocomplete.fetch('foo');

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

    describe("Check Keydow/Keypress Events", function() {
      beforeEach(function() {
        this.e = jQuery.Event('keydown');
        spyOn(this.e, 'preventDefault');
        spyOn(this.e, 'stopPropagation');
        spyOn(this.autocomplete, 'highlight');
      });

      it("should set focus if enter key is pressed", function() {
        var e = jQuery.Event('keyup');
        e.keyCode = 13;
        this.autocomplete.$input.trigger(e);
        expect(this.autocomplete.$input.focus).toHaveBeenCalled();
      });

      it("should highlight first item if arrow down is pressed and current idx is -1", function() {
        this.e.keyCode = 40;
        this.autocomplete.$input.trigger(this.e);

        expect(this.e.preventDefault).toHaveBeenCalled();
        expect(this.e.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(0);
      });

      it("should highlight second item if arrow down is pressed and current idx is 0", function() {
        this.e.keyCode = 40;
        this.autocomplete.idx = 0;
        this.autocomplete.$input.trigger(this.e);

        expect(this.e.preventDefault).toHaveBeenCalled();
        expect(this.e.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(1);
      });

      it("should highlight third item if arrow down is pressed and current idx is 1", function() {
        this.e.keyCode = 40;
        this.autocomplete.idx = 1;
        this.autocomplete.$input.trigger(this.e);

        expect(this.e.preventDefault).toHaveBeenCalled();
        expect(this.e.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(2);
      });

      it("should highlight first item if arrow down is pressed and current idx is 2", function() {
        this.e.keyCode = 40;
        this.autocomplete.idx = 2;
        this.autocomplete.$input.trigger(this.e);

        expect(this.e.preventDefault).toHaveBeenCalled();
        expect(this.e.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(3);
      });

      it("should highlight last item if arrow up is pressed and current idx is -1", function() {
        this.e.keyCode = 38;
        this.autocomplete.$input.trigger(this.e);

        expect(this.e.preventDefault).toHaveBeenCalled();
        expect(this.e.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(-2);
      });

      it("should highlight second item if arrow up is pressed and current idx is 2", function() {
        this.e.keyCode = 38;
        this.autocomplete.idx = 2;
        this.autocomplete.$input.trigger(this.e);

        expect(this.e.preventDefault).toHaveBeenCalled();
        expect(this.e.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(1);
      });

      it("should highlight first item if arrow down is pressed and current idx is 1", function() {
        this.e.keyCode = 38;
        this.autocomplete.idx = 1;
        this.autocomplete.$input.trigger(this.e);

        expect(this.e.preventDefault).toHaveBeenCalled();
        expect(this.e.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(0);
      });

      it("should highlight last item if arrow down is pressed and current idx is 0", function() {
        this.e.keyCode = 38;
        this.autocomplete.idx = 0;
        this.autocomplete.$input.trigger(this.e);

        expect(this.e.preventDefault).toHaveBeenCalled();
        expect(this.e.stopPropagation).toHaveBeenCalled();
        expect(this.autocomplete.highlight).toHaveBeenCalledWith(-1);
      });
    });
  });
});