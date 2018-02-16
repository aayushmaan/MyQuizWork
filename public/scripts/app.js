'use strict';

angular.module('myquizworkApp', ['ui.router','ngResource','ngDialog'])
.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider        
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/login.html',
                        controller  : 'LoginController'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }
                }

            })
        
            
            .state('app.create', {
                url: 'create',
                views: {
                    'content@': {
                        templateUrl : 'views/create.html',
                        controller  : 'createCtrl',
                        requiresAuthentication: true,
                        permissions: ["administration"]
                   }
                }
            })
    
            .state('app.quiz', {
                url: 'quiz',
                views: {
                    'content@': {
                        templateUrl : 'views/quiz.html',
                        controller  : 'quizCtrl'
                   }
                }
            });
    
        $urlRouterProvider.otherwise('/');
    })
;
