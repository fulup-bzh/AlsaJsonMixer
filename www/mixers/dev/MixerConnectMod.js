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

var newModule = angular.module('ajg-mixer-connect', []);

// http://stackoverflow.com/questions/18368485/angular-js-resizable-div-directive
newModule.directive ('ajgMixerConnect', ["$log", '$timeout', '$http','$location','$route'
                   , function($log, $timeout, $http, $location, $route) {

    var template = '<div class="ajg-mixer-connect">'
        + '<div><i class="ajg-connect-title">{{title}}<i>'
        + '<ajg-monitor-status class="ajg-connect-status" icon={{icon}}"></ajg-monitor-status></div>'
        + '<div  ng-repeat="sndcard in sndcards">'
        + '<div  title="{{sndcard.info}}"  ng-click="selectCard(sndcard.index)">'
        + '<div class="row ajg-connect-sndcard">'
        + '<div class="small-10 columns">'
        + '<span class="ajg-connect-name"> {{sndcard.name}} </span>'
        + '</div>'
        + '<div class="small-1 columns">'
        + '<span class="ajg-connect-uid">  {{sndcard.uid}}  </span>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        ;

    function link (scope, element, attrs) {

        scope.getCards = function () {

            // send AJAX request to Alsa-Json-Gateway
            var query= {request:"get-cards"};
            var handler = $http.get('/alsa-json', {params: query});

            handler.success(function(response, errcode, headers, config) {
                scope.online = 1;
                scope.sndcards = response;
            });

            handler.error(function(status, errcode, headers) {
                scope.online = 0;
            });
        };

       // callback when user chose a sndcard
       scope.selectCard = function (index) {

           // build a mixer URI from sndcard short name. Use generic when no driver is avaliable
           var mixerpath = '/' + scope.sndcards [index].name.toLowerCase().replace(/ /g,'-');
           if (!mixerpath in $route.routes)  mixerpath = "/generic";
           $location.path (mixerpath).search('card',scope.sndcards [index].index);
       };

       scope.init = function () {
           // Provide some default for missing attributes
           scope.title     = attrs.title     || "Sound Cards @ Gateway";
           scope.icon      = attrs.icon; // default defined within MonitorGateway

           // request sound cards
           scope.getCards();

       };

       scope.init();
    }

    return {
        template: template,
        scope: {

        },
        restrict: 'E',
        link: link
    };
}]);

console.log ("Alsa Connect Module Initialized");

