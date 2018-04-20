'use strict';
app.controller(
  'accountController',
  [
    '$animate',
    '$location',
    '$log',
    '$mdDialog',
    '$mdMedia',
    '$scope',
    '$rootScope',
    'ApiKey',
    'Index',
    'User',
    'Storage',
    function (
        $animate,
        $location,
        $log,
        $mdDialog,
        $mdMedia,
        $scope,
        $rootScope,
        ApiKey,
        Index,
        User,
        Storage
    ) {
        var self = this;
        self.activeSubscription = null;
        self.activeSubscriptionIcon = 'blank';
        self.activeSubscriptionId = null;
        self.activeSubscriptionType = null;
        self.billingPeriod = '-1';
        self.cardNumber = null;
        self.expMonth = null;
        self.expYear = null;
        self.userGameActivity = null;
        self.userGameUnlocks = null;
        self.hasActivity = false;
        self.hasActiveSubscription = null;
        self.paymentCreditNumber = null;
        self.paymentCreditType = null;
        self.paymentExpMonth = null;
        self.paymentExpYear = null;
        self.paymentIcon = 'blank';
        self.paymentOption = null;
        self.securityCode = null;
        self.showUpdateForm = false;
        self.userId = null;
        self.daysLeft = null;
        self.state = true;
        self.style = {
            'border': '0px',
            'background-color': 'transparent',
            'font-size': '14px'
        };

        self.disableEditBillingInfo = function() {
            self.editBillingInfo = false;
        };
        self.enableEditBillingInfo = function() {
            self.editBillingInfo = true;
        };
        self.getLastPlayed = function( input ) {
            var lastPlayed = new Date ( input.replace(/-/g,'/') );
            return lastPlayed;
        };
        self.getLevel = function( input ) {
            if(input != null){
                return angular.fromJson( input ).level;
            }
        };
        self.getRefreshPeriod = function( input ) {
            var now = new Date();
            var expDate = new Date( input.UserSubscription.expiration.replace(/-/g,'/') );
            var timeDiff = Math.abs( expDate.getTime() - now.getTime() );

            return Math.ceil( timeDiff / (1000 * 3600 * 24) );
        };
        self.getScore = function( input ) {
            return angular.fromJson( input ).score;
        };
        self.isExpired = function( input ) {
            var now = new Date();
            var expDate = new Date( input.UserSubscription.expiration.replace(/-/g,'/') );
            return expDate < now;
        };
        self.toggleUpdateForm = function() {
            self.showUpdateForm = !self.showUpdateForm;
        };
        self.openDeleteDialog = function( ev ) {
                $mdDialog.show({
                    controller: 'DeleteUserController as deleteCtrl',
                    templateUrl: 'delete-template.html',
                    targetEvent: ev,
                    clickOutsideToClose: false,
                    locals: {
                        userId: $scope.userId,
                        logout: $scope.logout
                    }
                });
        };
        self.openUnsubscribeDialog = function( ev ) {
            $mdDialog.show({
                controller: 'DeleteUserController as deleteCtrl',
                templateUrl: 'unsubscribe-template.html',
                targetEvent: ev,
                clickOutsideToClose: false,
                locals: {
                    userId: $scope.userId,
                    logout: $scope.logout
                }
            });
        };
        self.openPasswordDialog = function(ev) {
            $mdDialog.show({
                controller: 'ChangePasswordController as changePasswordCtrl',
                templateUrl: 'password-template.html',
                targetEvent: ev,
                clickOutsideToClose: false,
                locals: {
                    logout: $scope.logout,
                    login: $scope.login
                }
            });
        };

        self.toggleState = function(){
            self.state = false;
            self.style = {
                'border-color': '#61D6FC',
                'font-size': '14px'
            };
        };

        self.updateUserInfo = function(ev, userName){
            self.state = true;
            self.style = {
                'border': '0px',
                'background-color': 'transparent',
                'font-size': '14px'
            };
                $scope.index.userInfo.User.name = userName;
            Index.updateUser(
                {
                    APIKey: ApiKey.getApiKey()
                },
                {
                    name: userName
                },
                Storage.saveLocalData('userInfo', $scope.index.userInfo)
            );
        };
        self.updateCardSubscription = function() {
            var cardInfo = {
                'store_type_id': 'W',
                'method': 'credit_card',
                'subscription_id': 1,
                'user_id': Number( self.userId ),
                'credit_card': {
                    'number': self.cardNumber,
                    'expiration': {
                        'month': self.expMonth,
                        'year': self.expYear
                    },
                    'cv2': self.securityCode
                }
            };
            Index.updateSubscription(
                {
                    APIKey: ApiKey.getApiKey(),
                    subscriptionId: self.activeSubscriptionId,
                },
                cardInfo,
                function( promise ){
                    //$log.debug( promise );
                },
                function( error ) {
                    //$log.error( error );
                }
            );
        };

        self.orderByDate = function () {
            console.log(1);
            return function (object) {
                return object.value.created;
            }
        }
		// redirect guest to bubblesU home if not logged in
        $animate.enabled(false);
        if ( ApiKey.isLoggedIn() === false ) {
				$location.path('/bubblesu');
		} else {
            User.getUserGameActivity().then(
                function ( gameActivityData ) {
                    self.hasActivity = !angular.equals( gameActivityData[0], {} );
                    self.userGameActivity = gameActivityData[0];
                    self.userGameUnlocks = gameActivityData[1];
                }
            );
            User.getUserSubscriptions().then(
                function( subscriptionData ) {
                    self.userSubscriptions = subscriptionData[0];
                    self.activeSubscription = subscriptionData[1];
                    self.activeSubscriptionType = subscriptionData[2];
                    if ( self.activeSubscription === null || self.isExpired( self.activeSubscription ) ) {
                        self.hasActiveSubscription = false;
                    } else {
                        self.hasActiveSubscription = true;
                    }
                    if ( self.hasActiveSubscription === true ) {
                        self.daysLeft = self.getRefreshPeriod( self.activeSubscription );
                        // if active subscription is through website
                        switch ( self.activeSubscription.UserSubscription.store_type_id ) {
                            case 'W':
                                if ( self.activeSubscription.PayPal !== undefined ) {
                                    if ( self.activeSubscription.PayPal.payment_info === 'credit_card' ) {
                                        self.paymentCreditType = self.activeSubscription.PayPal.credit_card.type;
                                        self.paymentCreditNumber = self.activeSubscription.PayPal.credit_card.number;
                                        self.paymentExpMonth = self.activeSubscription.PayPal.credit_card.expire_month;
                                        self.paymentExpYear = self.activeSubscription.PayPal.credit_card.year;
                                        self.activeSubscriptionType = 'Credit Card';
                                        self.activeSubscriptionIcon = 'credit_card';
                                    } else {
                                        self.activeSubscriptionType = 'PayPal';
                                        self.activeSubscriptionIcon = 'paypal';
                                    }
                                } else {
                                    self.activeSubscriptionIcon = 'free';
                                    self.activeSubscriptionType = 'Free';
                                }
                            break;
                            case 'A':
                                self.activeSubscriptionIcon = 'apple';
                            break;
                            case 'G':
                                self.activeSubscriptionIcon = 'google';
                            break;
                        }
                    }
                }
            );
		}
}])
.controller(
    'ChangePasswordController',
    function(
        $location,
        $log,
        $mdDialog,
        $rootScope,
        $scope,
        $timeout,
        ApiKey,
        Index,
        login,
        logout
    ) {
        var self = this;
        self.hasError = false;
        self.isChanging = false;
        self.message = '';
        self.newPassword = '';
        self.passwordError = '';
        self.showLoadingStars = false;
        self.verifyPassword = '';

        $scope.$watchGroup(
            ['changePasswordCtrl.newPassword', 'changePasswordCtrl.verifyPassword'],
            function( newValues, oldValues ) {
                var isValid = newValues[0] === newValues[1];
                self.passwordForm.verify.$setValidity('match', isValid);
            }
        );

        self.hide = function() {
            $mdDialog.hide();
        };
        self.cancel = function() {
            $mdDialog.cancel();
        };
        self.confirm = function() {
            $rootScope.hideLoader = true;
            self.isChanging = true;
            self.message = 'Changing Password...';
            self.showLoadingStars = true;

            Index.resetPassword (
                { APIKey: ApiKey.getApiKey() },
                { password: self.newPassword },
                function ( promise ) { // success
                    $rootScope.hideLoader = false;
                    if ( promise.Status.OK !== undefined ) {
                        self.message = 'Password successfully changed. Logging out in 3 seconds...';
                         var timer = $timeout(
                             function() {
                                 self.showLoadingStars = false;
                                 logout();
                                 login();
                                 $mdDialog.hide(true);
                             },
                             3000
                         );
                         $scope.$on(
                             '$destroy',
                             function(){
                                 $timeout.cancel(timer);
                             }
                         );
                    } else {
                        self.isChanging = false;
                        self.hasError = true;
                        self.passwordError = promise.Status.ERROR;
                        self.showLoadingStars = false;
                        $log.error( promise.Status.ERROR );
                    }
                },
                function ( error ) { // failure
                    $rootScope.hideLoader = false;
                    self.isChanging = false;
                    self.message = 'Unable to change password. Please try again later.';
                    $log.error( error );
                    self.requestFailed = true;
                    self.showLoadingStars = false;
                }
            );
        };
})
.controller(
    'DeleteUserController',
    function(
        $location,
        $log,
        $mdDialog,
        $rootScope,
        $scope,
        $timeout,
        ApiKey,
        Index,
        logout,
        userId
    ) {
        var self = this;
        self.confirmChecked = false;
        self.isDeleting = false;
        self.message = "";
        self.showLoadingStars = false;

        self.hide = function() {
            $mdDialog.hide();
        };
        self.cancel = function() {
            $mdDialog.cancel();
        };
        self.confirm = function() {
            $rootScope.hideLoader = true;
            self.isDeleting = true;
            self.message = 'Please wait, deactivating account...';
            self.requestFailed = false;
            self.showLoadingStars = true;

            Index.deactivateUser(
                {
                    APIKey: ApiKey.getApiKey()
                },
                {},
                function ( promise ) { //success
                    $rootScope.hideLoader = false;
                    self.showLoadingStars = false;
                    // clear all data and return to home page
                    if ( promise.Status.OK !== undefined ) {
                        self.message = 'Account successfully deactivated. Logging out in 3 seconds...';
                        var timer = $timeout(
                            function(){
                                logout();
                                $mdDialog.hide();
                            },
                            3000
                        );
                        $scope.$on(
                            '$destroy',
                            function(){
                                $timeout.cancel(timer);
                            }
                        );
                    } else {
                        self.isDeleting = false;
                        self.message = 'Unable to deactivate account: ' + promise.Status.error;
                        self.requestFailed = true;
                        $log.error( promise.Status.error );
                    }
                },
                function ( error ) {
                    $rootScope.hideLoader = false;
                    self.isDeleting = false;
                    self.message = 'Unable to deactivate account. Please try again later.';
                    $log.error( error );
                    self.requestFailed = true;
                    self.showLoadingStars = false;
                }
            );
        };
})
.filter('subActive', function(){
    return function( input ) {
        return input ? 'active' : 'inactive';
    };
})
.filter('viewFrom', function(){
    return function( input, age ) {
        if ( age == -1 ){
            return input;
        } else {
            var result = [];
            var today = new Date();
            var cutoff = new Date().setMonth( today.getMonth()-age );

            for(var i =0; i < input.length; i++){
                var inputSlash = input[ i ].UserSubscription.created.replace(/-/g,'/');
                var inputDate = new Date( inputSlash );
                if( inputDate > cutoff ){
                    result.push( input[ i ] );
                }
            }
            return result;
        }
    };
})
.filter('orderByDate', function() {
console.log(1);
    return function(items, field, reverse) {
        var filtered = [];
        angular.forEach(items, function(item) {
            filtered.push(item);
        });
        filtered.sort(function (a, b) {
            return (a[field] > b[field] ? 1 : -1);
        });
        if(reverse) filtered.reverse();
            return filtered;
    };
});
