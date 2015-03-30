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


        // parse Matrix Playback and Route to create a mono volume matrix mix
        scope.ProcessVolume = function (matrixVol) {

            var mixName =  "Vol-" + matrixVol.name;

            // if no volumes defined we are facing a switch
            if (matrixVol.volumes.length == 0) {
                var volumeVol = {
                    name : mixName,
                    numid: matrixVol.route.numid,
                    title: matrixVol.route.name
                }
            } else {
                var volumeVol = {
                    name    : mixName,
                    volumes : []
                };

                // processing playback volumes
                for (var idx = 0; idx < matrixVol.volumes.length; idx = idx + 2) {

                    var left  = matrixVol.volumes [idx];
                    var right = matrixVol.volumes [idx + 1];

                    var fader = {
                        leftLine: {
                            id     : left.numid,
                            actif  : left.actif,
                            value  : left.value[0],
                            notLess: left.ctrl.min,
                            notMore: left.ctrl.max,
                            byStep : left.ctrl.step,
                            title  : left.name
                            //tlv  : left.tlv
                            //acl  : left.acl
                        },
                        rightLine: {
                            id     : right.numid,
                            actif  : right.actif,
                            value  : right.value[0],
                            notLess: right.ctrl.min,
                            notMore: right.ctrl.max,
                            byStep : right.ctrl.step,
                            title  : right.name
                            //tlv  : left.tlv
                            //acl  : left.acl
                        }
                    };
                    volumeVol.volumes.push(fader);
                }
            }
            return volumeVol;
        };
        
        // call when internal model value changes
        model.$formatters.unshift(function(modelvalue) {

            if (!modelvalue) return; // make sure we have some data to work with

            // prepare array to pass date to widget
            var matrixSources = [];
            var matrixRoutes = [];
            var matrixVolumes = [];

            // use 1st input line to collect enums [common/shared pool for all capture/sources]
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
            
            // use 1st output line to collect enums [global common/shared pool for all output/route]
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

            // groupe Matrix mix as stereo output channel
            for (var volIdx = 0; volIdx < modelvalue.volumes.length; volIdx = volIdx +2) {
                var leftVol   = modelvalue.volumes [volIdx];
                var rightVol  = modelvalue.volumes [volIdx+1];

                var stereoVol = {
                    name  : "Vol-" + leftVol.name + " / " + rightVol.name,
                    leftLine  : [],
                    rightLine : []
                };
                // build a stereo volume mix

                // $log.log ("leftVol=", leftVol, "rightVol=", rightVol)
                stereoVol.leftLine = scope.ProcessVolume (leftVol);
                stereoVol.rightLine= scope.ProcessVolume (rightVol);
                matrixVolumes.push (stereoVol);
            }

            // update scope in one big chunk to avoid flickering
            scope.matrixSources = matrixSources;
            scope.matrixRoutes  = matrixRoutes;
            scope.matrixVolumes = matrixVolumes;

            // $log.log ("matrixSources=" , matrixSources);
            // $log.log ("matrixRoutes="  , matrixRoutes);
            // $log.log ("matrixVolumes=" , matrixVolumes);
            //}
        }); // end formatter

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

