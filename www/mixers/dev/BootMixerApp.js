/*
 alsa-gateway -- provide a REST/HTTP interface to ALSA-Mixer

 Copyright (C) 2015, Fulup Ar Foll

 This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

 References:


 $Id: $
 */


'use strict';

var ngapp = angular.module('mixer-ui-app', [
        'ngRoute', 'ui-notification', 'bzm-range-slider', 'mm.foundation', 'ajm-knob-knob', 'ajm-playback-switch', 'ajm-register-numid'
        ,'ajm-mixer-connect', 'ajm-monitor-gateway', 'ajm-matrix-route','ajm-matrix-fader', 'ajm-master-volume', "ajm-matrix-label"
    ]
);

ngapp.config(['$routeProvider', '$locationProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
    function($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {

        // Hack for JS lazy load http://ify.io/lazy-loading-in-angularjs/
        ngapp.addController = $controllerProvider.register;
        ngapp.addDirective  = $compileProvider.directive;
        ngapp.routeProvider = $routeProvider;
        ngapp.filterProvider= $filterProvider;
        ngapp.provide       = $provide;   // https://docs.angularjs.org/api/auto/service/$provide

        $routeProvider.
            when('/', {
                templateUrl: 'partials/mixer-connect.html'
            }).
            when('/scarlett', {
                templateUrl: 'partials/scarlett-mixer.html',
                controller:  'ScarlettMixerController as Scarlett',
                resolve:  {
                    deps:function($q, $rootScope) {
                        var deferred = $q.defer();
                        var dependencies = [   // list JS to load this this route
                            '/mixers/dev/ScarlettMasterMod.js',
                            '/mixers/dev/ScarlettMixerMod.js',
                            '/mixers/dev/ScarlettCaptureMod.js'
                        ];

                        // dependencies are loaded so resolve the promise https://github.com/ded/script.js
                        $script (dependencies, function() {$rootScope.$apply(function() {deferred.resolve();});
                        });
                        return deferred.promise;
                    }}
            }).

            // aliases to sound cards [lowercase cardname, ' ' --> '-']
            when('/scarlett-18i8-usb', {redirectTo: '/scarlett'}).

            otherwise({redirectTo: '/'});

        // Warning HTML5 mode require to apply rewrite rules at server level
        // it also imposes to define in index.html <base href="/mixers/">
        // $locationProvider.html5Mode(true).hashPrefix('!');
    }]);
