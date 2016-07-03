app
  .directive('headerApp', function() {
    return {
      restrict: 'A',
      templateUrl: 'directives/header/header.html',
      scope: {
        nameproject: '@nameproject'
      },
      controller: 'headerAppController as headerAppCtrl'
    };
  })
  .controller('headerAppController', function($scope) {
  });
