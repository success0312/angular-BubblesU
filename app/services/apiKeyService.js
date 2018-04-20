'use strict';
angular.module('App.apiKeyService', []).factory('ApiKey', function ($resource, $log, ngAuthSettings, Storage) {
	var self = this;
	self.apiKey = null;
	function getApiKey() {
		if (self.apiKey === null) {
			self.apiKey = Storage.getApiKey();
		}
		return self.apiKey;
	}
	function saveApiKey(key) {
		if ( key ) {
			self.apiKey = key;
			Storage.saveApiKey(self.apiKey);
		}
	}
	function clearApiKey(){
		self.apiKey = null;
	}
	function isLoggedIn() {
		if ( self.apiKey === null || self.apiKey === false ){
			return false;
		} else {
			return true;
		}
	}
	return {
		getApiKey: getApiKey,
		saveApiKey: saveApiKey,
		clearApiKey: clearApiKey,
		isLoggedIn: isLoggedIn
	};
});