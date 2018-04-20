'use strict';
angular
.module('App.storageService', [])
.factory(
    'Storage',
    function (localStorageService, STORAGE_MAX_AGE, $log) {

        var storageSupported = localStorageService.isSupported === true || localStorageService.cookie.isSupported === true;
        /**
         * Save Data in Local Storage if supported
         * @param {String} key
         * @param {any} data to store
         */
        function saveLocalData ( key, localData ) {
            if ( storageSupported === true ) {
                var localTimestamp = new Date().getTime();
                var saveData = {
                    data: localData,
                    timestamp: localTimestamp
                };
                return localStorageService.set( key, saveData );
            }
        }

        /**
         * Get data from Local Storage
         * @return {any|Boolean} false if no data, or data is old, Otherwise
         * return the data
         */
        function getLocalData ( key ) {
            if ( storageSupported === false ) {
                $log.info('Local Storage or Cookies not Supported');
                return false;
            }
            var localData = localStorageService.get( key );
            if ( localData === null || localData === undefined ) {
                return false;
            }
            if ( localData.data === null || localData.data === undefined ) {
                return false;
            }
            var localTimestamp = localData.timestamp;
            var now = new Date();
            var dataAge = now - localTimestamp;
            if ( dataAge >= STORAGE_MAX_AGE ) {
                return false;
            }

            return localData.data;
        }

        function saveApiKey( apiKey ) {
            if ( storageSupported === true ) {
                localStorageService.set( 'apiKey', apiKey );
            }
        }

        function getApiKey() {
            if ( storageSupported === false ) {
                $log.info('Local Storage or Cookies not Supported');
                return false;
            }
            var localApiKey = localStorageService.get( 'apiKey' );
            if ( localApiKey === null ){
                return false;
            }
            return localApiKey;
        }

		function clearAllLocalData() {
			if( storageSupported === true ){
                localStorageService.clearAll();
			}
		}

        return {
            saveLocalData: saveLocalData,
            getLocalData: getLocalData,
            saveApiKey: saveApiKey,
            getApiKey: getApiKey,
			clearAllLocalData: clearAllLocalData,
			storageSupported: storageSupported
        };
    }
);
