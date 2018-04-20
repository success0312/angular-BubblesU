(function(){
    'use strict';

    angular.module('App.homeController', [])
    .controller('homeIndexController', function ($animate, $scope, $rootScope, $location, $filter, $routeParams, $window, $mdDialog, $uibModal, Home, localStorageService, Storage, $log, ApiKey, User, $timeout) {
        var self = this;
        self.guestHomeData = null;
        self.userHomeData = null;
        self.filtered = null;
        self.userId = null;
        self.activeVideo = null;
        self.hashName = null;
        self.character = null;
        //self.btnState = true;        
        self.isLoggedIn = ApiKey.isLoggedIn();
        $rootScope.character = null;
        // enable animations
        $animate.enabled(true);

        if ($routeParams.character === "" || $routeParams.character === "loginsuccess" || $routeParams.character === "logoutsuccess") {
            self.character = 'bubblesu';
            self.characterState = 'bubblesu';
            $rootScope.character = 'bubblesu';
        } else {
            self.character = $routeParams.character;
            self.characterState = $routeParams.character;
            $rootScope.character =  $routeParams.character;
        }
        if ($routeParams.section) {
            $rootScope.profileState = false;
            $animate.enabled(false);
            $timeout(function(){
                var $target = $('#'+$routeParams.section);
                if ($target.offset() != undefined) {
                    $("body,html").animate({scrollTop: $target.offset().top}, "slow");
                }
            }, 0);
        }

        if ( ApiKey.getApiKey() === false ) {
            var promise = Home.getGuestFilteredData();
            promise.then( function( filteredData ) {
                setFilteredData(filteredData);
                self.activeVideo = self.filtered.App[0];
                // start signup nag coundown
                if ( $scope.index.signupNag === null ) {
                    $scope.index.startSignupNag();
                }
            });
        } else {
            User.getUser().then(
                function ( userData ) {
                    self.userId = userData[1];
                    Home.getUserFilteredData( self.userId ).then(
                        function( filteredData ) {
                            setFilteredData(filteredData);
                            self.activeVideo = self.filtered.App[0];
                        },
                        function ( error ) {
                            $log.error(error);
                            Home.getGuestFilteredData().then( function(filteredData) {
                                setFilteredData(filteredData);
                            });
                        }
                    );
                }
            );
        }
        self.setActiveVideo = function (ev, ob) {
            self.activeVideo = ob;
        };

        self.openKidsMagLinkModal = function (ev) {
            var modalInstance = $uibModal.open({
                templateUrl: 'kidsMagModal.html',
                windowClass: 'kids-mag-modal',
                controller: 'KidsMagModalInstanceCtrl as kidsMagVm'
            });
        };

        self.charaterLoad = function(){
            $location.path($rootScope.characterChangeName);
            $rootScope.btnState = false;
            $rootScope.characterload = true;
            $timeout(function(){
                $rootScope.characterload = false;
            }, 1000);
           
        };


/*        $scope.$watch("homeVm.character", function(newVal, oldVal){
            $rootScope.characterChangeName = newVal;
            if(newVal == self.characterState){
                $rootScope.btnState = false;
            }
            else if(newVal != oldVal && oldVal == undefined){
                $rootScope.btnState = false;
            }
            else if(newVal != oldVal && oldVal != undefined){
                $rootScope.btnState = true;
            }
            else{
                $rootScope.btnState = false;
            }
        }, true); */

        $scope.$on(
            '$routeChangeSuccess',
            function( event, to, from ) {
                self.characterState = to.params.character;
                if (self.characterState === "" || self.characterState === "loginsuccess" || self.characterState === "logoutsuccess") {
                    self.characterState = 'bubblesu';
                }
            }
        );

        $(document).on('input', '#hashName', function() {
            var oldVal = self.character;
            var newVal = angular.element('#hashName').val();
            $scope.$apply(function(){
                $rootScope.characterChangeName = newVal;
                $rootScope.profileState = true;
                if(newVal == self.characterState){
                    $rootScope.btnState = false;
                }

                else if(newVal != oldVal && oldVal == undefined){
                    $rootScope.btnState = false;
                }
                else if(newVal != oldVal && oldVal != undefined){
                    $rootScope.btnState = true;
                }
                else{
                    $rootScope.btnState = false;
                }
            });
        });

        /*angular.element('.spinner-control-right-overlay, .spinner-control-right, .spinner-control-left, .spinner-control-left-overlay').on('click', function () {
            var oldVal = self.character;
            var newVal = angular.element('#hashName').val();
            console.log(angular.element('.spinner-title').text());            
            $scope.$apply(function(){
                $rootScope.characterChangeName = newVal;
                $rootScope.profileState = true;
                if(newVal == self.characterState){
                    $rootScope.btnState = false;
                }

                else if(newVal != oldVal && oldVal == undefined){
                    $rootScope.btnState = false;
                }
                else if(newVal != oldVal && oldVal != undefined){
                    $rootScope.btnState = true;
                }
                else{
                    $rootScope.btnState = false;
                }
            });
        });*/

        function setFilteredData(filteredData) {
            self.filtered = filteredData;
            // get random app index
            self.filtered.randomAppIndex = Math.floor((Math.random() * self.filtered.App.length));
        }

    }).controller('KidsMagModalInstanceCtrl', function ($uibModalInstance) {
        var self = this;
        self.cancel = function() {
             $uibModalInstance.close();
        };
    });
})();



