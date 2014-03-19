/**
 * Grunt build file.
 */

'use strict';

var path = require('path');

module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: ['build/', 'release/'],

    copy: {
      dist: {
        expand: true,
        cwd: 'src/',
        src: '**',
        dest: 'build/'
      },
      release: {
        expand: true,
        cwd: 'build/',
        src: '**',
        dest: 'release/'
      }
    },

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['src/jq-autocomplete.js', 'src/jq-autocomplete-angular.js'],
        dest: 'build/jq-autocomplete-angular-full.js',
      },
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        sourceMap: true,
      },
      build: {
        files: [{
          expand: true,
          src: ['**/*.js'],
          dest: 'build/',
          cwd: 'build/',
          ext: '.min.js'
        }]
      }
    },

    cssmin: {
      minify: {
        expand: true,
        files: {
          'build/<%= pkg.name %>.min.css': ['src/<%= pkg.name %>.css']
        }
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
    },

    exec: {
      prepareRelease: {
        cmd: 'git checkout -b release-v<%= pkg.version %> && git add -f release && git commit -m "release: add build files"'
      },
      cleanRelease: {
        cmd: 'git checkout master && git branch -D release-v<%= pkg.version %>'
      }
    },

    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'release: v%VERSION%',
        commitFiles: ['package.json', 'bower.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false
      }
    }
  });

  // Load clean task
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Load the plugin that provides the "concat" and "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Load cssmin task
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Load Karma Plugin that provides "karma" task
  grunt.loadNpmTasks('grunt-karma');

  // Load JsHint Plugin
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Load Npm Tasks used with express server
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-express');

  // Load copy task
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Load plugin used to create release
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-exec');

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
    'clean',
    'jshint',
    'karma:continuous',
    'copy:dist',
    'concat',
    'uglify',
    'cssmin:minify'
  ]);

  grunt.registerTask('release:minor', [
    'build',
    'copy:release',
    'exec:prepareRelease',
    'bump:minor',
    'exec:cleanRelease',
    'clean'
  ]);

  grunt.registerTask('release', [
    'build',
    'copy:release',
    'exec:prepareRelease',
    'bump',
    'exec:cleanRelease',
    'clean'
  ]);

  grunt.registerTask('default', ['build']);
};