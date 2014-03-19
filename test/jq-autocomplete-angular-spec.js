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

describe("jQuery AutoComplete Angular Test Suite", function() {

  beforeEach(angular.mock.module('jqAutoComplete'));

  beforeEach(inject(function($compile, $timeout, $rootScope) {
    this.$compile = $compile;
    this.$timeout = $timeout;
    this.$rootScope = $rootScope;
    this.$scope = $rootScope.$new();

    this.$scope.onChange = jasmine.createSpy('onChange');
    this.$scope.onShown = jasmine.createSpy('onShown');
    this.$scope.onHidden = jasmine.createSpy('onHidden');
    this.$scope.onSelection = jasmine.createSpy('onSelection');
    this.$scope.onDestroyed = jasmine.createSpy('onDestroyed');
    this.$scope.transformResults = jasmine.createSpy('transformResults').andCallFake(function(data) {
      return data.data;
    });

    this.$scope.label = 'name';
    this.$scope.model = {
      item: null
    };

    var defaults = $.fn.jqAutoComplete.options;
    spyOn($.fn, 'jqAutoComplete').andCallThrough();

    $.fn.jqAutoComplete.options = defaults;
  }));

  describe("Directive Initialization", function() {

    it("should compile dom object and generate autocomplete with attributes values", function() {
      // GIVEN
      var inputText = '' +
        '<input' +
        ' type="text"' +
        ' data-ng-model="foo"' +
        ' data-ng-change="onChange()"' +

        ' data-jq-autocomplete' +
        ' data-url="/foo"' +
        ' data-label="{{label}}"' +
        ' />';

      var fixtures = '<div>' + inputText + '</div>';

      // WHEN
      var element = this.$compile(fixtures)(this.$scope);

      // THEN
      expect($.fn.jqAutoComplete).toHaveBeenCalledWith({
        url: '/foo',
        label: 'name',
        parseHtml: false,
        onDestroyed: jasmine.any(Function),
        transformResults: jasmine.any(Function),
        onShown: jasmine.any(Function),
        onHidden: jasmine.any(Function),
        select: jasmine.any(Function),
        unSelect: jasmine.any(Function)
      });
    });

    it("should compile dom object and generate autocomplete with attributes values", function() {
      // GIVEN
      var inputText = '' +
        '<input' +
        ' type="text"' +
        ' data-ng-model="foo"' +
        ' data-ng-change="onChange()"' +

        ' data-jq-autocomplete="{url: \'/foo\', label: \'name\'}"' +
        ' />';

      var fixtures = '<div>' + inputText + '</div>';

      // WHEN
      var element = this.$compile(fixtures)(this.$scope);

      // THEN
      expect($.fn.jqAutoComplete).toHaveBeenCalledWith({
        url: '/foo',
        label: 'name',
        parseHtml: false,
        onDestroyed: jasmine.any(Function),
        transformResults: jasmine.any(Function),
        onShown: jasmine.any(Function),
        onHidden: jasmine.any(Function),
        select: jasmine.any(Function),
        unSelect: jasmine.any(Function)
      });
    });
  });

  describe('Directive', function() {
    beforeEach(function() {
      var inputText = '' +
        '<input' +
        ' type="text"' +
        ' data-ng-model="foo"' +
        ' data-ng-change="onChange()"' +

        ' data-jq-autocomplete' +
        ' data-url="/foo"' +
        ' data-label="{{label}}"' +
        ' data-jq-ac-selected="model.item"' +
        ' data-jq-ac-on-shown="onShown()"' +
        ' data-jq-ac-on-hidden="onHidden()"' +
        ' data-jq-ac-on-selection="onSelection($value)"' +
        ' data-jq-ac-on-destroyed="onDestroyed()"' +
        ' data-jq-ac-transform-results="transformResults($results)"' +
        ' />';

      var fixtures = '<div>' + inputText + '</div>';

      this.element = this.$compile(fixtures)(this.$scope);
      this.input = this.element.find('input');

      this.opts = $.fn.jqAutoComplete.mostRecentCall.args[0];
    });

    it("should trigger ngChange function when keyup event is triggered", function() {
      // GIVEN
      this.$scope.onChange.reset();

      // WHEN
      this.input.val('foo');
      this.input.trigger('input');

      // THEN
      expect(this.$scope.onChange).toHaveBeenCalled();
      expect(this.$scope.foo).toBe('foo');
    });

    it("should trigger onShown function when results are displayed", function() {
      // GIVEN
      this.$scope.onShown.reset();

      // WHEN
      this.opts.onShown();

      // THEN
      expect(this.$scope.onShown).toHaveBeenCalled();
    });

    it("should trigger onHidden function when results are hidden", function() {
      // GIVEN
      this.$scope.onHidden.reset();

      // WHEN
      this.opts.onHidden();

      // THEN
      expect(this.$scope.onHidden).toHaveBeenCalled();
    });

    it("should trigger onSelection function when a result is selected", function() {
      // GIVEN
      var value = 'foobar';
      var selection = {
        id: 1,
        name: value
      };

      this.input.val(value);
      this.$scope.onChange.reset();
      this.$scope.onSelection.reset();

      // WHEN
      this.opts.select(selection);
      this.$timeout.flush();
      this.$scope.$apply();

      // THEN
      expect(this.$scope.model.item).toEqual(selection);
      expect(this.$scope.onSelection).toHaveBeenCalledWith(value);
      expect(this.$scope.onChange).toHaveBeenCalled();
    });

    it("should trigger onSelection function when current result is un-selected", function() {
      // GIVEN
      var value = 'foobar';
      this.input.val(value);
      this.$scope.model.item = {
        id: 1,
        name: 'foobar'
      };

      this.$scope.onChange.reset();
      this.$scope.onSelection.reset();

      // WHEN
      this.opts.unSelect();
      this.$timeout.flush();
      this.$scope.$apply();

      // THEN
      expect(this.$scope.onSelection).toHaveBeenCalledWith(value);
      expect(this.$scope.onChange).toHaveBeenCalled();
    });

    it("should trigger onDestroyed function when autocomplete is destroyed", function() {
      // GIVEN
      this.$scope.onDestroyed.reset();

      // WHEN
      this.opts.onDestroyed();

      // THEN
      expect(this.$scope.onDestroyed).toHaveBeenCalled();
    });

    it("should trigger transformResults function when results are available", function() {
      // GIVEN
      var results = {
        data: [
          { id: 1, name: 'foo' },
          { id: 2, name: 'bar' }
        ]
      };

      this.$scope.transformResults.reset();

      // WHEN
      var customResults = this.opts.transformResults(results);

      // THEN
      expect(this.$scope.transformResults).toHaveBeenCalledWith(results);
      expect(customResults).toEqual(results.data);
    });
  });
});
