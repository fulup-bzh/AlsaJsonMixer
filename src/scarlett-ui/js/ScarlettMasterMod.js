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
            scope.matrixPlaybackPool = []; // global share playback Master source route pool
            scope.clockSourcesPool  = [];   // unique but uses matrix-source that require a pool
            scope.usbSourcesPool    = [];   // Unique but uses matrix-source that require a pool

            scope.idxcounter = 1;  // start 1st switch label at one
            var enumerations;
            //$log.log("scarletteMaster initvalues=", initvalues);

            // switches are simple and UI take them as they are
            scope.switches= initvalues.switches;

            // process volumes to fit with volumes knob-knob buttons
            var volumes = [];
            for (var idx=0; idx < initvalues.volumes.length; idx ++) {
                volumes.push (scope.ProcessVolume(initvalues.volumes[idx], idx));
            }
            scope.volumes= volumes;

            // Extract ENUM option for Master Playback Source Route
            enumerations  = initvalues.sources[0].ctrl.enums;
            for (var idx=0; idx < enumerations.length; idx ++) {
                scope.matrixPlaybackPool.push ({id: idx , name:  enumerations [idx], used: false, options: []});
            }

            // Process Playback Source Matrix Route
            var sources = [];
            for (var idx=0; idx < initvalues.sources.length; idx ++) {
                sources.push (scope.ProcessSource(initvalues.sources[idx], scope.matrixPlaybackPool));
            }
            scope.playSources= sources;
            //$log.log ("master playback sources=", sources);

            // Process Source Clock switch
            enumerations  = initvalues.switches.clock.ctrl.enums;
            for (var idx=0; idx <  enumerations.length; idx ++) {
                scope.clockSourcesPool.push ({id: idx , name:   enumerations [idx], used: false, options: []});
            }
            scope.clockSources = scope.ProcessSource (initvalues.switches.clock, scope.clockSourcesPool);
            //$log.log ("master clockswitch=", scope.clockSources);

            // Process Source Usb switch
            enumerations  = initvalues.switches.usb.ctrl.enums;
            for (var idx=0; idx <  enumerations.length; idx ++) {
                scope.usbSourcesPool.push ({id: idx , name:   enumerations [idx], used: false, options: []});
            }
            scope.usbSources = scope.ProcessSource (initvalues.switches.usb,  scope.usbSourcesPool);
            //$log.log ("master usbswitch=", scope.usbSources);

            // Check Sync Status and display result on UI
            scope.syncstatus = initvalues.switches.syncon.value[0];

        };

        // Each line of channel playback can be reused not need to update pool
        scope.takeLinePool= function (linesPool, channel, lineIdx) {
            if (lineIdx !== channel.value) scope.callback ([channel.numid], [lineIdx]);
        };

        scope.freeLinePool= function (linesPool, channel, lineIdx) {
            if (lineIdx != 0) scope.callback ([channel.numid], [0]);
        };

        // Prepare Enum selectable control to be handle by matrix-route with a share pool
        scope.ProcessSource = function (line, linepool) {
            // $log.log ("ProcessSource", line);

            var name = line.name.split (' ');
            var sourceroute = {
                label: name [1] + "-" + name [2],
                uid: "SrcId:" + line.numid,
                matrixLinesPool: linepool,
                lines: [{
                    actif: line.actif,
                    numid: line.numid,
                    name: line.name + " numid=" + line.numid,
                    value: line.value[0],
                    line : line
                    }]
                };
            return sourceroute;
        };


        scope.ProcessVolume = function (channel, idx) {
            // $log.log ("ProcessVolume", channel)
            var volume = {

                channel : {
                    idx    : idx,
                    actif  : channel.actif,
                    count  : channel.ctrl.count,
                    numid  : channel.numid,
                    name  : channel.name + " numid=" +channel.numid,
                    uid    : "VolId:" + channel.numid
                },
                ctrl   : { // crtrl sub-obj maps with sliders initialisation API
                    value  : channel.value,
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

            scope.callback ([numid], values); // push request to ScarlettMixerMod values should be an array

        };

        // initialize widget
        scope.switchid  = attrs.id | "switch-" + parseInt (Math.random() * 1000);
        scope.$watch ('initvalues', function () { 	// init Values may arrive late
            if (scope.initvalues) scope.initWidget(scope.initvalues);
        });

        scope.MatrixPoolCB = {
            take: function (pool, channel, lineIdx) {scope.takeLinePool (pool, channel, lineIdx)} ,
            free: function (pool, channel, lineIdx) {scope.freeLinePool (pool, channel, lineIdx)}
        };

    }

    return {
        templateUrl: "partials/scarlett-master.html",
        scope: {
            callback   : '=',
            initvalues : '=',
            syncstatus : '='
        },
        restrict: 'E',
        link: link
    }
}

console.log ("stereo Scarlett Mixer Loaded");

