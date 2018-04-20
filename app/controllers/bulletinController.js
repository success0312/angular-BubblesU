'use strict';
app.controller(
    'bulletinController',
    [
        '$animate',
        '$scope',
		'$rootScope',
        '$filter',
        'ApiKey',
        'Home',
        'Index',
        'localStorageService',
		'$location',
        '$log',
        '$q',
        'User',
        function ($animate, $scope, $rootScope, $filter, ApiKey, Home, Index, localStorageService, $location, $log, $q, User) {

            var self = this;
            self.achieves = [];
            self.heartsList = [];
            self.weeklySticker = {};
            self.userId = null;
			// redirect guest to bubblesU home if not logged in



            if ( ApiKey.isLoggedIn() === false ) {
				$location.path('/bubblesu');
			} else {
                $animate.enabled( false );
                $q.all(  [ User.getUser(), Index.getBulletinSticker().$promise, User.getUserAvatar() ] ).then(
                    function ( userData ) {
                        var sticker = userData[1].Status.OK[0].Sticker.path;
                        self.userId = userData[0][1];
                        var userAvatar = userData[2];
                        $q.all( [ Home.getUserHeartedData( userData[0][1] ), User.getUserGameActivity(),  getImage( sticker ) ] ).then(
                            function ( bulletinData ) {
                                self.heartsList = bulletinData[0];
                                self.achieves = getAchievements( bulletinData[1][0] );
                                self.weeklySticker.opt = userData[1].Status.OK[0].Sticker.name;
                                self.weeklySticker.h = bulletinData[2].naturalHeight * 0.5;
                                self.weeklySticker.w = bulletinData[2].naturalWidth * 0.5;
                                self.weeklySticker.img_url = bulletinData[2].src;
                                setBulletin( self.heartsList, self.weeklySticker, self.achieves, userAvatar );
                            }
                        );
                    }
                );
            }

            function getImage( imageSrc ) {
                return $q( function( resolve, reject ) {
                    var image = new Image();
                    image.onload = function() {
                        resolve( image );
                    };
                    image.src = imageSrc;
                });
            }

            function getAchievements ( gamesProgress ) {
                var achieves = [];
                var emptyMedal = {
                    title: '?????',
                    achieved: false
                };
                var dedupGames = $filter('unique')(gamesProgress,'Game.id');
                var dedupGamesProgress = $filter('unique')( gamesProgress, 'UserGamesProgress.progress_data' );
                angular.forEach( dedupGames, function( value ) {
                    var achieve = {
                        title: value.Game.name,
                        img_url: value.SiteObject.thumbnail_path,
                        medals: [],
                        trophy_achieved: false
                    };
                    this.push( achieve );
                }, achieves );
                if (Object.keys(achieves).length == 0) {
                    $('.blt_achieve_content > .blt_content').append("You have no achievements");
                }
                else{
                    angular.forEach( achieves, function( achieve ) {
                        var levels = $filter('filter')( dedupGamesProgress, { Game: {name: achieve.title } } );
                        var levelsCompleted = levels.length;
                        angular.forEach( levels, function ( level ) {
                            var medal = {
                                title: angular.fromJson(level.UserGamesProgress.progress_data).level,
                                achieved: true
                            };
                            achieve.medals.push( medal );
                        } );
                        var levelsTotal = levels[0].Game.levels;
                        var fillLevels = levelsTotal - levelsCompleted;
                        if ( fillLevels > 0 ) {
                            for ( var i = 0; i < fillLevels ; i++ ) {
                                achieve.medals.push( emptyMedal );
                            }
                        } else {
                            achieve.trophy_achieved = true;
                        }
                    });
                }
                return achieves;
            }

            function setBulletin( heartsList, weeklySticker, achievements, userAvatar ) {
            	window.bulletin = new window.BulletinApp({
            		apiKey: ApiKey.getApiKey(),
                    content: {
                        achieves: achievements,
                        heart_list: heartsList,
                        week_sticker: weeklySticker,
                        avatar_sticker:  {opt: "", h: 84, w: 84, img_url: userAvatar}
                    },

                    ////  HANDLER ON BOARD HAS BEEN LOADED
                    onLoad: function() {

                        //////   ADD STICKER INTERFACE
                        //this.createSticker({
                        //  type:'app',
                        //  opt: 'recipe',
                        //  w: 100,
                        //  h: 200,
                        //  img_url:"http://cdn.bubblesu.com/images/bulletine/clipped_game.jpg"
                        //});
                        ////
                        //this.set('data', {});

                    },

                    ////  TIME OUT FOR WAITING SERVER RESPOND OTHERWISE TRYING OPEN FROM LOCAL STORAGE OTHERWISE STARTS WITH DEFAULT PARAMS
                    serverWaitTimeOut: 0,

                    ////  ON APP STICKER HEART BUTTON HAS BEEN CLICKED
                    onHeart: function(sticker){
                    },
                    ////  ON APP STICKER PLAY BUTTON HAS BEEN CLICKED
                    onPlay: function(sticker){
                        switch( sticker.opt ) {
                            case 'music':
                                $scope.index.openAudioModal(null, sticker.site_object);
                            break;
                            case 'book':
                            case 'movie':
                                $scope.index.openVideoModal(null, sticker.site_object);
                            break;
                            case 'pen':
                                $scope.index.openColorCreateModal(null, sticker.site_object);
                            break;
                            case 'game':
                                $scope.index.openGameModal(null, sticker.site_object);
                            break;
                            case 'phonic':
                                $scope.index.openFunkyPhonicsModal(null, sticker.site_object);
                            break;
                            case 'recipe':
                                $scope.index.openRecipesModal(null, sticker.site_object);
                            break;
                        }
                    },
                    ////  ON APP STICKER SHARE BUTTON HAS BEEN CLICKED
                    onShare: function(sticker){

                    },
                    onRemove: function(sticker) {
                        $rootScope.hideLoader = true;
                        Index.unheart(
                            { heartId: sticker.heart_id },
                            function( promise ) {
                                if ( promise.Status.OK !== undefined ) {
                                    Home.clearUserHomeData();
                                    Home.getUserFilteredData( self.userId ).then(
                                        function( data ) {
                                            Home.getUserHeartedData( self.userId ).then(
                                                function ( heartsList ) {
                                                    $rootScope.hideLoader = false;
                                                    window.bulletin.set( 'heart_list', heartsList );
                                                    return true;
                                                }
                                            );
                                        }
                                    );
                                } else {
                                    $log.error( promise.Status.ERROR );
                                    return false;
                                }
                            }
                        );
                    }
            	});
            }
        }
    ]
);
