app.directive('formioSelectItem', [
  '$compile',
  function(
    $compile
  ) {
    return {
      restrict: 'E',
      scope: {
        template: '=',
        item: '=',
        select: '='
      },
      link: function(scope, element) {
        if (scope.template) {
          element.html($compile(angular.element(scope.template))(scope));
        }
      }
    };
  }
]);

// Configure the Select component.
app.config([
  'formioComponentsProvider',
  function(formioComponentsProvider) {
    formioComponentsProvider.register('select', {
      title: 'Select',
      template: function($scope) {
        return $scope.component.multiple ? 'formio/components/select-multiple.html' : 'formio/components/select.html';
      },
      controller: function(settings, $scope, $http, Formio) {
        $scope.nowrap = true;
        $scope.selectItems = [];
        var valueProp = $scope.component.valueProperty;
        $scope.getSelectItem = function(item) {
          return valueProp ? item[valueProp] : item;
        };

        if (settings.dataSrc.substr(0, 1) === '/') {
          settings.dataSrc = Formio.baseUrl + settings.dataSrc;
        }

        // If this is a url, then load the file.
        if (settings.dataSrc.substr(0, 4) === 'http') {
          $http.get(settings.dataSrc)
            .success(function(data) {
              $scope.selectItems = data;
            });
        }
        else if (settings.dataSrc) {
          try {
            $scope.selectItems = angular.fromJson(settings.dataSrc);
          }
          catch (error) {
            $scope.selectItems = [];
          }
        }
      },
      settings: {
        input: true,
        label: '',
        key: '',
        placeholder: '',
        dataSrc: '',
        valueProperty: '',
        template: '<span>{{ item }}</span>',
        multiple: false,
        refresh: false,
        refreshDelay: 0,
        protected: false,
        unique: false,
        persistent: true
      }
    });
  }
]);
app.run([
  '$templateCache',
  function($templateCache) {
    $templateCache.put('formio/components/select.html',
      '<label ng-if="component.label" for="{{ component.key }}">{{ component.label }}</label>' +
      '<ui-select ng-model="data[component.key]" id="{{ component.key }}" theme="bootstrap">' +
        '<ui-select-match placeholder="{{ component.placeholder }}">' +
          '<formio-select-item template="component.template" item="$item || $select.selected" select="$select"></formio-select-item>' +
        '</ui-select-match>' +
        '<ui-select-choices repeat="getSelectItem(item) as item in selectItems | filter: $select.search">' +
          '<formio-select-item template="component.template" item="item" select="$select"></formio-select-item>' +
        '</ui-select-choices>' +
      '</ui-select>'
    );

    // Change the ui-select to ui-select multiple.
    $templateCache.put('formio/components/select-multiple.html',
      $templateCache.get('formio/components/select.html').replace('<ui-select', '<ui-select multiple')
    );
  }
]);