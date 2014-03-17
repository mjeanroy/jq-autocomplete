/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 mickael.jeanroy@gmail.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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
