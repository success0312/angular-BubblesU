'use strict';
angular.module('App.userService', []).factory('User', function ($resource, ngAuthSettings, $filter, $log, ApiKey, $q, Index, Storage) {
	var self = this;
	self.activeSubscription = null;
	self.activeSubscriptionType = null;
	self.userInfo = null;
	self.userAvatar = null;
	self.userMessages = null;
	self.userGameActivity = null;
	self.userGameUnlocks = null;
	self.userId = null;
	self.userSubscriptions = null;

	/**
	 * @function clearUserData
	 * @description sets the specified user data to null
	 * @param { string } index
	 **/
	function clearUserData( index ) {
		self[index] = null;
	}

	/**
	 * @function clearAllUserData
	 * @description sets all user data to null
	 **/
	function clearAllUserData() {
		self.activeSubscription = null;
		self.activeSubscriptionType = null;
		self.userInfo = null;
		self.userAvatar = null;
		self.userMessages = null;
		self.userGameActivity = null;
		self.userGameUnlocks = null;
		self.userId = null;
		self.userSubscriptions = null;
	}

	function getUser() {
		return $q( function( resolve, reject ) {
			if ( Storage.storageSupported === true ) {
				self.userInfo = Storage.getLocalData('userInfo');
			}
			if ( self.userInfo === false || self.userInfo === null ) {
				Index.getUser(
					{ APIKey: ApiKey.getApiKey() },
					function ( promise ) { // success
						if ( promise.Status.OK !== undefined ) {
							Storage.saveLocalData( 'userInfo', promise.Status.OK );
							self.userInfo = promise.Status.OK;
							self.userId = self.userInfo.User.id;
							resolve( [ self.userInfo, self.userId ] );
						} else {
							//$log.error( promise.)
							reject( promise.Status.ERROR );
						}
					},
					function ( error ) { // error
						$log.error( error );
						reject ( error );
					}
				);
			} else {
				self.userId = self.userInfo.User.id;
				resolve( [ self.userInfo, self.userId ] );
			}
		});
	}

	function getUserAvatar() {
		return $q( function( resolve, reject ) {
			if ( Storage.storageSupported === true ) {
				self.userAvatar = Storage.getLocalData('userAvatar');
			}
			if ( self.userAvatar === false || self.userAvatar === null ) {
				Index.getUserAvatar(
					{ APIKey: ApiKey.getApiKey() },
					function ( promise ) { // success
						if ( promise.Status.OK !== undefined ) {
							if ( angular.equals ( promise.Status.OK, [] ) === false ) {
								self.userAvatar = promise.Status.OK.Avatar.image_path;
								Storage.saveLocalData( 'userAvatar', self.userAvatar );
								resolve( self.userAvatar );
							} else { // create avatar
								Index.createUserAvatar(
									{ APIKey: ApiKey.getApiKey() },
									{ "avatar_id": "1" },
									function( promise ) { // success
										if ( promise.Status.OK !== undefined ) {
											self.userAvatar = promise.Status.OK.Avatar.image_path;
											Storage.saveLocalData( 'userAvatar', self.userAvatar );
											resolve( self.userAvatar );
										} else {
											$log.error( promise.Status.ERROR );
											reject( promise.Status.ERROR );
										}
									},
									function ( error ) {  // error
										$log.error( error );
										reject( error );
									}
								);
							}
						} else {
							$log.error( promise.Status.ERROR );
							reject( promise.status.ERROR );
						}
					},
					 function ( error ) { // error
						 $log.error( error );
						 reject( error );
					 }
				);
			} else {
				resolve( self.userAvatar );
			}
		});
	}

	function getUserMessages() {
		return $q( function( resolve, reject ) {
			if ( self.userMessages === null ) {
				self.userMessages = {};
				Index.getUserMessages(
					{APIKey: ApiKey.getApiKey() },
					function ( promise ) {
						if ( promise.Status.OK !== undefined ) {
							var messages = promise.Status.OK;

							// sort into messages
							angular.forEach(
								messages,
								function ( message ) {
									var character = message.Character.shortname;
									if ( self.userMessages[ character ] === undefined ) {
										self.userMessages[ character ] = {};
										self.userMessages[ character ].name = message.Character.name;
										self.userMessages[ character ].shortname = message.Character.shortname;
										self.userMessages[ character ].avatar = message.Character.path;
										self.userMessages[ character ].messages = [];
										self.userMessages[ character ].newTotal = 0;
									}
									self.userMessages[ character ].messages.push( message );
									if ( message.UserMessage.viewed === false ) {
										self.userMessages[ character ].newTotal++;
									}
								}
							);
							resolve( self.userMessages );
						} else {
							$log.error( promise.Status.ERROR );
							reject( promise.Status.ERROR );
						}
					},
					function ( error ) {
						$log.error( error );
						reject( error.status + ': ' + error.statusText );
					}
				);
			} else {
				resolve( self.userMessages );
			}
		});
	}

	function getUserGameActivity() {
		return $q( function( resolve, reject) {
			if ( self.userGameActivity === null ) {
				Index.getUserGameActivity(
					{ APIKey: ApiKey.getApiKey() },
					function ( promise ) {
						if ( promise.Status.OK !== undefined ) {
							self.userGameActivity = promise.Status.OK;
							self.userGameUnlocks = angular.copy( self.userGameActivity.UserGamesUnlocksAvailable );
							delete self.userGameActivity.UserGamesUnlocksAvailable;
							resolve( [ self.userGameActivity, self.userGameUnlocks ] );
						} else {
							$log.error( promise.Status.ERROR );
							reject( promise.Status.ERROR );
						}
					},
					function ( error ) {
						$log.error( error );
						reject( 'Failed with error code ' + error.status + ': ' + error.statusText );
					}
				);
			} else {
				resolve( [ self.userGameActivity, self.userGameUnlocks ] );
			}
		});
	}

	function getUserSubscriptions() {
		return $q( function( resolve, reject ) {
			if ( self.userSubscriptions === null ) {
				Index.getUserSubscriptions(
					{APIKey: ApiKey.getApiKey() },
					function ( promise ) {
						if ( promise.Status.OK !== undefined ) {
							self.userSubscriptions = promise.Status.OK;
							if ( angular.equals(self.userSubscriptions, [] ) === true ) {
								self.activeSubscription = null;
								self.activeSubscriptionType = null;
							} else {
								var subscriptionsDesc = $filter('orderBy')(self.userSubscriptions, '-UserSubscription.created', false );
								self.activeSubscription = subscriptionsDesc[0];
								self.activeSubscriptionType = self.activeSubscription.StoreType.name;
							}
							resolve( [ self.userSubscriptions, self.activeSubscription, self.activeSubscriptionType ] );
						} else {
							$log.error( promise.Status.ERROR );
							reject( promise.Status.ERROR );
						}
					},
					function ( error ) {
						$log.error( error );
						reject( error );
					}
				);
			} else {
				resolve ( [ self.userSubscriptions, self.activeSubscription, self.activeSubscriptionType ] );
			}
		});
	}

	function setUserAvatar(userAvatar) {
		self.userAvatar = userAvatar;
	}

	return {
		clearAllUserData: clearAllUserData,
		clearUserData: clearUserData,
		getUser: getUser,
		getUserAvatar: getUserAvatar,
		getUserMessages: getUserMessages,
		getUserGameActivity: getUserGameActivity,
		getUserSubscriptions: getUserSubscriptions,
		setUserAvatar: setUserAvatar
	};

});
