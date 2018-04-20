'use strict';
app.directive('bubblesuSpinner', function($log){
    function link( scope, element, attrs ) {
       scope.$on(
           '$routeChangeSuccess',
           function ( event, to, from) {
               var character = to.params.character;
               if (character !== undefined ) {
                   var spinner = $(element).spinner().data("plugin_spinner");
                   if ( character === 'bubblesu' || character === "loginsuccess" || character === "logoutsuccess") {
                       var css = spinner.getCss(0);
                       spinner.$spinnerWheel.css(css);
                       spinner.rotations = 0;
                       spinner.content(0);
                       character = 'bubblesu';
                   } else {
                       var spinIndex = $('#' + character, spinner.spinnerContent).index();
                       spinner.$spinnerWheel.css(spinner.getCss(spinIndex));
                       spinner.rotations = spinIndex;
                       spinner.content(spinIndex);
                   }
                   $('.spinner-title').hide('fast', function() {
                       $('.spinner-title').show();
                   });

                   if ( character !== undefined && to.params.section === undefined ) {
                       sayMyName(character);
                   }
               }
           }
       );
    }
    return {
        restrict: 'A',
        link: link
    };
})
app.directive('myBuddiesList', function(){
  function link( $scope, element, attrs ){
    $scope.$watch(
      'index.showMyBuddies',
      function( newValue, oldValue ) {
        if ( newValue === oldValue ) {
          return;
        }

        if ( newValue === true ) {
          playSoundClip('myBuddiesIcon');
          element.slideDown(500);
        } else {
          element.slideUp(500);
        }

      }
    );
  }

  return {
    restrict: 'A',
    link: link
  };
})
.directive('loader', function ( $rootScope ) {
    function link( $scope, element, attrs ) {
        $scope.$on('loader_show', function () {
            if ( $rootScope.hideLoader === true ){
                angular.element( element ).addClass('hide-loader');
            } else {
              angular.element( element ).parent().addClass('loading');
            }
                return element.show();
        });
        $scope.$on('loader_hide', function () {
            if ( $rootScope.hideLoader === true ){
                angular.element( element ).removeClass('hide-loader');
            } else {
                angular.element( element ).parent().removeClass('loading');
            }
                return element.hide();
        });
    }

    return {
        link: link
    };
}).directive('bubblesuVideo', function( $window ) {
    function link ( scope, element, attrs ) {
        // stop video and cancel download
        scope.$on('modal.closing', function() {
            if ( vid !== undefined ) {
                vid.pause();
                vid.src = '';
            }
        });

        // hide
        var windowWidth = document.documentElement.clientWidth;
        if ( windowWidth > 320 && windowWidth < 480) {
             var thumbnailPath = attrs['thumbnail'];
             angular.element(element).attr('poster', thumbnailPath);
             angular.element($window).on('resize', function() {
                 var resizeWidth = document.documentElement.clientWidth;
                 if ( resizeWidth > 320 && resizeWidth < 480) {
                     angular.element(element).attr('poster', thumbnailPath);
                 } else {
                     angular.element(element).removeAttr('poster');
                 }
             });
             scope.$on('$destroy', function(){
                 angular.element($window).off('resize');
             });
        }
    }
    return {
        restrict: 'A',
        link: link
    };
})
.directive('gameFrame', function( $log ){
    function shiftFrame( element, scope ) {
        var windowWidth = document.documentElement.clientWidth;
        if ( windowWidth < 660 ) {
            var scale = windowWidth / 600;
            $(element).parent().height(windowWidth - 35);
            $(element).css({
                "-webkit-transform": "scale(" + scale + ")",
                "-ms-transform": "scale(" + scale + ")",
                "transform": "scale(" + scale + ")"
            });
            var gameFrame =  document.getElementsByClassName(element.attr('class'))[0];
            if (gameFrame.readyState === 'complete' ) {
                console.info('ready state load');
                $(element).css('left', ($(element).position().left * -1 ) + 'px');
                $(element).css('top', ($(element).position().top * -1 ) + 'px');
            } else {
                gameFrame.onload = function() {
                    $(element).css('left', ($(element).position().left * -1 ) + 'px');
                    $(element).css('top', ($(element).position().top * -1 ) + 'px');
                };
            }
        }
    }
    function  link( scope, element, attrs ) {

        $( window ).on('resize', function () {
            shiftFrame(element, scope);
        });
        scope.$on('$destroy', function() {
            //unbind event
            $( window ).off('resize');
        });
        shiftFrame(element, scope);
    }
    return {
        restrict: 'A',
        link: link
    };
})
.directive('bubblesuHeart', function(){
    return {
        restrict: 'E',
        scope: {
            object: '=siteObject',
            userId: "=userId"
        },
        templateUrl: 'hearts-template.html',
        controller: ['$scope',
            '$rootScope',
            '$log',
            '$filter',
            '$analytics',
            'Index',
            'ApiKey',
            function($scope, $rootScope, $log, $filter, $analytics, Index, ApiKey){
                var self = this;
                self.isHearted = function(){
                    return $scope.object.Heart !== undefined && $scope.object.Heart.length > 0;
                };
                self.isWaiting = false;
                self.heart = function() {
                    $rootScope.hideLoader = true;
                    self.isWaiting = true;
                    Index.heart({
                        user_id: $scope.userId,
                        short_name: $scope.object.SiteObject.short_name
                    }, function( promise ) {
                        self.isWaiting = false;
                        $rootScope.hideLoader = false;
                        if ( promise.ERROR === undefined ) {
                            var now = $filter('date')(Date.now(), 'yyyy-MM-dd HH:mm:ss');
                            if ( $scope.object.Heart === undefined ) {
                                $scope.object.Heart = [];
                            }
                            $scope.object.Heart.push(
                            {
                                created: now,
                                id: promise.heart_id,
                                modified: now,
                                site_object_id: $scope.object.SiteObject.id,
                                user_id: promise.user_id

                            });
                            toastr.success( 'You hearted: ' + $scope.object.SiteObject.name );
                            $analytics.eventTrack('Heart', {
                                label: $scope.object.SiteObject.name
                            });
                        } else {
                            $log.error( promise.ERROR.errorInfo[2] );
                            toastr.error( 'Unable to heart "' + $scope.object.SiteObject.name + '": ' + promise.ERROR.errorInfo[2]);
                        }

                    },
                    function( error ) {
                        $log.error( error );
                        toastr.error( 'Unable to heart "' + $scope.object.SiteObject.name + '". Please try again later.');
                    }
                );
                };
                self.unheart = function() {
                    self.isWaiting = true;
                    $rootScope.hideLoader = true;
                    Index.unheart(
                        {
                            heartId: $scope.object.Heart[0].id
                        },
                        function( promise ) {
                            $rootScope.hideLoader = false;
                            self.isWaiting = false;
                            if ( promise.Status.OK !== undefined ) {
                                $scope.object.Heart = [];
                                toastr.success( 'You un-hearted: ' + $scope.object.SiteObject.name );
                                $analytics.eventTrack('Unheart', {
                                    label: $scope.object.SiteObject.name
                                });
                            } else {
                                $log.error( promise.Status.ERROR );
                            }
                        },
                        function( error ) {
                            $log.error( error );
                            toastr.error( 'Unable to un-heart: ' + $scope.object.SiteObject.name + '. Please try again later.' );
                        }
                    );
                };
        }],
        controllerAs: 'heart'
    };
}).directive('playSound', function( $log, $window, $timeout ) {
    /**********************************************
     * play-sound directive
     * hooks sounds created with soundmanger2 library
     * into AngularJS app.
     * Usage: add play-sound to any html attribute along with:
     * sound="<soundmanger2-id>", toggle="<js event to trigger sound>"
     * colorcreate="true" only for color and create

     **********************************************/
    function link( scope, element, attrs ) {
        if ( attrs.colorcreate === 'true' ) {
            $timeout(function() {

                var slideId = element.attr('id').toLowerCase();
                var soundId = '';
                switch ( slideId ) {
                    case 'coloringpages':
                        soundId = 'coloringPagesThumb';
                    break;
                    case 'cutouts':
                        soundId = 'cutOutCraftsThumb';
                    break;
                    case 'puzzles':
                        soundId = 'puzzlesThumb';
                    break;
                    case 'mazes':
                        soundId = 'mazesThumb';
                    break;
                }
                element.bind(attrs.toggle, function() {
                    playSoundClip(soundId);
                });
            }, 0);
        } else {
            element.bind(attrs.toggle, function(){
                playSoundClip(attrs.sound);
            });
        }
    }
    return {
        restrict: 'A',
        link: link
    };
});
