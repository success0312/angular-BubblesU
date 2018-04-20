'use strict';
app.factory('authService', ['$http', '$q', 'localStorageService', 'ngAuthSettings', function ($http, $q, localStorageService, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var authServiceFactory = {};

    var _authentication = {
        isAuth: false,
        userName: "",
        role: ""
    };

    var _externalAuthData = {
        provider: "",
        userName: "",
        externalAccessToken: "",
        role:""
    };

    var _saveRegistration = function (registration) {

        _logOut();

        return $http.post(serviceBase + 'api/account/register', registration).then(function (response) {
            return response;
        })

    };

    var _login = function (loginData) {
        var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;

        var deferred = $q.defer();

        var request = {
            method: 'POST',
            url: serviceBase + 'token',
            data: data
        };
        $http( request ).then(
            //success
            function( response ){
                localStorageService.set(
                    'authorizationData',
                    {
                        token: response.data.access_token,
                        userName: loginData.userName,
                        role: response.roles
                    }
                );
                _authentication.role = response.data.roles;
                _authentication.isAuth = true;
                _authentication.userName = loginData.userName;
            },
            //error
             function( response ){
                 _logOut();
                 deferred.reject(response.statusText);
             }
         );

        return deferred.promise;

    };

    var _logOut = function () {

        localStorageService.remove('authorizationData');

        _authentication.isAuth = false;
        _authentication.userName = "";
        _authentication.role = "";

    };

    var _fillAuthData = function () {

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            _authentication.isAuth = true;
            _authentication.userName = authData.userName;
            _authentication.role = authData.role;
        }

    };


    var _obtainAccessToken = function (externalData) {

        var deferred = $q.defer();

        $http.get(
            serviceBase + 'api/account/ObtainLocalAccessToken',
            {
                params: {
                    provider: externalData.provider,
                    externalAccessToken: externalData.externalAccessToken
                }
            })
            .then(
                //success
                function ( response ) {
                    localStorageService.set(
                        'authorizationData',
                        {
                            token: response.data.access_token,
                            userName: response.data.userName,
                            role: response.data.roles
                        }
                    );

                    _authentication.isAuth = true;
                    _authentication.userName = response.data.userName;
                    _authentication.role = response.data.roles;

                    deferred.resolve(response);
                },
                //error
                function ( response ) {
                    _logOut();
                    deferred.reject(response.statusText);
                }
            );

        return deferred.promise;

    };

    var _registerExternal = function (registerExternalData) {

        var deferred = $q.defer();

        $http.post(
            serviceBase + 'api/account/registerexternal',
            registerExternalData
        )
        .then(
            //success
            function (response) {
                localStorageService.set(
                    'authorizationData',
                    {
                        token: response.access_token,
                        userName: response.userName,
                        role:response.roles
                    }
                );

                _authentication.isAuth = true;
                _authentication.userName = response.userName;
                _authentication.role = response.roles;

                deferred.resolve(response);

            },
            //error
            function (response) {
                _logOut();
                deferred.reject(response.statusText);
            }
        );

        return deferred.promise;
    };

    authServiceFactory.saveRegistration = _saveRegistration;
    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.authentication = _authentication;
   // authServiceFactory.refreshToken = _refreshToken;

    authServiceFactory.obtainAccessToken = _obtainAccessToken;
    authServiceFactory.externalAuthData = _externalAuthData;
    authServiceFactory.registerExternal = _registerExternal;

    return authServiceFactory;
}]);
