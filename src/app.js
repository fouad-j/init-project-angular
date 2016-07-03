let app = angular.module('app', ['ui.router']);

app
  .constant('URL_BACKEND', 'http://test.dev/app')
  .config(function($urlRouterProvider) {
    // For any unmatched url
    $urlRouterProvider.otherwise('/home');
  });
