var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.sendfile('./sample/index.html');
});

app.get('/search', function(req, res) {
  var angular = {
    label: 'AngularJS',
    version: '1.1.5'
  };
  var backbone = {
    label: 'BackboneJS',
    version: '1.0.0'
  };
  var jquery = {
    label: 'jQuery',
    version: '1.8.3'
  };
  var underscore = {
    label: 'Underscore',
    version: '1.4.0'
  };
  var ember = {
    label: 'EmberJS',
    version: '1.0.0'
  };
  var jasmine = {
    label: 'jasmine',
    version: '1.3.1'
  };

  var query = req.query;
  var filter = query.filter.toLowerCase();

  var frameworks = [angular, backbone, ember, jasmine, jquery, underscore];

  var results = [];
  for (var i = 0, ln = frameworks.length; i < ln; ++i) {
    var framework = frameworks[i];
    if (framework.label.toLowerCase().indexOf(filter) >= 0) {
      results.push(framework);
    }
  }

  res.json(results);
});

module.exports = app;