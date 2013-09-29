/**
 *
 */

describe("jQuery AutoComplete Test Suite", function() {

  beforeEach(function() {
    this.$fixtures = $('<div><input type="text" /></div>');
    this.$input = this.$fixtures.find('input');
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
      label: 'label'
    });
  });

  describe("Check Behavior of AutoComplete", function() {
    beforeEach(function() {
      spyOn($.fn, 'offset').andReturn({
        left: 100,
        top: 50
      });

      spyOn($.fn, 'outerWidth').andReturn(30);
      spyOn($.fn, 'outerHeight').andReturn(20);
      spyOn($.fn, 'on').andCallThrough();
      spyOn($.fn, 'focus').andCallThrough();

      this.$input.jqAutoComplete({
        url: '/search'
      });

      this.autocomplete = this.$input.data('jqAutoComplete');
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
      expect(this.autocomplete.$input.on).toHaveBeenCalledWith('keyup', jasmine.any(Function));
    });

    it("should set focus if enter key is pressed", function() {
      var e = jQuery.Event('keyup');
      e.keyCode = 13;
      this.autocomplete.$input.trigger(e);

      expect(this.autocomplete.$input.focus).toHaveBeenCalled();
    });
  });
});