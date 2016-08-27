(function () {
  appControllers.controller('subjectsCtrl', function ($scope, $ionicModal, $ionicPlatform, $rootScope, $state, $interval, $stateParams, $timeout, SubjectService, EntityService, UserService, MessagesService, ConfigurationService) {
    $scope.isExpanded = true;
    $rootScope.isHeaderExpanded = false;
    $scope.subjects = [];
    SubjectService.GetCategories()
      .then(function (categories) {
      }, function (err) {
      });
    $ionicPlatform.ready(function () {
      if (window.cordova && typeof window.plugins.OneSignal != 'undefined' && !ConfigurationService.Notification_token()) {
        $timeout(function () {
          window.plugins.OneSignal.getIds(function (ids) {

            UserService.RegisterNotification(ids.userId)
              .then(function (userToken) {
                ConfigurationService.SetNotification_token(userToken);
              }, function (err) {
              });
          });
        }, 5000)
      }
    });

    $scope.checkUndreadMessage = function () {
      return MessagesService.checkUndreadMessage();
    }
    $scope.doRefresh = function () {
      $scope.$broadcast('scroll.refreshComplete');
      SubjectService.GetSubjects(false)
        .then(function (subjects) {
          $scope.subjects = subjects;
        }, function (err) {
        });
    }
    var stopTime = $interval($scope.doRefresh, 10000);
    $scope.$on("$destroy", function () {
      if (stopTime) {
        $interval.cancel(stopTime);
      }
    });
    $scope.doRefresh();


    $scope.goToChat = function (subject) {

      var userName = subject.user.first_name + " " + subject.user.last_name;
      var messageDetails = {
        conversationId: subject.user._id + "-" + subject._id,
        userName: userName,
        subjectName: subject.title,
        fbPhotoUrl: subject.user.fbPhotoUrl
      }
      EntityService.setMessageDetails(messageDetails);
      $state.go('chat')
    }
    $scope.goToUserProfile = function (subject) {
      //
      //var userName = subject.user.first_name + " " + subject.user.last_name;
      //var messageDetails = {
      //  conversationId: subject.user._id + "-" + subject._id,
      //  userName: userName,
      //  subjectName: subject.title,
      //  fbPhotoUrl: subject.user.fbPhotoUrl
      //}
      //EntityService.setMessageDetails(messageDetails);
      $state.go('userProfile', {userId: subject.user._id, first_name: subject.user.first_name})
    }
    $scope.goToFilter = function () {
      $scope.modal.show();
    }
    $scope.goToMessages = function () {
      $state.go('tab.messages');
    }
    $scope.goToAddSubject = function () {
      $state.go('addSubject');
    }

    $ionicModal.fromTemplateUrl('templates/subjects/html/filter.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
      console.log("$destroy")
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      console.log("modal hiden");
      $rootScope.myFilter.categories = [];
      SubjectService.GetCategories()
        .then(function (categories) {
          $scope.categories = categories;
          angular.forEach($scope.categories, function (value, key) {
            if (value.is_selected) {
              $rootScope.myFilter.categories.push(value._id)
            }
          });
          ConfigurationService.SetMyFilter($rootScope.myFilter);
          $scope.doRefresh();
        }, function (err) {
        });

    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      console.log("removed");
    });
  })
  appControllers.controller('addSubjectCtrl', function ($scope, $state, SubjectService, $stateParams, $filter, $ionicHistory, ConfigurationService) {
    $scope.isExpanded = true;
    $scope.failed = false;

    $scope.subject = {};
    $scope.categories = [];
    $scope.categoriesUrl = ConfigurationService.CategoriesUrl();
    $scope.initialForm = function () {

      $scope.subject = {
        title: '',
        user: ConfigurationService.UserDetails()._id,
        description: ''
      }
      SubjectService.GetCategories()
        .then(function (categories) {
          $scope.categories = categories;
        }, function (err) {
        });

    };
    $scope.createSubjectSetp = function (category) {
      $state.go('tab.addSubject-s2', {categoryId: category._id})
    }
    $scope.createSubject = function () {
      if ($scope.subject.title.length <= 0 || $scope.subject.description.length <= 0) {
        $scope.failed = true;
        return;
      }
      $scope.subject.category = $state.params.categoryId;

      SubjectService.CreateSubject($scope.subject)
        .then(function () {
          $state.go("app.subjects");
        }, function (err) {
        });
    }


    $scope.initialForm();
  });
  appControllers.controller('filterCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicHistory, SubjectService, ConfigurationService) {
    $scope.categoriesUrl = ConfigurationService.CategoriesUrl();

    $scope.setGender =function(gender){
      $rootScope.myFilter.gender = gender;
    }

    $scope.selectCategory = function (categoryIndex) {
      if($scope.categories[categoryIndex].is_selected)
        $scope.categories[categoryIndex].is_selected = false;
      else
        $scope.categories[categoryIndex].is_selected = true;
    }
    $scope.initialForm = function () {
      SubjectService.GetCategories()
        .then(function (categories) {
          $scope.categories = categories;
          for (var i = 0; i < $scope.categories.length; i++) {
            if ($rootScope.myFilter.categories.indexOf($scope.categories[i]._id) !== -1) {
              $scope.categories[i].is_selected = true;
            }
          }
        }, function (err) {
        });

      $rootScope.myFilter = ConfigurationService.MyFilter();
      if (!$rootScope.myFilter.gender) {
        $rootScope.myFilter = {
          nearMe: false,
          gender: 'both',
          categories: []
        }
        ConfigurationService.SetMyFilter($rootScope.myFilter);
      }

    };// End initialForm.
    $scope.initialForm();
  });// End of Notes Detail Page  Controller.

})();
