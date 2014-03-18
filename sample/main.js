(function($, angular) {

  var $choice = $('#js-choice');

  // Initialize first auto complete
  $('#js-initialization').jqAutoComplete({
    url: '/search',
    saveUrl: '/frameworks',
    minSize: 3,
    label: 'label',
    $createForm: '.form-creation',
    select: function(obj) {
      $choice.html(obj.label);
    },
    unSelect: function() {
      $choice.empty();
    }
  });

  // Bootstrap autocomplete initialized with data-* attributes
  $('#html-initialization').jqAutoComplete();

  // Initialize github autocomplete
  $('#jsonp-autocomplete').jqAutoComplete({
    transformResults: function(data) {
      return data.data.items;
    }
  });

  // Bind remove click
  $('#btn-remove').on('click', function() {
    $('#js-initialization').remove();

    // Clear sizzle form cache (size of cache is one, so it will remove form entries)
    $('button[type!="submit"]');
  });

  // AngularJS Controller
  angular.module('jqAutoComplete').controller('Ctrl', ['$scope', function($scope) {
    $scope.repository = null;

    $scope.label = 'name';

    $scope.onShown = function() {
      console.log('on shown');
    };

    $scope.onHidden = function() {
      console.log('on hidden');
    };

    $scope.transform = function(results) {
      return results.items;
    };
  }]);

})(jQuery, angular);