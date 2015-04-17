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

var newModule = angular.module('ajm-mixer-connect', []);

// http://stackoverflow.com/questions/18368485/angular-js-resizable-div-directive
newModule.directive ('mixerConnect', ["$log", '$timeout', '$http','$location','$route'
                   , function($log, $timeout, $http, $location, $route) {

    var template = '<div class="ajm-mixer-connect">'
        + '<div><i class="ajm-connect-title">{{title}}<i>'
        + '<monitor-status class="ajm-connect-status" icon={{icon}}"></monitor-status></div>'
        + '<div  ng-repeat="sndcard in sndcards">'
        + '<div  title="{{sndcard.info}}" ng-click="selectCard($index)"> '
        + '<div class="row ajm-connect-sndcard ajm-{{sndbrand (sndcard)}}">'
        + '<div class="small-10 columns">'
        + '<span class="ajm-connect-name"> {{sndcard.name}} </span>'
        + '</div>'
        + '<div class="small-1 columns">'
        + '<span class="ajm-connect-uid">  {{sndcard.devid}}  </span>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        ;

    function link (scope, element, attrs) {

        scope.sndbrand = function (sndcard) {
            var brand = sndcard.name.split (' ') [0];
            return brand.toLowerCase();
        };

        scope.getCards = function () {

            // send AJAX request to Alsa-Json-Gateway
            var query= {request:"card-get-all"};
            var handler = $http.get('/jsonapi', {params: query});

            handler.success(function(response, errcode, headers, config) {

                // check if response is valid
                if (response.ajgtype != "AJG_sndlist") {
                    alert ("AJM:FATAL ajm-mixer-connect response=" +  response);
                    return;
                }

                scope.online = 1;
                scope.sndcards = response.data;
            });

            handler.error(function(status, errcode, headers) {
                scope.online = 0;
            });
        };

       // callback when user chose a sndcard
       scope.selectCard = function (index) {

           if (index == undefined) {
               alert ("AJM:Fatal invalid sndcard index [please report bug]");
               return;
           }

           // build a mixer URI from sndcard short name. Use generic when no driver is avaliable
           var mixerpath = '/' + scope.sndcards [index].name.toLowerCase().replace(/ /g,'-');
           if (!mixerpath in $route.routes)  mixerpath = "/generic";
           $location.path (mixerpath).search('card', "hw:" + scope.sndcards[index].cardid);
       };


       // Provide some default for missing attributes
       scope.title     = attrs.title     || "Sound Cards @ Gateway";
       scope.icon      = attrs.icon; // default defined within MonitorGateway

       // request sound cards
       scope.getCards();

    }

    return {
        template: template,
        scope: {

        },
        restrict: 'E',
        link: link
    };
}]);

console.log ("Mixer Connect Loaded");

