app
  .config(function($stateProvider) {
    $stateProvider.state('home', {
      url: '/home',
      templateUrl: 'features/home/home.html',
      controller: 'homeController as homeCtrl'
    });
  })
  .controller('homeController', function($scope) {
    $scope.message = "By Fouad.J";
  });

