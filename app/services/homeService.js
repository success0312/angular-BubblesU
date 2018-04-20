'use strict';
angular.module('App.homeService', []).factory('Home', function ($resource, ngAuthSettings, $filter, $log, ApiKey, $q) {
	var self = this;
	self.serviceBase = ngAuthSettings.apiServiceBaseUri;
	self.userHomeData = null;
	self.guestHomeData = null;
	self.userFilteredData = null;
	self.guestFilteredData = null;

	function get() {
		return $resource( self.serviceBase + 'api/home.json',{});
	}

	function clearUserHomeData(){
		self.userHomeData = null;
		self.userFilteredData = null;
	}

	function getGuestHomeData() {
		return $q( function( resolve, reject ) {
			if ( self.guestHomeData === null ) {
				get().get(
					function ( promise ) {
						if ( promise.Status.OK !== undefined ) {
							self.guestHomeData = promise.Status.OK;
							resolve( self.guestHomeData );
						} else {
							$log.error( promise.Status.ERROR );
							reject( self.Status.ERROR );
						}
					}
				);
			} else {
				resolve( self.guestHomeData );
			}
		});
	}

	function getUserHomeData() {
		return $q( function( resolve, reject ) {
			if ( self.userHomeData === null ) {
				get().get(
					{ APIKey: ApiKey.getApiKey() },
					function ( promise ) {
						if ( promise.Status.OK === undefined ) {
							$log.error( promise.Status.ERROR );
							reject( promise.Status.ERROR );
						} else if ( promise.Status.OK === null ) {
							reject( 'no user data found' );
						} else {
							self.userHomeData = promise.Status.OK;
							resolve( self.userHomeData );
						}
					},
					function ( error ) {
						$log.error( error );
						reject( error );
					}
				);
			} else {
				resolve( self.userHomeData );
			}
		});
	}

	function setGuestHomeData(data){
		self.guestHomeData = data;
	}

	function setUserHomeData(data){
		self.userHomeData = data;
	}

	function getGuestFilteredData() {
		return $q( function( resolve, reject ) {
			if ( self.guestFilteredData === null ) {
				var promise = getGuestHomeData();
				promise.then( function( guestData ) {
					self.guestFilteredData = Filter( guestData, false, null );
					resolve( self.guestFilteredData );
				});
			} else {
				resolve( self.guestFilteredData );
			}
		});
	}

	function getUserFilteredData(userId) {
		return $q( function( resolve, reject ) {
			if ( self.userFilteredData === null ) {
				var promise = getUserHomeData();
				promise.then( function( userData ) {
					self.userFilteredData = Filter( userData, true, userId );
					resolve( self.userFilteredData );
				});
			} else {
				resolve( self.userFilteredData );
			}
		});
	}

	function getUserHeartedData(userId) {
		return $q( function( resolve, reject ) {
			var promise = getUserHomeData();
			promise.then( function( userData ) {
				var heartHomeData = getHearts ( userData, userId );
				var filteredHearts = $filter('filter')( heartHomeData, function( value, index, array) {
					if ( value.Heart.length > 0 ) {
						return true;
					} else {
						return false;
					}
				});
				var mappedHearts = $filter('map')( filteredHearts, bulletinHeart );
				resolve( mappedHearts );
			});
		});
	}

	function bulletinHeart(element) {
		var optName;
		switch ( element.SiteObjectType.name ) {
			case 'audio':
				optName = 'music';
			break;
			case 'reading_corner':
				optName = 'book';
			break;
			case 'video':
				optName = 'movie';
			break;
			case 'color_create':
				optName = 'pen';
			break;
			case 'online_games':
				optName = 'game';
			break;
			case 'funky_phonics':
				optName = 'phonic';
			break;
			case 'family_fun_recipes':
				optName = 'recipe';
			break;
		}
		return {
			type: 'app',
			opt:  optName,
			heart_id: element.Heart[0].id,
			img_url: element.SiteObject.thumbnail_path,
			site_object: element
		};
	}

	function getHearts( homeData, userId ) {
		var heartHomeData = [];
		angular.forEach(
			homeData,
			function ( value ) {
				if ( value.Heart === undefined ) {
					value.Heart = [];
				} else {
					if ( angular.isArray(value.Heart) ) {
						var hearts = value.Heart;
						var filteredHearts = $filter('filter')(hearts, {'user_id': userId}, true);
						value.Heart = filteredHearts;
					}
				}
				this.push(value);
			},
			heartHomeData
		);
		return heartHomeData;
	}

	function Filter( homeData, addHearts, userId ) {
		var filtered = {};
		if ( addHearts === true ) {
			homeData = getHearts( homeData, userId );
		}

		// filter out data that does not have a SiteObjectType, thumbnail path or is not active
		homeData = $filter('filter')(homeData, {SiteObjectType: {id: ''}, SiteObject: {thumbnail_path: '', active: true} });

		angular.forEach(
			homeData,
			function ( data ) {
				var characterList = data.Character;
				var siteObjectType = data.SiteObjectType.name;
				characterList.push({shortname: 'bubblesu'});
				angular.forEach(
					characterList,
					function ( character ) {
						var shortname = character.shortname;
						if ( filtered[shortname] === undefined) {
							filtered[shortname] = {};
						}
						if ( shortname !== 'bubblesu' && angular.equals(filtered[shortname], {}) ) {
							filtered[shortname].characterBio = character.description;
							filtered[shortname].characterName = character.name;
							filtered[shortname].characterAvatar = character.path;
						}
						switch ( siteObjectType ) {
							case 'video':
								if ( filtered[shortname].Videos === undefined ) {
									filtered[shortname].Videos = [];
								}
								filtered[shortname].Videos.push(data);
							break;
							case 'online_games':
								if ( filtered[shortname].Games === undefined ) {
									filtered[shortname].Games = [];
								}
								filtered[shortname].Games.push(data);
							break;
							case 'color_create':
								if ( filtered[shortname].ColorCreate === undefined ) {
									filtered[shortname].ColorCreate = [];
								}
								filtered[shortname].ColorCreate.push(data);
							break;
							case 'audio':
								if ( filtered[shortname].Audio === undefined ) {
									filtered[shortname].Audio = [];
								}
								filtered[shortname].Audio.push(data);
							break;
							case 'reading_corner':
								if ( filtered.ReadingCorner === undefined ) {
									filtered.ReadingCorner = [];
								}
								filtered.ReadingCorner.push(data);
							break;
							case 'app':
								if ( filtered.App === undefined ) {
									filtered.App = [];
								}
								filtered.App.push(data);
							break;
							case 'funky_phonics':
								if ( filtered.FunkyPhonics === undefined ) {
									filtered.FunkyPhonics = [];
								}
								filtered.FunkyPhonics.push(data);
							break;
							case 'family_fun_recipes':
								if ( filtered.Recipes === undefined ) {
									filtered.Recipes = [];
								}
								filtered.Recipes.push(data);
							break;
						}
					}
				);
			}
		);

		return filtered;
	}

	return {
		get: get,
		clearUserHomeData: clearUserHomeData,
		getGuestHomeData: getGuestHomeData,
		getUserHomeData: getUserHomeData,
		setGuestHomeData: setGuestHomeData,
		setUserHomeData: setUserHomeData,
		getGuestFilteredData: getGuestFilteredData,
		getUserFilteredData: getUserFilteredData,
		getUserHeartedData: getUserHeartedData
	};

});
