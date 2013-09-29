/**
 * Grunt build file.
 */

'use strict';

var path = require('path');

module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      },
      // continuous integration mode: run tests once in PhantomJS browser.
      continuous: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: [
          'PhantomJS'
        ]
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'src/*.js'
      ]
    },

    express: {
      server: {
        options: {
          port: 9001,
          bases: ['src', 'sample', 'components'],
          server: 'sample/server.js'
        }
      }
    },

    open: {
      server: {
        url: 'http://localhost:<%= express.server.options.port %>'
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load Karma Plugin that provides "karma" task
  grunt.loadNpmTasks('grunt-karma');

  // Load JsHint Plugin
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Load Npm Tasks used with express server
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-express');

  grunt.registerTask('server', [
    'express:server',
    'open:server',
    'express-keepalive'
  ]);

  grunt.registerTask('test', [
    'karma'
  ]);

  // Default task(s).
  grunt.registerTask('build', [
    'jshint',
    'karma:continuous',
    'uglify'
  ]);

  grunt.registerTask('default', ['build']);
};