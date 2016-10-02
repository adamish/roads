requirejs.config({
  baseUrl : 'js',
});

require([ 'config' ], function() {
  require([ 'view/road-table-view', 'model/roads', 'model/traffic', 'jquery' ], function(RoadTableView, Roads, Traffic, $) {
    $(document).ready(function() {
      var roads = new Roads();
      var traffic = new Traffic();
      $('body').append(new SpeedChartView({
        roads : roads
      }).render().$el);
      roads.fetch();
      $('#loading').hide();
    });
  });
});
