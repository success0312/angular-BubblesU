(function(){
    'use strict';

    app.controller(
      'indexController',
      [
        '$analytics',
        '$scope',
        '$rootScope',
        '$location',
        '$mdSidenav',
        '$mdDialog',
        '$mdMedia',
        '$uibModal',
        '$mdToast',
        '$filter',
        '$timeout',
        '$log',
        '$window',
        '$q',
        'Index',
        'localStorageService',
        'Storage',
        'ApiKey',
        'Home',
        'User',
        function ($analytics, $scope, $rootScope, $location, $mdSidenav, $mdDialog, $mdMedia, $uibModal,  $mdToast, $filter, $timeout, $log, $window, $q, Index, localStorageService, Storage, ApiKey, Home, User) {
            var self = this;
            self.allAvatars = null;
            self.firstVisit = true;
            self.muteSounds = null;
            self.referFriendEmail = null;
            self.referFriendSending = false;
            self.showBulletinButton = true;
            self.showCharacterWheel = true;
            self.showRocket = true;
            self.showLandscape = true;
            self.showMyBuddies = false;
            self.showSharingIcons = false; // hide sharing icons until feature is implemented
            self.signupNag = null;
            self.userAvatar = null;
            self.userId = null;
            self.userInfo = null;
            self.userMessages = null;
            $rootScope.animationStatus = 0;
            // hide character wheel on User Account and Bulletin Board Pages
            $scope.$on(
                '$routeChangeStart',
                function(event, to, from){
                    if ( to.params.character != undefined ) {
                        self.showCharacterWheel = true;
                        self.showBulletinButton = true;
                    } else {
                        self.showCharacterWheel = false;
                        self.showMyBuddies = false;
                        self.showBulletinButton = false;
                    }
                    if ( to.$$route != undefined && to.$$route.originalPath === "/user/bulletin" ) {
                        self.showRocket = false;
                    } else {
                        self.showRocket = true;
                    }
                }
            );

            $scope.$on(
                '$routeChangeSuccess',
                function( event, to, from) {
                    if ( to.params.section !== undefined ) {
                        switch ( to.params.section ) {
                            case 'movies':
                                playSoundClip('videoIcon');
                            break;
                            case 'recipes':
                                playSoundClip('recipesIcon');
                            break;
                            case 'games':
                                playSoundClip('gamesIcon');
                            break;
                            case 'music':
                                playSoundClip('musicIcon');
                            break;
                            case 'colorCreate':
                                playSoundClip('colorAndCreateIcon');
                            break;
                            case 'funkyPhonics':
                                playSoundClip('phonicsIcon');
                            break;
                            case 'readingCorner':
                                playSoundClip('readingCornerIcon');
                            break;
                            case 'apps':
                                playSoundClip('happyAppsIcon');
                            break;
                        }
                    }
                }
            );

            /**
             * Toggles the display of My Buddies Dropdown
             */
            self.toggleMyBuddies = function() {
                if ( ApiKey.isLoggedIn() === true ) {
                    self.showMyBuddies = ! self.showMyBuddies;
                } else {
                    self.openSignupModal();
                }
            };

            self.toggleSounds = function() {
                self.muteSounds = Storage.getLocalData('muteSounds');
                if ( self.muteSounds === false ) {
                    self.muteSounds = true;
                    muteSounds();
                    $analytics.eventTrack('Mute Sounds');
                    toastr.info('Sounds muted.');

                } else {
                    self.muteSounds = false;
                    unmuteSounds();
                    toastr.info('Sound enabled.');
                    $analytics.eventTrack('Unmute Sounds');
                }
                Storage.saveLocalData('muteSounds', self.muteSounds);
            };

            self.goToBulletin = function() {
                if ( ApiKey.isLoggedIn() === true ) {
                    $location.path('/user/bulletin');
                    playSoundClip('myBulletinBoardIcon');
                } else {
                    self.openSignupModal();
                }
            };

            self.goToHome = function() {
                $location.path('/bubblesu');
            };

            self.launch = function(obj) {
                var rocket = angular.element(obj.currentTarget);
                $('body,html').animate({scrollTop: 0}, 2000, function() {
                    rocket.removeClass('launch').attr('style', '');
                  }
                );
                // IE fix
                var boundary = rocket[0].getBoundingClientRect();
                console.log(boundary.left);
                var windowWidth = document.documentElement.clientWidth;
                rocket.addClass('launch').css({'margin':0,'left':boundary.left+'px','bottom':boundary.bottom+'px'});
            };

            /**
             * Returns whether or not it is day time
             * @returns {Boolean}
             */
            self.day = function () {
                var currentHour = new Date().getHours();
                var nightStartHour = 20;
                var nightEndHour = 4;
                if ( currentHour >= nightStartHour || currentHour <= nightEndHour ) {
                    return false;
                }
                return true;
            };

            self.startSignupNag = function() {
                // user should only be nagged if they are visiting the site for the first time
                // and they're not logged in. Once they login they should no longer be
                // nagged even if they log out.
                if ( self.firstVisit === true ) {
                    self.firstVisit = false;
                    self.signupNag = $timeout(self.openSignupModal, 20000);
                }
            };

            /**
             * Sends e-mail to a friend
             */
            self.referAFriend = function () {
                $rootScope.hideLoader = true;
                self.referFriendSending = true;
                Index.referAFriend(
                    { APIKey: ApiKey.getApiKey() },
                    { email: self.referFriendEmail },
                    function (promise) {
                        self.referFriendSending = false;
                        self.referFriendEmail = null;
                        toastr.success('Thank you for the referral!');
                        $analytics.eventTrack('Refer-A-Friend');
                        $rootScope.hideLoader = false;
                    },
                    function ( error ) {
                        $log.error( error );
                        toastr.error('Unable to send referral e-mail. Please try again later.' );
                    }
                );

            };

            /**
             * Clear user data
             */
            $scope.logout = function () {
                Storage.clearAllLocalData();
                ApiKey.clearApiKey();
                Home.clearUserHomeData();
                User.clearAllUserData();
                self.allAvatars = null;
                self.muteSounds = null;
                self.referFriendEmail = null;
                self.referFriendSending = false;
                self.showCharacterWheel = true;
                self.showLandscape = true;
                self.showMyBuddies = false;
                self.userAvatar = null;
                self.userId = null;
                self.userInfo = null;
                self.userMessages = null;
                unmuteSounds();
                $analytics.eventTrack('Logout');
                $location.path('/logoutsuccess');

            };

            self.openLoginModal = function (ev, ob) {
                // stop signup nag
                $timeout.cancel(self.signupNag);
                $analytics.eventTrack('Open', {
                    category: 'Login'
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'loginModal.html',
                    controller: 'LoginModalInstanceCtrl as loginVm',
                    windowClass: 'login-modal',
                    resolve: {
                        object: function () {
                            return ob;
                        }
                    }
                });

                modalInstance.result.then(
                    function (selectedItem) {

                    },
                    function () {
                        self.setUser();
                        if ( ApiKey.isLoggedIn() === true ) {
                            $analytics.eventTrack('Login', {
                                label: self.userInfo.User.username
                            });
                        }
                    }
                );
            };

            $scope.login = self.openLoginModal;

            self.openPostLoginModal = function (ev,ob) {
                // stop signup nag
                $timeout.cancel(self.signupNag);
                $analytics.eventTrack('Open', {
                    category: 'Post Login'
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'postLoginModal.html',
                    controller: 'PostLoginModalInstanceCtrl as postLoginVm',
                    scope: $scope,
                    windowClass: 'post-modal',
                    backdrop: 'static',
                    resolve: {
                        object: function() {
                            if ( ob === undefined ) {
                                ob = {};
                            }
                            ob.auto_generated = self.userInfo.User.auto_generated;
                            return ob;
                        }
                    }
                });

                //modalInstance.result.then(function(selectedItem) {}, function(){
                //    self.userInfo.User.need_post_login = false;
                //});
            };

            self.openSignupModal = function (ev, ob) {
                $timeout.cancel(self.signupNag);
                $analytics.eventTrack('Open', {
                    category: 'Signup'
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'signupModal.html',
                    controller: 'SignupModalInstanceCtrl as signupVm',
                    resolve: {
                        object: function () {
                            return ob;
                        },
                        login: function() {
                            return self.openLoginModal;
                        }
                    },
                    windowClass: 'signup-modal'
                });

                modalInstance.result.then(function (selectedItem) {
                }, function () {
                    self.setUser();
                });
            };

            self.openMessagesModal = function (ev, ob) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'messagesModal.html',
                    controller: 'MessagesModalInstanceCtrl as messagesVm',
                    resolve: {
                        object: function () {
                            return ob;
                        }
                    }
                });
            };

            self.cancel = function(){
                 $mdDialog.cancel();
            };

            self.avatarPopover = function(ev) {
                $analytics.eventTrack('Open', {
                    category: 'User Avatar'
                });
               $mdDialog.show({
                 controller: 'DialogController as dialogVm',
                 templateUrl: 'avatar-dialog.html',
                 parent: angular.element(document.body),
                 targetEvent: ev,
                 clickOutsideToClose:false,
                 fullscreen: $mdMedia('sm') && $scope.customFullscreen,
                 locals: {
                     avatars: self.allAvatars,
                     userAvatar: self.userAvatar,
                     apiKey: ApiKey.getApiKey()
                 }
               })
               .then(function(userAvatar) {

                   self.userAvatar = userAvatar;
                   $analytics.eventTrack('Change', {
                       category: 'User Avatar'
                   });

               });



               $scope.$watch(
                   function() {
                       return $mdMedia('sm');
                    }, function(sm) {
                        $scope.customFullscreen = (sm === true);
                    });
            };

            self.confirmLogout = function(ev) {
                var confirm = $mdDialog.confirm();
                confirm.content('Are you sure you want to logout?');
                confirm.title('Logout from BubblesU?');

                confirm.ariaLabel('Logout from BubblesU.com');
                confirm.targetEvent(ev);
                confirm.ok('Logout');
                confirm.cancel('Stay Logged In');
                $mdDialog.show( confirm ).then(function() {
                    $analytics.eventTrack('Logout', {
                        label: self.userInfo.User.username
                    });
                    $scope.logout();
                });
            };

            self.openVideoModal = function (ev, ob) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'videoModal.html',
                    controller: 'HomeModalInstanceCtrl as homeModalVm',
                    windowClass: 'video-modal',
                    resolve: {
                        object: function () {
                            return ob;
                        },
                        isLoggedIn: ApiKey.isLoggedIn(),
                        userId: function() {
                            return self.userId;
                        }
                    }
                });
            };

            self.openAudioModal = function (ev, ob) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'audioModal.html',
                    controller: 'HomeModalInstanceCtrl as homeModalVm',
                    resolve: {
                        object: function () {
                            return ob;
                        },
                        isLoggedIn: ApiKey.isLoggedIn(),
                        userId: function() {
                            return self.userId;
                        }

                    }
                });
            };

            self.openGameModal = function (ev, ob) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'gameModal.html',
                    controller: 'HomeModalInstanceCtrl as homeModalVm',
                    size: 'lg',
                    windowClass: 'game-modal',
                    resolve: {
                        object: function () {
                            return ob;
                        },
                        isLoggedIn: ApiKey.isLoggedIn(),
                        userId: function() {
                            return self.userId;
                        }
                    }
                });
            };

            self.openReadingCornerModal = function (ev, ob) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'readingCornerModal.html',
                    controller: 'HomeModalInstanceCtrl as homeModalVm',
                    resolve: {
                        object: function () {
                            return ob;
                        },
                        isLoggedIn: ApiKey.isLoggedIn(),
                        userId: function() {
                            return self.userId;
                        }
                    }
                });
            };

            self.openRecipesModal = function (ev, ob) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'recipesModal.html',
                    controller: 'HomeModalInstanceCtrl as homeModalVm',
                    resolve: {
                        object: function () {
                            return ob;
                        },
                        isLoggedIn: ApiKey.isLoggedIn(),
                        userId: function() {
                            return self.userId;
                        }
                    },
                    windowClass: 'recipes-modal'
                });
            };


            self.openFunkyPhonicsModal = function (ev, ob) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'funkyPhonicsModal.html',
                    controller: 'HomeModalInstanceCtrl as homeModalVm',
                    resolve: {
                        object: function () {
                            return ob;
                        },
                        isLoggedIn: ApiKey.isLoggedIn(),
                        userId: function() {
                            return self.userId;
                        }
                    },
                    windowClass: 'phonics-modal'
                });
            };

            self.openColorCreateModal = function (ev, ob) {
                ob.interval = 2000;
                ob.items = [];
                var homeData;
                if ( ApiKey.isLoggedIn() === true ) {
                    Home.getUserHomeData().then(
                        function ( data ) {
                            homeData = data;
                            switch (ob.SiteObject.short_name) {
                                case 'coloringPages':
                                    ob.headerImage = '//cdn.bubblesu.com/images/headline/coloringpages-modal-headline.png';
                                    ob.headerImageName = 'Coloring Pages';
                                    angular.forEach(
                                        homeData,
                                        function (item) {                                        
                                            if ( item.SiteObjectType !== undefined && item.SiteObjectType.name === 'coloring_page') {
                                                ob.items.push(item);
                                            }
                                        }
                                    );
                                    break;
                                case 'cutOuts':
                                    ob.headerImage = '//cdn.bubblesu.com/images/headline/cutoutcrafts-modal-headline.png';
                                    ob.headerImageName = 'Cut-out Crafts';
                                    angular.forEach(
                                        homeData,
                                        function (item) {
                                            if ( item.SiteObjectType !== undefined && item.SiteObjectType.name === 'cut_outs' ) {
                                                ob.items.push(item);
                                            }
                                        }
                                    );
                                    break;
                                case 'mazes':
                                    ob.headerImage = '//cdn.bubblesu.com/images/headline/mazes-modal-headline.png';
                                    ob.headerImageName = 'Mazes';
                                    angular.forEach(
                                        homeData,
                                        function (item) {
                                            if ( item.SiteObjectType !== undefined && item.SiteObjectType.name === 'mazes' ) {
                                                ob.items.push(item);
                                            }
                                        }
                                    );
                                    break;
                                case 'puzzles':
                                    ob.headerImage = '//cdn.bubblesu.com/images/headline/puzzles-modal-headline.png';
                                    ob.headerImageName = 'Puzzles';
                                    angular.forEach(
                                        homeData,
                                        function (item) {
                                            if ( item.SiteObjectType !== undefined && item.SiteObjectType.name === 'puzzles' ) {
                                                ob.items.push(item);
                                            }
                                        }
                                    );
                                    break;
                                case 'paperAirplanes':
                                    ob.headerImage = '//cdn.bubblesu.com/images/headline/paper-planes-modal-headline.png';
                                    ob.headerImageName = 'Paper Planes';
                                    angular.forEach(
                                        homeData,
                                        function (item) {
                                            if ( item.SiteObjectType !== undefined && item.SiteObjectType.name === 'paper_airplanes' ) {
                                                ob.items.push(item);
                                            }
                                        }
                                    );
                                    break;
                                default:
                                    break;
                            }

                            var modalInstance = $uibModal.open({
                                templateUrl: 'colorCreateModal.html',
                                controller: 'HomeModalInstanceCtrl as homeModalVm',
                                resolve: {
                                    object: function () {
                                        return ob;
                                    },
                                    isLoggedIn: ApiKey.isLoggedIn(),
                                    userId: function() {
                                        return self.userId;
                                    }
                                }
                            });
                        }
                    );
                } else {
                    Home.getGuestHomeData().then(
                        function ( data ) {
                            homeData = data;
                            switch (ob.SiteObject.short_name) {
                                case 'coloringPages':
                                    ob.headerImage = '//cdn.bubblesu.com/images/headline/coloringpages-modal-headline.png';
                                    ob.headerImageName = 'Coloring Pages';
                                    angular.forEach(
                                        homeData,
                                        function (item) {
                                            if ( item.SiteObjectType !== undefined && item.SiteObjectType.name === 'coloring_page' ) {
                                                ob.items.push(item);
                                            }
                                        }
                                    );
                                    break;
                                case 'cutOuts':
                                    ob.headerImage = '//cdn.bubblesu.com/images/headline/cutoutcrafts-modal-headline.png';
                                    ob.headerImageName = 'Cut-out Crafts';
                                    angular.forEach(
                                        homeData,
                                        function (item) {
                                            if ( item.SiteObjectType !== undefined && item.SiteObjectType.name === 'cut_outs' ) {
                                                ob.items.push(item);
                                            }
                                        }
                                    );
                                    break;
                                case 'mazes':
                                    ob.headerImage = '//cdn.bubblesu.com/images/headline/mazes-modal-headline.png';
                                    ob.headerImageName = 'Mazes';
                                    angular.forEach(
                                        homeData,
                                        function (item) {
                                            if ( item.SiteObjectType !== undefined && item.SiteObjectType.name === 'mazes' ) {
                                                ob.items.push(item);
                                            }
                                        }
                                    );
                                    break;
                                case 'puzzles':
                                    ob.headerImage = '//cdn.bubblesu.com/images/headline/puzzles-modal-headline.png';
                                    ob.headerImageName = 'Puzzles';
                                    angular.forEach(
                                        homeData,
                                        function (item) {
                                            if ( item.SiteObjectType !== undefined && item.SiteObjectType.name === 'puzzles' ) {
                                                ob.items.push(item);
                                            }
                                        }
                                    );
                                    break;
                                case 'paperAirplanes':
                                    ob.headerImage = '//cdn.bubblesu.com/images/headline/paper-planes-modal-headline.png';
                                    ob.headerImageName = 'Paper Planes';
                                    angular.forEach(
                                        homeData,
                                        function (item) {
                                            if ( item.SiteObjectType !== undefined && item.SiteObjectType.name === 'paper_airplanes' ) {
                                                ob.items.push(item);
                                            }
                                        }
                                    );
                                    break;
                                default:
                                    break;
                            }

                            var modalInstance = $uibModal.open({
                                templateUrl: 'colorCreateModal.html',
                                controller: 'HomeModalInstanceCtrl as homeModalVm',
                                resolve: {
                                    object: function () {
                                        return ob;
                                    },
                                    isLoggedIn: ApiKey.isLoggedIn(),
                                    userId: function() {
                                        return self.userId;
                                    }
                                }
                            });
                        }
                    );
                }


            };

            self.setUser = function () {

                if ( ApiKey.getApiKey() !== false ) {

                    // diable signup nag
                    self.firstVisit = false;

                    // set up promises
                    var userPromises = [ User.getUser(), User.getUserAvatar(), User.getUserMessages(), User.getUserSubscriptions(), User.getUserGameActivity()  ];
                    // GET All Avatars
                    if ( Storage.storageSupported === true ) {
                        self.allAvatars = Storage.getLocalData ( 'allAvatars' );
                    }

                    if ( self.allAvatars === false || self.allAvatars === null ) {
                        userPromises.push( Index.getAllAvatars().$promise );
                    }

                    $q.all( userPromises ).then(
                        function( userData ) {
                            self.userInfo = userData[0][0];
                            self.userId = userData[0][1];
                            self.userAvatar = userData[1];
                            self.userMessages = userData[2];
                            if ( userPromises.length === 6 ) {
                                if ( userData[5].Status.OK !== undefined ) {
                                    Storage.saveLocalData( 'allAvatars', userData[5].Status.OK );
                                    self.allAvatars = userData[5].Status.OK;
                                } else {
                                    $log.error( promise.Status.ERROR );
                                }
                            }
                            // check if user has post login flag
                            if( self.userInfo.User.need_post_login === true) {
                                self.openPostLoginModal();
                            }
                        },
                        function ( error ) {
                            $scope.logout();
                        }
                    );
                } else {
                    if ( self.signupNag !== null ) {
                        self.startSignupNag();
                    }
                }
            };


            // set sounds
            if ( Storage.storageSupported === true ) {
                var muteSoundKey = localStorageService.get('muteSounds');
                if ( muteSoundKey !== null ) {
                    self.muteSounds = localStorageService.get('muteSounds').data;
                    if ( self.muteSounds === true ) {
                        muteSounds();
                        toastr.info('Sounds muted.');
                    }
                }
            }

            // Private Functions
            function getIndexByObjectId(needle, haystack) {
                var hLength = haystack.length;
                for( var i = 0; i < hLength; i++ ) {
                    if ( angular.equals(haystack[i].SiteObject.id, needle) ) {
                        return i;
                    }
                }
                return false;
            }

            // Filter
            self.itemFilter = function(item) {
                return false;
            }

            // set user on app load
            self.setUser();


        }
      ]
    )
    .controller('DialogController', function( $scope, Index, Storage, $rootScope, $log, avatars, userAvatar, $mdDialog, apiKey ) {
            var self = this;
            self.avatars = avatars;
            self.message = null;
            self.showLoadingStars = false;
            self.savingAvatar = false;
            self.hasError = false;
            self.requestFailed = false;

            $scope.hide = function() {
                $mdDialog.hide();
            };
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.choose = function(avatarId) {
                $rootScope.hideLoader = true;
                self.showLoadingStars = true;
                self.savingAvatar = true;
                self.message = "Changing Your Avatar...";
                Index.setUserAvatar(
                    {
                        APIKey: apiKey
                    },
                    {
                        'avatar_id': avatarId
                    },
                    function( promise ) {
                        if ( promise.Status.OK !== undefined ) {
                            Index.getUserAvatar(
                               { APIKey: apiKey },
                               function ( promise ) {
                                   $rootScope.hideLoader = false;
                                   self.showLoadingStars = false;
                                   self.message = '';
                                   if ( promise.Status.OK !== undefined ) {
                                       userAvatar = promise.Status.OK.Avatar.image_path;
                                       Storage.saveLocalData( 'userAvatar', userAvatar );
                                       toastr.success('User Avatar Changed!');
                                       $mdDialog.hide(userAvatar);
                                   } else {
                                       $log.error( promise.Status.ERROR );
                                       $mdDialog.hide(userAvatar);
                                   }
                               }
                            );
                        } else {
                            $log.error( promise.Status.ERROR );
                            $rootScope.hideLoader = false;
                            self.showLoadingStars = false;
                            $mdDialog.hide(userAvatar);
                        }
                    },
                    function ( error ) {
                        self.message = 'Unable to change avatar. Please try again later.';
                        $log.error( error );
                        $rootScope.hideLoader = false;
                        self.showLoadingStars = false;
                        self.savingAvatar = false;
                        self.requestFailed = true;
                    }
                );
            };

    })
    .controller(
      'LoginModalInstanceCtrl',
      function (
        $analytics,
        $document,
        $scope,
        $rootScope,
        $uibModalInstance,
        object,
        Index,
        localStorageService,
        Storage,
        $location,
        ApiKey,
        $log ) {
          var self = this;
          self.object = object;
          self.username = null;
          self.password = null;
          self.showLoadingStars = false;
          self.isLoggingIn = false;
          self.loginError = false;
          self.showForgotForm = false;
          self.cancel = function () {
              $uibModalInstance.dismiss('cancel');
          };

          self.revealForgotForm = function() {
            self.showForgotForm = true;
          };

          self.forgotPassword = function(ev) {
                  $rootScope.hideLoader = true;
                  self.showLoadingStars = true;
                  Index.forgotPassword(
                      { email: self.forgotEmail },
                      function( promise ) {
                          $rootScope.hideLoader = false;
                          self.forgotSent = true;
                          self.showLoadingStars = false;
                          if ( promise.Status.OK !== undefined ) {
                              self.forgotSuccess = true;
                              self.forgotMessage = 'Reset Password E-mail successfully sent.';
                              self.forgotEmail = '';
                          } else {
                              $log.error(promise.Status.ERROR);
                              self.forgotSuccess = false;
                              self.forgotMessage = promise.Status.ERROR;
                          }
                      },
                      function( error ) {
                          $rootScope.hideLoader = false;
                          self.forgotSent = true;
                          self.forgotSuccess = false;
                          self.showLoadingStars = false;
                          self.forgotMessage = 'Cannot reset password at this time. Please try again later.';

                      }
                  );
          };

          self.login = function (ev) {
                  self.message = "Logging in";
                  self.isLoggingIn = true;
                  $rootScope.hideLoader = true;
                  self.showLoadingStars = true;
                  self.loginError = false;
                  Index.login(
                    {
                      username: self.username,
                      password: self.password
                    },
                    function ( promise ) {
                      var apiKey = promise.data;
                      if ( apiKey == false ) {
                          $rootScope.hideLoader = false;
                          self.showLoadingStars = false;
                          self.isLoggingIn = false;
                          self.loginError = true;
                          self.message = 'Invalid username or password';
                      }
                      else {
                          $rootScope.hideLoader = false;
                          self.showLoadingStars = false;
                          self.isLoggingIn = false;

                          ApiKey.saveApiKey( apiKey.APIKey );

                          $location.path('/loginsuccess');
                          $uibModalInstance.dismiss('cancel');
                      }
                  },
                  function ( error ) {
                      self.isLoggingIn = false;
                      self.showLoadingStars = false;
                      self.loginError = true;
                      self.message = 'Unable to login. Please try again later';
                      $log.error( error );
                  }
              );
        };
      }
    )
    .controller('PostLoginModalInstanceCtrl',
        function (
            $analytics,
            $log,
            $scope,
            $rootScope,
            $uibModalInstance,
            $timeout,
            ApiKey,
            GeoCoder,
            Index,
            object,
            Storage
        ) {
            var self = this;

            self.center = null;
            self.firstname = null;
            self.isSubmitting = false;
            self.lastname = null;
            self.locations = null;
            self.locationError = false;
            self.password = null;
            self.nameError = false;
            self.nameMessage = null;
            self.email = null;
            self.emailError = false;
            self.emailMessage = null;
            self.howDidYouHear = null;
            self.message = '';
            self.modifyError = false;
            self.otherReferral = null;
            self.password = null;
            self.passwordVerify = null;
            self.passwordError = false;
            self.passwordMessage = null;
            self.promocode = null;
            self.showLoadingStars = false;
            self.username = null;
            self.zipCode = "";
            

            self.showNameFields = object.auto_generated;
            self.showPasswordFields = object.auto_generated;

            self.showLocations = function() {
                if ( self.locations === null ){
                    return false;
                }
                return self.locations.length > 0 && (self.howDidYouHear==="1" || self.howDidYouHear==="34" || self.howDidYouHear==="40");
            };

            $scope.$watch(
                'postLoginVm.howDidYouHear',
                function ( newValue, oldValue ) {
                    //If not a current family, employee or referred by the former
                    //zip code is not required and should be reset
                    if ( newValue !== '1' && newValue !== '34' && newValue !== '40') {
                        self.zipCode = '';
                        self.postForm.zipcode.$setPristine();
                        self.center = null;
                        self.postForm.center.$setPristine();
                    }
                    // if other is not selected, reset
                    if ( newValue !== '27' ) {
                        self.otherReferral = null;
                        self.postForm.otherreferral.$setPristine();
                    }
                    // if promocode is not selected, reset
                    if ( newValue !== '45' ) {
                        self.promocode = null;
                        self.postForm.promocode.$setPristine();
                    }
                }
            );

            $scope.$watchGroup(
                ['postLoginVm.password','postLoginVm.passwordVerify'],
                function(newValues, oldValues) {
                    var isValid = newValues[0] === newValues[1];
                    self.postForm.passwordVerify.$setValidity('match', isValid);
                }
            );

            $scope.$watch(
                'postLoginVm.zipCode',
                function ( newZipcode, oldZipcode ) {
                    if ( newZipcode !== undefined && newZipcode.length === 5 && newZipcode !== oldZipcode ) {
                        $rootScope.hideLoader = true;
                        self.showLoadingStars = true;
                        //get geocode from google
                        self.getLocations ( newZipcode );
                    }
                    if ( newZipcode === undefined || newZipcode.length !== 5 ) {
                        self.locations = null;
                    }
                }
            );

            self.getLocations = function ( zipCode ) {
                self.message = "Verifying Zipcode...";
                GeoCoder.geocode(
                    {
                        address: self.zipCode
                    }
                ).then(
                    function(results){
                      var queryLatitude = results[0].geometry.location.lat();
                      var queryLongitude = results[0].geometry.location.lng();
                      var queryRadius = 50; // in Miles
                      var queryCookie = false;
                      var queryData = {
                          latitude: queryLatitude,
                          longitude: queryLongitude,
                          radius: queryRadius,
                          "update_cookie": queryCookie
                      };
                      self.message = "Finding TLE centers near you...";
                      Index.getLocations(
                        queryData,
                        function ( promise ) {
                          $rootScope.hideLoader = false;
                          self.showLoadingStars = false;
                          self.message = '';
                          if ( promise.centers.length > 0 ) {
                              var corporate = [ {
                                  'Center': {
                                      'ROWID': '-1',
                                      'NAME': 'Corporate Employee'
                                  }
                              } ];
                              self.locations = corporate.concat(promise.centers);
                          }
                          else {
                              // to-do: more error handling?
                              var logMessage = 'Could not find locations near ZipCode: ' + self.zipCode;
                              self.message = logMessage;
                              $log.warn(logMessage);
                              self.locations = null;
                          }
                      },
                      function ( error ) {
                          $rootScope.hideLoader = false;
                          self.showLoadingStars = false;
                          self.zipCode = '';
                          $log.error( error );
                          self.message = 'Unable to find locations at this time. Please try again later.';
                      }
                      );
                    },
                    function ( error ) {
                        $rootScope.hideLoader = false;
                        self.showLoadingStars = false;
                        if ( error === 'ZERO_RESULTS' ) {
                            self.message = 'Invalid zipcode, try again.';
                        } else {
                            self.message = "Unable to verify your zipcode at this time, please try again later.";
                            $log.error( "Unable to verify zipcode: " + error );
                        }
                    }
                );
            };

            self.modifyAccount = function( ev ) {
                self.isSubmitting = true;
                self.showLoadingStars = true;
                $rootScope.hideLoader = true;
                self.message = 'Submitting Form...';
                var payload = {
                    'need_post_login': 0
                };
                if ( self.firstname !== null && self.lastname !== null ) {
                    var fullName = self.firstname + ' ' + self.lastname;
                    payload.name = fullName;

                    $scope.index.userInfo.User.name = fullName;
                }
                if ( self.promocode !== null ) {
                    payload.promo_code = self.promocode;
                }
                if ( self.password !== null && self.passwordVerify !== null ) {
                    payload.password = self.password;
                }
                if ( self.howDidYouHear !== null ) {
                    payload.referrer = self.howDidYouHear;
                }
                if ( self.center !== null ) {
                    payload.center = self.center.Center.ROWID;
                }
                if ( self.otherReferral !== null ) {
                    payload.referrer_extra = self.otherReferral;
                }
                Index.updateUser(
                    {
                        APIKey: ApiKey.getApiKey()
                    },
                    payload,
                    function(promise) {
                        self.isSubmitting = false;
                        self.showLoadingStars = false;
                        $rootScope.hideLoader = false;
                        if ( promise.Status.OK !== undefined ) {
                            ApiKey.saveApiKey(promise.Status.OK.activation_key);
                            $scope.index.userInfo.User.need_post_login = false;
                            Storage.saveLocalData('userInfo', $scope.index.userInfo);
                            $analytics.eventTrack('Submit', {
                                category: 'Post Login'
                            });
                            $uibModalInstance.dismiss('cancel');                      
                        } else {
                            if ( promise.Status.ERROR.name !== undefined ) {
                                self.nameError = true;
                                self.nameMessage = promise.Status.ERROR.name;
                                $log.error( promise.Status.ERROR.name );
                            }
                            if ( promise.Status.ERROR.password !== undefined ) {
                                self.passwordError = true;
                                self.passwordMessage = promise.Status.ERROR.password;
                                $log.error( promise.Status.ERROR.password );
                            }
                            self.message = 'Unable to submit form. Please check your input and try again.';
                        }
                    },
                    function(error){
                        self.isSubmitting = false;
                        self.showLoadingStars = false;
                        $rootScope.hideLoader = false;
                        $log.error(error);
                        self.message = 'Unable to submit form. Please try again later.';
                    }
                );
                $timeout(function(){
                    $rootScope.animationStatus = 1;
                },2000);  
                $timeout(function(){
                    $rootScope.animationStatus = 0;
                },7000);
            };
    })
    .controller(
      'SignupModalInstanceCtrl',
      function (
        $analytics,
        $scope,
        $rootScope,
        $uibModalInstance,
        object,
        Index,
        localStorageService,
        $location,
        $filter,
        $log,
        login,
        Storage,
        ApiKey,
        GeoCoder ) {
          var self = this;
          self.object = object;
          self.showLoadingStars = false;
          self.firstname = null;
          self.lastname = null;
          self.nameError = false;
          self.nameMessage = null;
          self.email = null;
          self.emailError = false;
          self.emailMessage = null;
          self.password = null;
          self.passwordVerify = null;
          self.passwordError = false;
          self.passwordMessage = null;
          self.zipCode = "";
          self.howDidYouHear = null;
          self.otherReferral = null;
          self.locations = null;
          self.center = null;
          self.isSubmitting = false;
          self.locationError = false;
          self.loginError = false;
          self.userId = null;
          self.message = null;

          self.cancel = function () {
              $uibModalInstance.dismiss('cancel');
          };

          $scope.$watchGroup(
              ['signupVm.password','signupVm.passwordVerify'],
              function(newValues, oldValues) {
                  var isValid = newValues[0] === newValues[1];
                  self.signupForm.passwordVerify.$setValidity('match', isValid);
              }
          );

          self.goToLogin = function() {
              $uibModalInstance.dismiss('cancel');
              login();
          };

          self.signup = function () {
              $rootScope.hideLoader = true;
              self.showLoadingStars = true;
              self.isSubmitting = true;
              self.message = "Signing up";
              self.nameError = false;
              self.passwordError = false;
              self.emailError = false;
              self.nameMessage = null;
              self.passwordMessage = null;
              self.emailMessage = null;
              self.loginError = false;
              self.userId = null;
              var fullName = self.firstname + " " + self.lastname;
              var signupPayload = {
                  password: self.password,
                  name: fullName,
                  email: self.email
              };

              Index.signup(
                  signupPayload,
                  function ( promise ) {
                      self.message = '';
                      var error = promise.Status.ERROR;
                      if (error) {
                          $rootScope.hideLoader = false;
                          if (error.email) {
                              self.emailMessage = error.email[0];
                              self.emailError = true;
                          }
                          if (error.password) {
                              self.passwordMessage = error.password[0];
                              self.passwordError = true;
                          }
                          if (error.name) {
                              self.nameMessage = error.name[0];
                              self.nameError = true;
                          }
                          self.isSubmitting = false;
                          self.showLoadingStars = false;
                      }
                      else {
                          self.userId = promise.Status.OK.user_id;
                          $log.info('Created user: ' + self.userId);
                          // login to new account
                          self.loginError = false;
                          self.message = "Logging in.";
                          Index.login(
                              {
                                  username: self.email,
                                  password: self.password
                              },
                              function (promise) {
                                  var apiKey = promise.data;
                                  if (apiKey == false) {
                                      self.loginError = true;
                                      self.message = 'Invalid username or password';
                                  }
                                  else {
                                      self.message = '';
                                      ApiKey.saveApiKey( apiKey.APIKey );

                                      // Create free user subscription
                                      var today = new Date();
                                      var expirationDate = new Date().setMonth(today.getMonth()+1);
                                      var expDateString = $filter('date')(expirationDate, 'yyyy-MM-dd');
                                      self.message = "Creating Subscription...";
                                      Index.subscribe(
                                          {
                                              APIKey: ApiKey.getApiKey()
                                          },
                                          {
                                              'reciept': 'placeholder',
                                              'store_type_id': 'W',
                                              'subscription_id': 4,
                                              'user_id': self.userId,
                                              'method': 'free',
                                              'expiration': expDateString
                                          },
                                          function( promise )  {
                                            if ( promise.Status.OK !== undefined ){
                                                $log.info('Successfully Applied Free Subscription' + promise.Status.OK);
                                            } else {
                                              $log.error(promise.Status.ERROR);
                                            }
                                            self.message = 'Creating Avatar...';
                                            Index.createUserAvatar(
                                                {
                                                    APIKey: ApiKey.getApiKey()
                                                },
                                                {
                                                    "avatar_id": "1"
                                                },
                                                function( promise ) {
                                                    $rootScope.hideLoader = false;
                                                    self.isSubmitting = false;
                                                    self.showLoadingStars = false;
                                                    self.message = '';
                                                    if ( promise.Status.OK !== undefined ) {
                                                        var userAvatar = promise.Status.OK.Avatar.image_path;
                                                        Storage.saveLocalData( 'userAvatar', userAvatar );
                                                    } else {
                                                        $log.error( promise.Status.ERROR );
                                                    }
                                                    $analytics.eventTrack('Submit', {
                                                        category: 'Signup'
                                                    });
                                                    $location.path('/loginsuccess');
                                                    $uibModalInstance.dismiss('cancel');
                                                },
                                                function ( error ) {
                                                    $rootScope.hideLoader = false;
                                                    self.isSubmitting = false;
                                                    self.showLoadingStars = false;
                                                    self.message = 'Unable to create avatar. Please try again later';
                                                    $log.error ( error );
                                                    $location.path('/loginsuccess');
                                                    $uibModalInstance.dismiss('cancel');
                                                }
                                            );
                                          },
                                          function ( error ) {
                                              $rootScope.hideLoader = false;
                                              self.isSubmitting = false;
                                              self.showLoadingStars = false;
                                              $log.error( error );
                                              self.message = 'Unable to create subscription. Please try again later';
                                              $location.path('/loginsuccess');
                                              $uibModalInstance.dismiss('cancel');
                                          }
                                      );
                                  }
                              },
                              function ( error ) {
                                  $rootScope.hideLoader = false;
                                  self.isSubmitting = false;
                                  self.showLoadingStars = false;
                                  $log.error( error );
                                  self.message = 'Unable to login. Please try again later';
                              }
                          );
                      }
                  },
                  function ( error ) {
                      $rootScope.hideLoader = false;
                      self.isSubmitting = false;
                      self.showLoadingStars = false;
                      $log.error( error );
                      self.message = 'Unable to signup. Please try again later';
                  }
              );
          };
    })
    .controller(
        'ResetPasswordController',
        function(
            $location,
            $log,
            $mdDialog,
            $rootScope,
            $scope,
            $timeout,
            Index
        ) {
            var self = this;
            self.hasError = false;
            self.isChanging = false;
            self.message = '';
            self.newPassword = '';
            self.passwordChanged = false;
            self.passwordError = '';
            self.showLoadingStars = false;
            self.verifyPassword = '';
            self.apiKey = null;

            $scope.$on(
                '$routeChangeSuccess',
                function( event, to, from ) {
                    self.apiKey = to.params.ak;
                }
            );

            $scope.$watchGroup(
                ['resetVm.newPassword', 'resetVm.verifyPassword'],
                function( newValues, oldValues ) {
                    var isValid = newValues[0] === newValues[1];
                    self.passwordForm.verify.$setValidity('match', isValid);
                }
            );

            self.confirm = function() {
                $rootScope.hideLoader = true;
                self.isChanging = true;
                self.showLoadingStars = true;
                self.message = 'Changing Password...';
                Index.resetPassword(
                    { APIKey: self.apiKey },
                    { password: self.newPassword },
                    function( promise ) {
                        $rootScope.hideLoader = false;
                        self.isChanging = false;
                        self.showLoadingStars = false;
                        if ( promise.Status.OK !== undefined ) {
                            self.message = 'Password successfully changed. Redirecting to BubblesU Home in 3 seconds...';
                            self.passwordChanged = true;
                            self.requestFailed = false;
                            var time = $timeout(
                                function() {
                                    $location.path('/');
                                    $location.search({});
                                },
                                3000
                            );
                        } else {
                            self.hasError = true;
                            self.requestFailed = true;
                            self.message = promise.Status.ERROR;
                            $log.error( self.message );
                        }
                    },
                    function( error ) {
                        $rootScope.hideLoader = false;
                        self.isChanging = false;
                        self.showLoadingStars = false;
                        self.requestFailed = true;
                        $log.error( error );
                    }
                );
            };
        }
    )
    .controller('MessagesModalInstanceCtrl', function ($scope, $rootScope, $uibModalInstance, object, Index, localStorageService, $location, ApiKey, $log) {
        var self = this;
        self.object = object;

        self.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        self.showMessage = function (message) {
            $rootScope.hideLoader = true;
            Index.markRead(
                {
                    messageId: message.UserMessage.id,
                    APIKey: ApiKey.getApiKey()
                },
                {},
                function ( promise ) {
                    $rootScope.hideLoader = false;
                },
                function ( error ) {
                    $log.error( error );
                }
            );
        };
    })

    .controller(
        'HomeModalInstanceCtrl',
        function ($scope, $uibModalInstance, object, isLoggedIn, userId) {
            var self = this;
            self.object = object;
            self.isLoggedIn = isLoggedIn;
            self.userId = userId;

            self.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            self.stopInterval = function () {
                self.object.interval = 0;
            };

            self.printActiveSlide = function (object) {
                var path = "";
                path = angular.element('#colorModalSlider .active img').eq(0).attr('data-print-src');
                // to-do: move to directive
                var printWindow = window.open();
                printWindow.document.write('<img src="' + path + '" style="height:100%"/>');
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            };

            self.printImage = function() {
                var path = object.SiteObject.path;
                var printWindow = window.open();
                printWindow.document.write('<img src="' + path + '" style="height:100%"/>');
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            };

            self.itemFilter = function(character) {
                return function(item) {
                    var flag = false;
                    angular.forEach(item.Character, function(data) {
                        if(data.shortname == character && flag != true) {
                            flag = true;
                        }
                    });
                    return flag;
                }
            };
    });

})();
