var app = angular.module(
	'App',
	[//'ui.router',
    'ngRoute',
	'ngResource',
	'App.apiKeyService',
	'App.homeController',
	'App.homeService',
	'App.indexService',
	'App.storageService',
	'App.userService',
	'angular.filter',
	'angular-owl-carousel',
	'LocalStorageModule',
	'ngMaterial',
	'ngAnimate',
	'ngAria',
	'ngMdIcons',
	'ngMap',
	'ui.bootstrap',
	'angulartics',
	'angulartics.google.analytics']
);

app.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/pages/terms-of-use', {
        templateUrl: "/app/views/partials/terms-of-use.html"
      })
	  .when('/pages/parents', {
		  templateUrl: "/app/views/partials/parents.html"
	  })
      .when('/pages/privacy', {
        templateUrl: "/app/views/partials/privacy.html"
      })
      .when('/pages/support', {
        templateUrl: "/app/views/partials/support.html"
      })
      .when('/user/my-account', {
        controller: "accountController as accountVm",
        templateUrl: "/app/views/account/index.html"
      })
      .when('/user/bulletin', {
        controller: "bulletinController as bulletinVm",
        templateUrl: "/app/views/bulletin/index.html"
      })
      .when('/user/reset', {
        controller: "ResetPasswordController as resetVm",
        templateUrl: "/app/views/partials/reset.html"
      })
	  .when('/user/activate', {
	  })
      .when('/:character', {
        controller: "homeIndexController",
        controllerAs: 'homeVm',
        templateUrl: "/app/views/home/index.html"
      })
      .when('/:character/:section', {
        controller: "homeIndexController",
        controllerAs: 'homeVm',
        templateUrl: "/app/views/home/index.html"
      })
      .otherwise({
        redirectTo: '/bubblesu',
      });

    // You can add this in production to make links without dash
    //$locationProvider.html5Mode(true);
}]);

app.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['**']);
});

app.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('deep-purple')
      .accentPalette('amber')
      .warnPalette('red')
    .backgroundPalette('grey');
});


app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

app.config(function(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('bubblesu');
});

//var serviceBase = 'https://localhost/';
var serviceBase = 'https://api.bubblesu.com/';
var clientId = 'consoleApp';
app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: clientId
});
// how long to keep local storage before refreshing
// default 3600000 - 1 hour
// 600000 - 10 minutes
app.constant('STORAGE_MAX_AGE', 3600000);


app.directive('initSlider', function () {
    return function (scope, element, attrs) {

        if (scope.$last) {
            initSlider(element.closest('.owl_slider'))
        }
    };
});

app.directive('initColorSliders', function () {
    return function (scope, element, attrs) {
        if (scope.$last) {
            initColorSliders();

        }
    };
});

app.directive('sunrotate', function() {
    return function($scope, $element, $attributes) {
        var date = new Date();
        var time = date.getHours() + date.getMinutes() / 60;
        // Sun rotation between 4am to 8pm, aprox. daylight is 16h
        // Rotation is done between -100 and +40 deg (diff 140 deg)
        var degrees = 40 - 140 / 16 * (time - 4);

        $element.css({
            '-webkit-transform': 'rotate(' + degrees + 'deg)',
            '-ms-transform': 'rotate(' + degrees + 'deg)',
            'transform': 'rotate(' + degrees + 'deg)',
        });
    }
});

app.directive('pullTab', ['$timeout', function($timeout) {
    return function(scope, element) {
        element[0].addEventListener(
            'touchstart',
            function(e) {
                element.parent().addClass('pulled');
                $timeout(function(){
                    element.parent().removeClass('pulled');
                }, 5000);
                return false;
            },
            false
        );
        element.on('mousedown', function(e){
            element.on('mousemove', function(e){
                element.parent().addClass('pulled');
                $timeout(function(){
                    element.parent().removeClass('pulled');
                }, 5000);
                element.off('mousemove');
            });
        });
    }
}]);

app.directive("scrollClass", function($window){
    return {
        scope: {},
        restrict: 'A',
        link: function(scope, element, attr){
            var w = angular.element($window);

            w.bind('scroll', function(){
                var bottom = element[0].getBoundingClientRect().top + $window.pageYOffset + element[0].clientHeight + attr.scrollOffset;
                if ($window.pageYOffset + $window.innerHeight >= bottom && $window.pageYOffset - $window.innerHeight <= bottom){
                    if (!element.hasClass(attr.scrollClass)) {
                        element.addClass(attr.scrollClass);
                    }
                } else if(element.hasClass(attr.scrollClass)) {
                    element.removeClass(attr.scrollClass);
                }
            });
        }
    };
});

app.config(['$provide', function($provide) {
	$provide.decorator('$log', ['$delegate', 'Logging', function($delegate, Logging) {
		Logging.enabled = true;
		function error() {
			if ( Logging.enabled === true ) {
				$delegate.error.apply( $delegate, arguments );
				Logging.error.apply( null, arguments );
			}
		}

		function log() {
			if ( Logging.enabled === true ) {
				$delegate.log.apply( $delegate, arguments );
				Logging.log.apply( null, arguments );
			}
		}

		function info() {
			if ( Logging.enabled === true ) {
				$delegate.info.apply( $delegate, arguments );
				Logging.info.apply( null, arguments );
			}
		}

		function warn() {
			if ( Logging.enabled === true ) {
				$delegate.warn.apply( $delegate, arguments );
				Logging.warn.apply( null, arguments );
			}
		}

		return {
			error: error,
			log: log,
			info: info,
			warn: warn
		};
	}]);
}]);

app.service('Logging', function($injector) {
	var service = {
		error: function() {
			self.type = 'error';
			log.apply(self, arguments);
		},
		warn: function() {
			self.type = 'warn';
			log.apply(self, arguments);
		},
		info: function() {
			self.type = 'info';
			log.apply(self, arguments);
		},
		log: function() {
			self.type = 'log';
			log.apply(self, arguments);
		},
		enabled: false,
		logs: []
	};

	function log() {
		var args = [];
		if ( typeof arguments === 'object' ) {
			for ( var i = 0; i < arguments.length; i++ ) {
				var arg = arguments[i];
				args.push( arg );
			}
		}

		var eventLogDateTime = new Date().toString();
		var logItem = {
			time: eventLogDateTime,
			message: JSON.stringify(args),
			type: type
		};


		service.logs.push(logItem);
		$.ajax({
			type: "POST",
			url: "https://api.bubblesu.com/api/log.json",
			contentType: "application/json",
			data: angular.toJson(logItem)
		});
	}
	return service;
});

app.factory('httpInterceptor', function ($q, $rootScope, $log) {

    var numLoadings = 0;

    return {
        request: function (config) {

            numLoadings++;

            // Show loader
            $rootScope.$broadcast('loader_show');
            return config || $q.when(config);

        },
        response: function (response) {

            if ((--numLoadings) === 0) {
                // Hide loader
                $rootScope.$broadcast('loader_hide');
            }

            return response || $q.when(response);

        },
        responseError: function (response) {

            if (!(--numLoadings)) {
                // Hide loader
                $rootScope.$broadcast('loader_hide');
            }

            return $q.reject(response);
        }
    };
})
.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
});

app.filter('parseDate', function() {
    return function(input){
        var inputSlash = input.replace(/-/g,'/');
        return new Date(inputSlash);
    };
});

app.run(['authService', function (authService) {
    authService.fillAuthData();
}]);

app.run(function($rootScope){
    $rootScope.hideLoader = false;
	// browser detection via user agent
	$rootScope.ua = detect.parse(navigator.userAgent);

});

app.run(function($location, ApiKey){
	if ( $location.path() === '/user/activate' && $location.search().key !== undefined ){
		var key = angular.copy($location.search().key);
		ApiKey.saveApiKey(key);
		$location.path('/');
	}
});
