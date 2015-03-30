/*globals module, require, process */
/*jslint vars:true */
module.exports = function (grunt) {
  'use strict';

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
      dist: {
        options: {
          outputStyle: 'compressed'
        },
        files: {
          '../public/sndcards/scarlett/css/alsa-mixer.css': ['scss/app.scss']
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
          '../public/sndcards/scarlett/js/alsa-mixer.js': ['js/*.js']
        }
      }
    },

    copy: {
      main: {
         files: [{
           expand: true,
           flatten: true,
           src:  'html/*.html',
           dest: '../public/sndcards/scarlett/html',
           filter: 'isFile'
         },{
           expand: true,
           flatten: true,
           src:  'js/*.js',
           dest: '../public/sndcards/scarlett/dev',
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
        files: ['html/*.html'],
        tasks: ['copy']
      }
    }
  });
};
