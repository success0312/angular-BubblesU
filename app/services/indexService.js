'use strict';
angular.module('App.indexService', []).factory('Index', function ($resource, ngAuthSettings) {
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    return $resource('',{},
    {
        login: {
            url: ngAuthSettings.apiServiceBaseUri + 'api/access/login.json',
            params: {
                messageId: '@messageId',
                APIKey: '@APIKey'
            },
            method: 'POST'
        },
        signup: {
            url: ngAuthSettings.apiServiceBaseUri + 'tle_users.json',
            method: 'POST'
        },
        heart: {
            url: ngAuthSettings.apiServiceBaseUri + 'hearts.json',
            method: 'POST'
        },
        unheart: {
            url: ngAuthSettings.apiServiceBaseUri + 'hearts/:heartId.json',
            method: 'DELETE'
        },
        referAFriend: {
            url: ngAuthSettings.apiServiceBaseUri + 'referrals/user_referrals.json?APIKey=:APIKey',
            method: 'POST'
        },
        getLocationByZipCode: {
            url: 'https://maps.googleapis.com/maps/api/geocode/json',
        },
        getLocations: {
            url: 'https://thelearningexperience.com/centers/api/near',
            headers: {
                'Content-Type': 'text/plain'
            },
            method: 'POST'
        },
        getUser: {
            url: ngAuthSettings.apiServiceBaseUri + 'api/user.json',
            method: 'GET'
        },
        getUserAvatar: {
            url: ngAuthSettings.apiServiceBaseUri + 'avatars/user_avatars.json?APIKey=:APIKey',
            method: 'GET'
        },
        getAllAvatars: {
            url: ngAuthSettings.apiServiceBaseUri + 'avatars/avatars.json',
            method: 'GET',
            cache: true
        },
        getUserMessages: {
            url: ngAuthSettings.apiServiceBaseUri + 'character_messages/user_messages.json',
            method: 'GET',
            cache: true
        },
        markRead: {
            url: ngAuthSettings.apiServiceBaseUri + 'character_messages/user_messages/:messageId.json?APIKey=:APIKey',
            method: 'PUT'
        },
        getUserSubscriptions: {
            url: ngAuthSettings.apiServiceBaseUri + 'subscriptions/user_subscriptions.json?APIKey=:APIKey',
            method: 'GET'
        },
        getUserGameActivity: {
            url: ngAuthSettings.apiServiceBaseUri + 'games/user_games.json?APIKey=:APIKey',
            method: 'GET'
        },
        getSubscriptionMethod: {
            url: ngAuthSettings.apiServiceBaseUri + 'subscriptions/:subscriptionId.json?APIKey=:APIKey',
            method: 'GET'
        },
        setUserAvatar: {
            url: ngAuthSettings.apiServiceBaseUri + 'avatars/user_avatars.json?APIKey=:APIKey',
            method: 'PUT'
        },
        createUserAvatar: {
            url: ngAuthSettings.apiServiceBaseUri + 'avatars/user_avatars.json?APIKey=:APIKey',
            method: 'POST'
        },
        updateSubscription: {
            url: ngAuthSettings.apiServiceBaseUri + 'subscriptions/:subscriptionId.json?APIKey=:APIKey',
            method: 'PUT'
        },
        updateUser: {
            url: ngAuthSettings.apiServiceBaseUri + 'tle_users/update.json?APIKey=:APIKey',
            method: 'POST'
        },
        subscribe: {
            url: ngAuthSettings.apiServiceBaseUri + 'subscriptions.json?APIKey=:APIKey',
            method: 'POST'
        },
        deactivateUser: {
            url: ngAuthSettings.apiServiceBaseUri + 'subscriptions.json?APIKey=:APIKey',
            method: 'DELETE'
        },
        resetPassword: {
            url: ngAuthSettings.apiServiceBaseUri + 'tle_users/reset.json?APIKey=:APIKey',
            method: 'POST'
        },
        forgotPassword: {
            url: ngAuthSettings.apiServiceBaseUri + 'tle_users/forgot.json',
            method: 'POST'
        },
        getBulletinSticker: {
            url: ngAuthSettings.apiServiceBaseUri + 'stickers.json',
            method: 'GET',
            cache: true
        }
    });
});
