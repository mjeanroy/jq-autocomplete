var express = require('express');
var qs = require('querystring');
var app = express();

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

var frameworks = [angular, backbone, ember, jasmine, jquery, underscore];

app.get('/', function(req, res) {
  res.sendfile('./sample/index.html');
});

app.get('/search', function(req, res) {
  var query = req.query;
  var filter = query.filter.toLowerCase();

  var results = [];
  for (var i = 0, ln = frameworks.length; i < ln; ++i) {
    var framework = frameworks[i];
    if (framework.label.toLowerCase().indexOf(filter) >= 0) {
      results.push(framework);
    }
  }

  res.json(results);
});

app.post('/frameworks', function(req, res) {
  var body = '';
  req.on('data', function (data) {
    body += data;
  });

  req.on('end', function () {
    var POST = qs.parse(body);
    var framework = {
      label: POST.name,
      version: POST.version
    };
    frameworks.push(framework);
    res.json(framework);
  });
});

module.exports = app;