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

 References: https://docs.angularjs.org/api/ng/directive/ngOptions


 $Id: $
 */


'use strict';

// Lazy Directive load
ngapp.addDirective ('scarlettMaster', ["$log",  scarlettMaster]);
function scarlettMaster($log) {

    function link(scope, element, attrs) {

        scope.selectElem = element[0].firstChild; // access set initial value manually to bypass Angular limitation

        // call when internal model value changes
        scope.initWidget = function (initvalues) {
            // $log.log("scarletteMaster initvalues=", initvalues);

            scope.switches= initvalues.switches;

            var volumes = [];
            for (var idx=0; idx < initvalues.volumes.length; idx ++) {
                volumes.push (scope.ProcessVolume(initvalues.volumes[idx], idx));
            }
            scope.volumes= volumes;

        };

        scope.ProcessVolume = function (channel, idx) {
            var volume = {

                name   : channel.name + " numid="+channel.numid,
                channel : {
                    numid  : channel.numid,
                    actif  : channel.actif,
                    idx    : idx,
                    count  : channel.ctrl.count
                },
                ctrl   : { // crtrl sub-obj maps with sliders initialisation API
                    value  : channel.value [0] || channel.value, // balance is not handle on master control
                    notLess: channel.ctrl.min,
                    notMore: channel.ctrl.max,
                    byStep : channel.ctrl.step
                }
                // channel: channel
                //tlv  : channel.tlv
                //acl  : channel.acl
            };
            return volume;
        };


        // call each time a volume slider moves
        scope.ActivateCtrlsCB = function (numid, values) {

            $log.log ("scarlettMaster CB numids=%j value=%d", [numid], values);
            scope.callback ([numid], values); // push request to ScarlettMixerMod values should be an array

        };

        // initialize widget
        scope.switchid  = attrs.id | "switch-" + parseInt (Math.random() * 1000);
        scope.$watch ('initvalues', function () { 	// init Values may arrive late
            if (scope.initvalues) scope.initWidget(scope.initvalues);
        });

    }

    return {
        templateUrl: "partials/scarlett-master.html",
        scope: {
            callback   : '=',
            initvalues : '='
        },
        restrict: 'E',
        link: link
    }
}

console.log ("stereo Scarlett Mixer Loaded");

