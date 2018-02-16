'use strict';

angular.module('myquizworkApp')

.controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthFactory', function ($scope, $state, $rootScope, ngDialog, AuthFactory) {

    $scope.loggedIn = false;
    $scope.username = '';
    
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }
        
    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
    };
    
    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
    
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
    
}])

.controller('LoginController', ['$scope', '$state','ngDialog', '$localStorage', 'AuthFactory', function ($scope, $state, ngDialog, $localStorage, AuthFactory) {
    
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe)
            {
                $localStorage.storeObject('userinfo',$scope.loginData);
            }

        AuthFactory.login($scope.loginData);
        /*$scope.$on("login",function(){
            $state.go("app.create");
        })*/
        //$state.go('app.create');
        ngDialog.close();
        
    };
            
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
    };
    
}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);

        AuthFactory.register($scope.registration);
        
        ngDialog.close();

    };
}])


.controller('quizCtrl',['$scope', '$http','QNAFactory',function ($scope, $http,QNAFactory) {
    $scope.quizName = 'data/csharp.js';

    //Note: Only those configs are functional which is documented at: http://www.codeproject.com/Articles/860024/Quiz-Application-in-AngularJs
    // Others are work in progress.
    $scope.defaultConfig = {
        'allowBack': true,
        'allowReview': true,
        'autoMove': false,  // if true, it will move to next question automatically when answered.
        'duration': 0,  // indicates the time in which quiz needs to be completed. post that, quiz will be automatically submitted. 0 means unlimited.
        'pageSize': 1,
        'requiredAll': false,  // indicates if you must answer all the questions before submitting.
        'richText': false,
        'shuffleQuestions': false,
        'shuffleOptions': false,
        'showClock': false,
        'showPager': true,
        'theme': 'none'
    };
    
    $scope.onSelect = function(question,option){
        if (question.QuestionTypeId === 1) {
            console.log("question"+$scope.option);
            question.Options.forEach(function (element) {
                if (element.Id !== option.Id) {
                    element.Selected = false;
                    //question.Answered = element.Id;
                }
            });
        }
    };
    
    $scope.goTo = function (index) {
        if (index > 0 && index <= $scope.totalItems) {
            $scope.currentPage = index;
            $scope.mode = 'quiz';
        }
        
        if ($scope.config.autoMove === true && $scope.currentPage < $scope.totalItems){
            $scope.currentPage++;}
    };

    $scope.onSubmit = function () {
        var answers = [];
        $scope.questions.forEach(function (q) {
            answers.push({ 'QuestionId': q.Id, 'Answered': q.Answered });
        });
        // Post your data to the server here. answers contains the questionId and the users' answer.
        //$http.post('api/Quiz/Submit', answers).success(function (data, status) {
        //    alert(data);
        //});
        console.log($scope.questions);
        $scope.result = 0;
        $scope.questions.forEach(function(question){
            var points = question.points;
            question.options.forEach(function (option) {
            if (toBool(option.Selected) === option.IsAnswer) {
                $scope.result = $scope.result + points;}
            });
            });
        $scope.mode = 'result';
    };

    $scope.pageCount = function () {
        return Math.ceil($scope.questions.length / $scope.itemsPerPage);
    };
    var extend = function (out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;

            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key))
                    out[key] = arguments[i][key];
            }
        }
        return out;
    };
    
    
    $scope.shuffleOptions = function(){
        $scope.questions.forEach(function (question) {
           question.Options = question.Options;//helper.shuffle(question.Options);
        });
    };
    
    QNAFactory.query(
        function (res) {
             $scope.config = $scope.defaultConfig;
            
             $scope.questions = res; //$scope.config.shuffleQuestions ? helper.shuffle(res.data.questions) : res.data.questions;
             $scope.totalItems = $scope.questions.length;
             $scope.itemsPerPage = $scope.config.pageSize;
             $scope.currentPage = 1;
             $scope.mode = 'quiz';
             if($scope.config.shuffleOptions)
             {$scope.shuffleOptions();}
             
             $scope.$watch('currentPage + itemsPerPage', function () {
                 var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
                   var end = begin + $scope.itemsPerPage;

                 $scope.filteredQuestions = $scope.questions.slice(begin, end);
                 console.log($scope.filteredQuestions);
             });

        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });
    //$scope.loadQuiz($scope.quizName);

    /*$scope.isAnswered = function (index) {
        var answered = 'Not Answered';
        $scope.questions[index].Options.forEach(function (element) {
            if (element.Selected === true) {
                answered = 'Answered';
                return false;
            }
        });
        return answered;
    };*/
    
    var toBool = function (val) {
        if (val == 'undefined' || val == null || val == '' || val == 'false' || val == 'False')
            return false;
        else if (val == true || val == 'true' || val == 'True')
            return true;
        else
            return 'unidentified';
    };
    
    $scope.isCorrect = function (question) {
        var result = 0;
        question.Options.forEach(function (option) {
            if (toBool(option.Selected) !== option.IsAnswer) {
                result = result + question.points;
            }
        });
        return result;
    };
}])


.controller('createCtrl', ['$scope', '$http', '$state', '$stateParams', 'QNAFactory',function ($scope, $http, $state, $stateParams, QNAFactory) {
    
    $scope.quizName = '../scripts/emptyQuiz.js';
    $scope.currentPage = 1;
    
    $scope.goTo = function (index) {
        if (index > 0) {
            $scope.currentPage = index;
            $scope.mode = 'quiz';
        }
    };

    $scope.onSelect = function (option) {
        $scope.questions[$scope.currentPage - 1].selected = option;
        $scope.questions[$scope.currentPage - 1].answered = option.Id;
    };
    
    $scope.onSave = function () {
        
        console.log($scope.questions);
        
        QNAFactory.save($scope.questions);

        $state.go($state.current, {}, {reload: true});
        
        //$scope.createQuiz.$setPristine();
        
    };
    
    
    
    $scope.itemsPerPage = 1;

    $scope.pageCount = function () {
        return Math.ceil($scope.questions.length / $scope.itemsPerPage);
    };

    //If you wish, you may create a separate factory or service to call loadQuiz. To keep things simple, i have kept it within controller.
    $scope.loadQuiz = function (file) {
        $http.get(file)
         .then(function (res) {
            console.log(res);
             $scope.questions = res.data.questions;
             $scope.totalItems = $scope.questions.length;
             //$scope.currentPage = 1;
             $scope.mode = 'quiz';
            
             $scope.$watch('currentPage + itemsPerPage', function () {
                 var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
                   end = begin + $scope.itemsPerPage;

                 $scope.filteredQuestions = $scope.questions.slice(begin, end);
             });
         }, function(err){
            console.log(err);
        }
              );
    };
    $scope.loadQuiz($scope.quizName);

    $scope.isAnswered = function (index) {
        var answered = 'Not Answered';
        $scope.questions[index].options.forEach(function (element) {
            if (element.selected === true) {
                answered = 'Answered';
                return false;
            }
        });
        return answered;
    };

    $scope.isCorrect = function (question) {
        var result = 'correct';
        var options = question.options || [];
        options.forEach(function (option) {
            if ($scope.toBool(option.selected) !== option.isAnswer) {
                result = 'wrong';
                return false;
            }
        });
        return result;
    };

    $scope.toBool = function (val) {
        if (val === 'undefined' || val === null || val === '' || val === 'false' || val === 'False'){
            return false;}
        else if (val === true || val === 'true' || val === 'True'){
            return true;}
        else{
            return 'Not Identified';}
    };
  }]);