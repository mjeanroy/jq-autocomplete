(function(angular, $, window) {

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

})(angular, jQuery, window);
