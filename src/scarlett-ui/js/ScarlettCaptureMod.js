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


// var newModule = angular.module('ajg-monitor-gateway', []);

ngapp.addDirective ('scarlettCapture', ["$log",  scarletteCapture]);

function scarletteCapture($log) {


    function link (scope, elem, attrs, model) {

        scope.matrixSourcePool = []; // inputs lines belongs to a common shared pool.


        // parse Matrix Playback and Route to create a mono volume matrix mix
        scope.ProcessVolumeMix = function (matrixMix) {

            var mixName =  "Mix-" + matrixMix.name;

            // if no volumes defined we are facing a switch
            if (matrixMix.volumes.length == 0) {
                var volumeMix = {
                    name : mixName,
                    numid: matrixMix.route.numid,
                    title: matrixMix.route.name
                }
            } else {
                var volumeMix = {
                    name    : mixName,
                    volumes : []
                };

                // processing playback volumes
                for (var idx = 0; idx < matrixMix.volumes.length; idx = idx + 2) {

                    var left  = matrixMix.volumes [idx];
                    var right = matrixMix.volumes [idx + 1];

                    var fader = {
                        left: {
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
                        right: {
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
                    volumeMix.volumes.push(fader);
                }
            }
            return volumeMix;
        };
        
        // call when internal model value changes
        model.$formatters.unshift(function(modelvalue) {

            if (!modelvalue) return; // make sure we have some data to work with

            // prepare array to pass date to widget
            var mixerSources = [];
            var mixesVolumes = [];

            // use 1st input line to collect enums as this is a global common/shared pool
            var sourceref = modelvalue.sources[1].ctrl.enums;
            for (var idx=0; idx < sourceref.length; idx ++) {
                scope.matrixSourcePool.push({id: idx, name:  sourceref [idx], used: false, options: []});
            };

            // processing input lines
            for (var idx = 0; idx < modelvalue.sources.length; idx = idx + 2) {
                var leftInput  = modelvalue.sources [idx];
                var rightInput = modelvalue.sources [idx + 1];
                var label = '[' + (idx + 1) + '/' + (idx + 2) + ']';
                var input = {
                    uid: leftInput.numid + '-' + rightInput.numid,
                    title: "Stereo Capture Input " + label,
                    label: 'Line ' + label,
                    name : 'Capt ' + label,
                    matrixSourcePool  : scope.matrixSourcePool,

                    left: {
                        name:  leftInput.name,
                        actif: leftInput.actif,
                        numid: leftInput.numid,
                        value: leftInput.value
                    },
                    right: {
                        name : rightInput.name,
                        actif: rightInput.actif,
                        numid: rightInput.numid,
                        value: rightInput.value
                    }
                };
                //$log.log (idx, "sources [idx]", leftInput, "source[1]", rightInput)

                mixerSources.push(input)
            }

            // groupe Matrix mix as stereo output channel
            for (var mixIdx = 0; mixIdx < modelvalue.mixes.length; mixIdx = mixIdx +2) {
                var leftMix   = modelvalue.mixes [mixIdx];
                var rightMix  = modelvalue.mixes [mixIdx+1];

                var stereoMix = {
                    name  : "Mix-" + leftMix.name + " / " + rightMix.name,
                    left  : [],
                    right : []
                };
                // build a stereo volume mix

                $log.log ("leftMix=", leftMix, "rightMix=", rightMix)
                stereoMix.left = scope.ProcessVolumeMix (leftMix);
                stereoMix.right= scope.ProcessVolumeMix (rightMix);
                mixesVolumes.push (stereoMix);
            }

            // update scope in one big chunk to avoid flickering
            scope.mixerSources = mixerSources;
            scope.mixesVolumes = mixesVolumes;

            // $log.log ("mixerSources="  , mixerSources);
            $log.log ("mixesVolumes="  , mixesVolumes);
            //}
        }); // end formatter

        scope.updatePool=function (lineIdx, used) {

            // change line usage status
            scope.matrixSourcePool[lineIdx].used = used;

            // update select source options to disable used lines
            for (var idx=0; idx < scope.matrixSourcePool[lineIdx].options.length; idx++) {
                scope.matrixSourcePool[lineIdx].options[idx].disabled=used;
            }
        };

        // lock an input line from matrixSourcePool
        scope.takeLineInPool= function (lineIdx) {

            // if lineIdx is used or null ignore request
            if (lineIdx == 0 || scope.matrixSourcePool[lineIdx].used) return;

            scope.updatePool (lineIdx, true);
        };

        // return an input line matrixSourcePool
        scope.freeLineInPool= function (lineIdx) {

            if (lineIdx == 0) return;
            scope.updatePool (lineIdx, false);
        };

        // export call back
        scope.matrixSourcePoolCB = {
           take: scope.takeLineInPool,
           free: scope.freeLineInPool
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

