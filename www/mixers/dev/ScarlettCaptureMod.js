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

 References:


 $Id: $
 */


'use strict';


// var newModule = angular.module('ajg-monitor-gateway', []);

ngapp.addDirective ('scarlettCapture', ["$log",  scarletteCapture]);

function scarletteCapture($log) {


    function link (scope, elem, attrs, model) {

        scope.matrixSourcesPool = []; // inputs lines belongs to a common shared pool.
        scope.matrixRoutesPool  = []; // output lines belongs to a common shared pool.

        // manage capture and route line pools
        scope.updatePool=function (linesPool, lineIdx, used) {
            // change line usage status
            linesPool[lineIdx].used = used;

            // update select source options to disable used lines
            for (var idx=0; idx < linesPool[lineIdx].options.length; idx++) {
                linesPool[lineIdx].options[idx].disabled=used;
            }
        };
        scope.takeLinePool= function (linesPool, lineIdx) {
            if (lineIdx == 0 || linesPool[lineIdx].used) return;
            scope.updatePool (linesPool, lineIdx, true);
        };
        scope.freeLinePool= function (linesPool, lineIdx) {
            if (lineIdx == 0) return;
            scope.updatePool (linesPool, lineIdx, false);
        };

        // parse input/output Source/Route params
        scope.ProcessRouteSource = function (line) {

            var params = {
                name:  line.name,
                actif: line.actif,
                numid: line.numid,
                value: line.value,
                line:  line
            };
            return params;
        };

        scope.ProcessFader = function (channel) {
            var fader = {
                numid  : channel.numid,
                actif  : channel.actif,
                value  : channel.value[0],
                notLess: channel.ctrl.min,
                notMore: channel.ctrl.max,
                byStep : channel.ctrl.step,
                //tlv  : channel.tlv
                //acl  : channel.acl
            };
            return fader;
        };

        // parse Matrix Playback and Route to create a mono volume matrix mix
        scope.ProcessStereoMix = function (leftMix, rightMix) {

            var volumeMix = [];

            // processing playback volumes both channel should have the same length
            for (var idx = 0; idx < leftMix.volumes.length; idx = idx + 2) {

                var stereoMix = {
                    leftMix: {
                        title  : leftMix.volumes [idx].name, // use left mix name
                        leftFader:  scope.ProcessFader (leftMix.volumes [idx]),
                        rightFader: scope.ProcessFader (leftMix.volumes [idx])
                    },
                    rightMix: {
                        title  : leftMix.volumes [idx+1].name, // use left mix name
                        leftFader:  scope.ProcessFader (rightMix.volumes [idx]),
                        rightFader: scope.ProcessFader (rightMix.volumes [idx])
                    }
                };
                volumeMix.push(stereoMix);
            }
            return volumeMix;
        };
        
        // call when internal model value changes
        model.$formatters.unshift(function(modelvalue) {

            if (!modelvalue) return; // make sure we have some data to work with

            // prepare array to pass date to widget
            var matrixSources = [];
            var matrixRoutes = [];
            var matrixMixVols = [];

            // use 1st Capture lines to collect enums [common/shared pool for all capture/sources]
            var sourceref = modelvalue.sources[1].ctrl.enums;
            for (var idx=0; idx < sourceref.length; idx ++) {
                scope.matrixSourcesPool.push({id: idx, name: sourceref [idx], used: false, options: []});
            };

            // processing input capture lines
            for (var idx = 0; idx < modelvalue.sources.length; idx = idx + 2) {

                var leftLine  = modelvalue.sources [idx];
                var rightLine = modelvalue.sources [idx + 1];
                var label = '[' + (idx + 1) + '/' + (idx + 2) + ']';
                var stereolines = {
                    uid: leftLine.numid + '-' + rightLine.numid,
                    title: "Stereo Capture Line " + label,
                    label: 'Line ' + label,
                    name: 'Capt ' + label,
                    matrixLinesPool: scope.matrixSourcesPool,
                    leftLine : scope.ProcessRouteSource(leftLine),
                    rightLine: scope.ProcessRouteSource(rightLine)
                };

                //$log.log ("[idx]", idx, "stereo line=", stereolines)
                matrixSources.push(stereolines);
            }
            
            // use 1st Route lines to collect enums [global common/shared pool for all output/route]
            var routeref = modelvalue.routes[1].ctrl.enums;
            for (var idx=0; idx < routeref.length; idx ++) {
                scope.matrixRoutesPool.push ({id: idx , name:  routeref [idx], used: false, options: []});
            };
            // $log.log ("matrixRoutesPool=", scope.matrixRoutesPool);

            // processing input capture lines
            for (var idx = 0; idx < modelvalue.routes.length; idx = idx + 2) {

                var leftLine  = modelvalue.routes [idx];
                var rightLine = modelvalue.routes [idx + 1];
                var label = '[' + (idx + 1) + '/' + (idx + 2) + ']';
                var stereolines = {
                    uid: leftLine.numid + '-' + rightLine.numid,
                    title: "Stereo Output Route" + label,
                    label: 'Route ' + label,
                    name: 'Out '  + label,
                    matrixLinesPool: scope.matrixRoutesPool,
                    leftLine : scope.ProcessRouteSource(leftLine),
                    rightLine: scope.ProcessRouteSource(rightLine)
                };

                //$log.log ("[idx]", idx, "stereo line=", stereolines)
                matrixRoutes.push(stereolines);
            }

            // groupe Matrix mix in stereo output channel
            for (var mixIdx = 0; mixIdx < modelvalue.volumes.length; mixIdx = mixIdx +2) {
                var leftVol   = modelvalue.volumes [mixIdx];
                var rightVol  = modelvalue.volumes [mixIdx+1];

                var stereoVol = {
                    name      : "Mix-" + leftVol.name + " / " + rightVol.name,
                    stereomix : scope.ProcessStereoMix (leftVol, rightVol)
                };
                // $log.log ("stereoVol=", stereoVol);
                matrixMixVols.push (stereoVol);
            };

            // update scope in one big chunk to avoid flickering
            scope.matrixSources = matrixSources;
            scope.matrixRoutes  = matrixRoutes;
            scope.matrixMixVols = matrixMixVols;

            // $log.log ("matrixSources=" , matrixSources);
            // $log.log ("matrixRoutes="  , matrixRoutes);
            $log.log ("matrixMixVolsMix=" , matrixMixVols);
            //}
        }); // end formatter


        // export call back
        scope.matrixSourcesPoolCB = {
           take: function (lineIdx) {scope.takeLinePool (scope.matrixSourcesPool, lineIdx)} ,
           free: function (lineIdx) {scope.freeLinePool (scope.matrixSourcesPool, lineIdx)}
        };

        // export call back
        scope.matrixRoutesPoolCB = {
           take: function (lineIdx) {scope.takeLinePool (scope.matrixRoutesPool, lineIdx)} ,
           free: function (lineIdx) {scope.freeLinePool (scope.matrixRoutesPool, lineIdx)}
        };

        // call each time a volume slider moves
        scope.matrixMixFaderCB = function (modelvalue, realvalue) {

            $log.log ("matrixMixVolscallback model=", modelvalue, "value=", realvalue);

        }
    };

    return {
        templateUrl: "partials/scarlett-capture.html",
        require: 'ngModel',
        scope: {
            callback : '='
        },
        restrict: 'E',
        link: link
    };
};

console.log ("Scarlett Capture directive Initialized");

