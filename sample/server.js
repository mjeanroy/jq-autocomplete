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

  var frameworks = [angular, backbone, jquery, underscore];
  res.json(frameworks);
});

module.exports = app;