(function () {
  appControllers.controller('loginCtrl', function ($scope, $state,UserService, ConfigurationService) {
    $scope.auth = {

    };
    $scope.validPhone = false;
    $scope.validSms = false;

    $scope.send =function(){
      if($scope.validPhone == false && $scope.auth.phoneNumber && $scope.auth.phoneNumber.length == 10 && $scope.auth.phoneNumber.indexOf('05')>=0){
        UserService.AuthPhone($scope.auth.phoneNumber)
          .then(function (user) {

            window.localStorage['user'] = angular.toJson(user);

            $scope.validPhone = true;
          }, function (err) {
          });
      }else if($scope.validPhone == true && $scope.validSms == false && $scope.auth.smsCode && $scope.auth.smsCode.length > 0){
        ConfigurationService.userDetails = null;
        var user = ConfigurationService.UserDetails();
        var confirm = {
          _id: user._id,
          activation_code: $scope.auth.smsCode
        }
        UserService.AuthConfirm(confirm)
          .then(function (user) {
            ConfigurationService.userDetails = null;
            window.localStorage['user'] = angular.toJson(user);
            debugger
            $scope.validSms = true;
          }, function (err) {
          });
      }
    }

    $scope.fbLogin = function () {
      console.log("fblogin")
      if (window.cordova) {
        UserService.FBlogin().then(function success(s) {
          window.localStorage['fbData'] = angular.toJson(s.authResponse);
          var fbData = s.authResponse;


          var user = ConfigurationService.UserDetails();
          var fb = {
            _id: user._id,
            fbToken: fbData['accessToken']
          }
          UserService.AuthFbLogin(fb)
            .then(function (user) {
              console.log("create")
              window.localStorage['user'] = angular.toJson(user);
              var ref = new Firebase("https://mustknow.firebaseIO.com");

              ref.authWithCustomToken(user.fireToken, function (error, authData) {

                if (error) {
                  console.log("Login Failed!", error);
                } else {
                  console.log("subjects")

                  $state.go("tab.subjects");
                }
              });
              $state.go("tab.subjects");
            }, function (err) {
              alert("error")
            });


        }, function error(msg) {
          console.log("Error while performing Facebook login", msg);
        })
      } else {
        var user = ConfigurationService.UserDetails();
        var fb = {
          _id: user._id,
          fbToken: 'EAAZAMbMtmoBIBACYVr0nJpC30WXRjESgN6dcEhO3vt3RVTpNGZCKZAMdLDg0wOhZBSyyHNGNSZCof2bDQoWHaS8HGvZAKqVoo4VKrEeEZBwVZBCHjGN1cxGzFuGbZCGOszsCL9iWm6WdprMlQoZAP8Ky4bmscznQZAvrNZCSYoK1s2fUEXACsIJZAiBMGRtpAA1gBZCd927kfKeiQDIlGnXLeI7mcz'
        }
        UserService.AuthFbLogin(fb)
          .then(function (user) {
            console.log("create")
            window.localStorage['user'] = angular.toJson(user);
            var ref = new Firebase("https://mustknow.firebaseIO.com");

            ref.authWithCustomToken(user.fireToken, function (error, authData) {

              if (error) {
                console.log("Login Failed!", error);
              } else {
                console.log("subjects")

                $state.go("tab.subjects");
              }
            });
            $state.go("tab.subjects");
          }, function (err) {
            alert("error")
          });

      }

    };

  });
})();
// End of facebook login controller.
