openprojectApp.directive('sortHeader', ['I18n', 'PathHelper', function(I18n, PathHelper){

  var defaultSortDirection = 'asc';

  var Sortation = function(encodedSortation) {
    if (encodedSortation) {
      this.sortations = encodedSortation.split(',').map(function(sortParam) {
        fieldAndDirection = sortParam.split(':');
        return { field: fieldAndDirection[0], direction: fieldAndDirection[1] || defaultSortDirection};
      });
    } else {
      this.sortations = [];
    }
  };

  Sortation.prototype.getPrimarySortationCriterion = function() {
    return this.sortations.first();
  };

  Sortation.prototype.getDisplayedSortDirectionOfHeader = function(headerName) {
    var sortDirection, displayedSortation = this.getPrimarySortationCriterion();

    if(displayedSortation && displayedSortation.field === headerName) sortDirection = displayedSortation.direction;

    return sortDirection;
  };

  Sortation.prototype.getCurrentSortDirectionOfHeader = function(headerName) {
    var sortDirection;

    angular.forEach(this.sortations, function(sortation){
      if(sortation && sortation.field === headerName) sortDirection = sortation.direction;
    });

    return sortDirection;
  };

  Sortation.prototype.removeSortation = function(elementName) {
    index = this.sortations.map(function(sortation){
      return sortation.field;
    }).indexOf(elementName);

    if (index !== -1) this.sortations.splice(index, 1);
  };

  Sortation.prototype.addSortation = function(sortation) {
    this.removeSortation(sortation.field);

    this.sortations.unshift(sortation);
  };

  Sortation.prototype.getTargetSortationOfHeader = function(headerName) {
    var targetSortation = angular.copy(this);
    var targetSortDirection = this.getCurrentSortDirectionOfHeader(headerName) === 'asc' ? 'desc' : 'asc';

    targetSortation.addSortation({field: headerName, direction: targetSortDirection}, targetSortation);

    return targetSortation;
  };

  Sortation.prototype.encode = function() {
    return this.sortations.map(function(sortation){
      if (sortation.direction === 'asc') {
        return sortation.field;
      } else {
        return [sortation.field, sortation.direction].join(':');
      }
    }).join(',');
  };

  return {
    // TODO isolate and restrict to 'E' once https://github.com/angular/angular.js/issues/1459 is solved
    restrict: 'A',
    templateUrl: '/templates/work_packages/sort_header.html',
    scope: true,
    link: function(scope, element, attributes) {
      headerName = attributes['headerName'];

      sortation = new Sortation(scope.currentSortation);
      scope.sortation = sortation;
      targetSortation = sortation.getTargetSortationOfHeader(headerName);

      scope.headerTitle = attributes['headerTitle'];
      scope.sortable = attributes['sortable'];
      scope.I18n = I18n;
      scope.path = PathHelper.projectWorkPackagesPath(scope.projectIdentifier);

      scope.currentSortDirection = sortation.getDisplayedSortDirectionOfHeader(headerName);

      scope.queryString = 'set_filter=1&sort=' + targetSortation.encode();

    }
  };
}]);
