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

// this module is load statically before any route is cativated
var newModule = angular.module('ajm-master-volume', []);

// http://stackoverflow.com/questions/18368485/angular-js-resizable-div-directive
newModule.directive ('masterVolume', ["$log",  ajgMasterVolume]);
function ajgMasterVolume ($log) {

    var template = '<div class="ajm-master-volume"> '
        + '<p class="ajm-volume-title">"{{panelTitle}}"</p>'
        + '<knob-knob ng-repeat="volume in volumes"  title="{{volume.channel.name}}" callback="callback" '
        + '  class="ajm-volume-knob valuecount-{{volume.channel.count}}" initvalues="volume"></knob-knob>'
        + '</div>';

    function link (scope, elem, attrs) {

        // call when internal model value changes
        scope.initWidget = function (initvalues) {

            if (initvalues === undefined) return;
            // $log.log("master-volume init=", initvalues);

            if (initvalues.numid > 200) $log.log("master-volume init=", initvalues);
            scope.volumes = initvalues;
        };

        // initialize widget
        scope.masterid = attrs.id | "master-" + parseInt(Math.random() * 1000);
        scope.$watch('initvalues', function () { 	// init Values may arrive late
            if (scope.initvalues) scope.initWidget(scope.initvalues);
        });

        scope.panelTitle = attrs.panelTitle || "Volumes";
    }
    return {
        template: template,
        scope: {
            callback   : "=",
            initvalues : "="
        },
        restrict: 'E',
        link: link
    }
}

console.log ("Master Volume Loaded");

