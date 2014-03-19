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
