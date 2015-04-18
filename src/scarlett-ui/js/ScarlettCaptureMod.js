/*
 alsa-gateway -- provide a REST/HTTP interface to ALSA-Voler

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

 This module takes as input parse responses from ScarlettMixerMod.
 It refines parsing depending on UI config [number of group by tabs, stereo/mono, ...]
 This module is also in charge on receiving callback from UI as well as maintaining
 capture/volumes lines usage count.

 */


'use strict';


// Lazy Directive Load
ngapp.addDirective ('scarlettCapture', ["$log", "CtrlByNumid", scarletteCapture]);

function scarletteCapture($log, CtrlByNumid) {


    function link (scope, elem, attrs, model) {



        // manage capture and route line pools
        scope.updatePool=function (linesPool, lineIdx, used) {
            // change line usage status
            linesPool[lineIdx].used = used;

            // update select source options to disable used lines
            for (var idx=0; idx < linesPool[lineIdx].options.length; idx++) {
                linesPool[lineIdx].options[idx].disabled=used;
            }
        };

        scope.takeLinePool= function (linesPool, channel, lineIdx) {
            if (lineIdx !== channel.value) scope.callback ([channel.numid], [lineIdx]);
            if (lineIdx != 0 && !linesPool[lineIdx].used) scope.updatePool (linesPool, lineIdx, true);
        };

        scope.freeLinePool= function (linesPool, channel, lineIdx) {
            $log.log ("free pool", channel)
            if (lineIdx != 0) scope.updatePool (linesPool, lineIdx, false);
            if (lineIdx != 0) scope.callback ([channel.numid], [0]);
        };

        // parse input/output Source/Route params
        scope.ProcessRouteSource = function (line) {

            var params = {
                name:  line.name +' numid='+line.numid,
                actif: line.actif,
                numid: line.numid,
                value: line.value [0], // alsa place unique value within an array
                line:  line
            };
            return params;
        };

        scope.ProcessFader = function (channel, input, output, mix) {
            var fader = {

                name   : channel.name + " numid="+channel.numid,
                channel : {
                    numid  : channel.numid,
                    actif  : channel.actif,
                    idxin  : input,
                    idxout : output,
                    mixgrp : mix
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
            return fader;
        };


        // call when internal model value changes
        scope.initWidget = function(initvalues) {

            if (!initvalues) return; // make sure we have some data to work with

            // prepare array to pass date to widget
            var matrixSources = [];
            var matrixRoutes = [];
            var matrixMixVols = [];

            // reset Shared Pool
            scope.matrixSourcesPool = []; // inputs lines belongs to a common shared pool.
            scope.matrixRoutesPool  = []; // output lines belongs to a common shared pool.

            // use 1st Capture lines to collect enums [common/shared pool for all capture/sources]
            var sourceref = initvalues.sources[1].ctrl.enums;

            for (var idx=0; idx < sourceref.length; idx ++) {
                scope.matrixSourcesPool.push({id: idx, name: sourceref [idx], used: false, options: []});
            }

            // processing source capture routes
            for (var idx = 0; idx < initvalues.sources.length; idx = idx + scope.faderGroup) {

                var lines = [];
                var numids= [];
                var idxs= [];

                // group lines in mono/stereo
                for (var jdx = 0; jdx < scope.faderGroup; jdx ++) {
                    idxs.push (idx+jdx+1); // do not start line count at zero
                    numids.push (initvalues.sources[idx + jdx].numid);
                    lines.push(scope.ProcessRouteSource (initvalues.sources[idx + jdx]));
                }

                var linesgroup = {
                    uid  : "Numid" + JSON.stringify(numids),
                    label: "Capture " + JSON.stringify(idxs),
                    name : 'Capture Source ' + JSON.stringify(idxs),
                    matrixLinesPool: scope.matrixSourcesPool,
                    lines: lines
                };

                //$log.log ("[idx]", idx, "stereo line=", linesgroup)
                matrixSources.push(linesgroup);
            }
            
            // use 1st Route Playback lines to collect enums [global common/shared pool for all output/route]
            var routeref = initvalues.routes[1].ctrl.enums;
            for (var idx=0; idx < routeref.length; idx ++) {
                scope.matrixRoutesPool.push ({id: idx , name:  routeref [idx], used: false, options: []});
            };
            // $log.log ("matrixRoutesPool=", scope.matrixRoutesPool);

            // processing output route playback
            for (var idx = 0; idx < initvalues.routes.length; idx = idx + + scope.faderGroup) {

                var lines = [];
                var numids= [];
                var idxs= [];

                // group lines in mono/stereo
                for (var jdx = 0; jdx < scope.faderGroup; jdx ++) {
                    idxs.push (idx+jdx+1); // do not start line count at zero
                    numids.push (initvalues.routes[idx + jdx].numid);
                    lines.push(scope.ProcessRouteSource (initvalues.routes[idx + jdx]));
                }

                var linesgroup = {
                    uid: "Numid" + JSON.stringify(numids),
                    label: "Input " + JSON.stringify(idxs),
                    name: 'Playback Route ' + JSON.stringify(idxs),
                    matrixLinesPool: scope.matrixRoutesPool,
                    lines: lines
                };

                //log.log ("[idx]", idx, "stereo line=", linesgroup)
                matrixRoutes.push(linesgroup);
            }

            // group Matrix mix in mono/stereo output channel
            for (var idx = 0; idx < initvalues.mixes.length; idx = idx + scope.mixerGroup) {
                var mixname=[];
                var mixvols= [];

                // log.log ("volumes= ", initvalues.mixes[idx]);
                // build mix name
                for (var jdx = 0; jdx < scope.mixerGroup; jdx++) {
                    mixname.push (initvalues.mixes [idx+jdx].name);
                }
                //console.log ("1: idx=%d jdx=%d kdx=%d kdx=%d", idx, jdx, kdx, kdx);

                // for each mixer within a mixer group
                for (var jdx= 0; jdx < initvalues.mixes[idx].volumes.length; jdx += scope.faderGroup) {
                   var fadergroup=[];

                    //console.log ("2: idx=%d jdx=%d kdx=%d kdx=%d", idx, jdx, kdx, kdx);

                    // group faders within a given mixer group
                    for (var kdx = jdx; kdx < jdx + scope.faderGroup; kdx++) {
                        //console.log ("3: idx=%d jdx=%d kdx=%d zdx=%d", idx, jdx, kdx, zdx);

                        // scan fader line within each group
                        var mixergroup=[];
                        for (var zdx = idx; zdx < (idx+scope.mixerGroup); zdx++) {
                            //console.log ("4: idx=%d jdx=%d kdx=%d zdx=%d", idx, jdx, kdx, zdx);

                            // within groups loop on fader lines and build input/output channel index
                            mixergroup.push(scope.ProcessFader (initvalues.mixes [zdx].volumes[kdx], kdx-jdx, zdx-idx, idx));
                            //$log.log (" mixergroup.push=", scope.ProcessFader (initvalues.mixes [zdx].volumes[kdx], kdx-jdx, zdx-idx))
                        }
                        fadergroup.push (mixergroup);
                    }

                   mixvols.push (fadergroup);
                }

                // build Mixgroup object
                var linesgroup = {
                    name  : "Mix:" + mixname.toString(),
                    mixvol : mixvols
                };

                // $log.log ("linesgroup=", linesgroup);
                matrixMixVols.push (linesgroup);
            }

            // update scope in one big chunk to avoid flickering
            scope.matrixSources = matrixSources;
            scope.matrixRoutes  = matrixRoutes;
            scope.matrixMixVols = matrixMixVols;

            //$log.log ("matrixSources=" , matrixSources);
            //$log.log ("matrixRoutes="  , matrixRoutes);
            //$log.log ("matrixMixVolsMix=" , matrixMixVols);
        }; // end init widget


        // A new Mix tab was selected, refresh sliders within this grouptab
        scope.TabSelected = function (index)  {
            var groupTab = index* scope.mixerGroup;
            CtrlByNumid.refreshPool (groupTab);
        };

        // Pool callback handle get/put operation on line route sources
        scope.MatrixPoolCB = {
           take: function (pool, channel, lineIdx) {scope.takeLinePool (pool, channel, lineIdx)} ,
           free: function (pool, channel, lineIdx) {scope.freeLinePool (pool, channel, lineIdx)}
        };

        // call each time a volume slider moves
        scope.ActivateCtrlsCB = function (numids, value) {
            scope.callback (numids, [value]); // push request to ScarlettMixerMod values should be an array
        };

        scope.mixerGroup = parseInt (attrs.mixerGroup) || 2;
        scope.faderGroup = parseInt (attrs.faderGroup) || 2;
        scope.$watch ('initvalues', function () { 	// init Values may arrive late
            if (scope.initvalues) scope.initWidget(scope.initvalues);
        });
    };

    return {
        templateUrl: "partials/scarlett-capture.html",
        scope: {
            callback  : '=',
            initvalues : '='
        },
        restrict: 'E',
        link: link
    };
};

console.log ("Scarlett Capture directive Loaded");

