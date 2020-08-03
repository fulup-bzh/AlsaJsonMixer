/*globals module, require, process */
/*jslint vars:true */
module.exports = function (grunt) {
  'use strict';

  const sass = require('node-sass');
  // Default task.
  grunt.registerTask('build',   ['sass','uglify','copy']);
  grunt.registerTask('default', ['build','watch']);

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('../package.json'),


    // SASS plugin is used for CSS
    sass: {
      options: {
        implementation: sass
      },
      dist: {
        options: {
          outputStyle: 'compressed'
        },
        files: {
          '../../www/mixers/css/common-mixer.css': ['scss/app.scss']
        }
      }
    },

    uglify: {
      options: {
        compress: {
          drop_console: true
        }
      },
      target: {
        files: {
          '../../www/mixers/js/common-mixer.js': ['js/*.js']
        }
      }
    },

    copy: {
      main: {
         files: [{
           expand: true,
           flatten: true,
           src:  ['ajg','*html'],
           dest: '../../www/mixers',
           filter: 'isFile'
         },{
           expand: true,
           flatten: true,
           src:  'html/*.html',
           dest: '../../www/mixers/partials',
           filter: 'isFile'
         },{
           expand: true,
           flatten: true,
           src:  'images/*',
           dest: '../../www/mixers/images',
           filter: 'isFile'
         },{
           expand: true,
           flatten: true,
           src:  'js/*.js',
           dest: '../../www/mixers/dev',
           filter: 'isFile'
         }]
      }
    },

    watch: {
      grunt: {
        files: ['Gruntfile.js'],
        task: ['build']
      },
      sass: {
        files: ['scss/*.scss'],
        tasks: ['sass']
      },
      uglify: {
        files: ['js/*.js'],
        tasks: ['uglify']
      },
      copy: {
        files: ['html/*.html','js/*.js','ajg','images/*'],
        tasks: ['copy']
      }
    }
  });
};
