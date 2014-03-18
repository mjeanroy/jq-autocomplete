(function(angular, $) {

  'use strict';

  var module = angular.module('jqAutoComplete', []);

  module.directive('jqAutocomplete', function() {
    return {
      restrict: 'EA',
      link: function(scope, tElement, tAttrs) {
        var $input = angular.element(tElement).find('input');

        var opts = angular.extend(tAttrs, {
          transformResults: function(data) {
            var results = scope.transformResults({
              $results: data
            });
            return angular.isDefined(results) ? results : data;
          },
          onShown: function() {
            scope.$apply(function() {
              scope.onShown();
            });
          },
          onHidden: function() {
            scope.$apply(function() {
              scope.onHidden();
            });
          },
          select: function(obj) {
            scope.$apply(function() {
              scope.ngModel = obj;
              scope.ngChange();
            });
          },
          unSelect: function() {
            scope.$apply(function() {
              scope.ngModel = undefined;
              scope.ngChange();
            });
          }
        });

        $input.jqAutoComplete(opts);
      },
      scope: {
        ngModel: '=',
        ngChange: '&',
        onShown: '&',
        onHidden: '&',
        transformResults: '&'
      },
      template: function() {
        return '' +
          '<span>' +
          '  <input type="text" />' +
          '</span>';
      },
      replace: true
    };
  });

})(angular, jQuery);
