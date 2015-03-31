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

 Object: this module processes return from http://localhost:1234/alsa-json?request=get-controls&sndcard=xx.
 As alsa-json is basically a flat port of amixer.c, it does not understand complex music oriented sound boards.
 This module parse returned information from AlsaJsonGateway and organise it a model that is compliant with
 Scarlett board logic.

 $Id: $
 */

'use strict';

// var newModule = angular.module('ajg-scarlett-mixer', []);

ngapp.addController ('ScarlettMixerController', ['$log', '$location',  '$http', ScarlettController]);
function ScarlettController ($log, $location, $http) {

    var scope = this;  // as controler model in route

    scope.getControls = function (sndcard) {

        // send AJAX request to Alsa-Json-Gateway
        var query= {request:"get-ctrls", sndcard: sndcard};
        var handler = $http.get('/alsajson', {params: query});

        // process json response from alsa-gateway
        handler.success(function(response, errcode, headers, config) {
            scope.sndcard  = response.sndcard;
            var sources=[], mixes=[], routes=[];

            for (var idx =0; idx < response.controls.length; idx++) {
                var control = response.controls[idx];
                var name = control.name.toLowerCase().split(" ");

                // Matrix Input source "Input Source 01 Capture Route"
                if (name[0] === 'input' && name[3] === 'capture') {
                    sources.push (control)
                }

                // Matrix output route "Matrix 01 Input Playback Route"
                if (name[0] === 'matrix' && name[3] == "playback") {
                    routes.push (control)
                }

                // Maxtrix Mix Volume "Matrix 01 Mix A Playback Volume"
               if (name[0] === 'matrix' && name[2] === "mix" && name[5] == "volume") {

                    // Matrix object does not exit create it
                    var mixnum = name[3];
                    if (!mixes [mixnum]) {
                        mixes [mixnum] = {
                            name    : mixnum.toUpperCase(),
                            route   : "",
                            volumes : []
                        };
                    }
                    mixes[mixnum].volumes.push (control);
                }
               
            } // end loop for controls


            // move mixes from associate array to standard array for easier handling
            var volumes = [];
            if (mixes) Object.keys(mixes).forEach(function(key, index) {
                volumes.push (mixes[key]);
            }, mixes);

            // push result to scope globally to limit number of watch events
            scope.alsamixer = {
                sources: sources,
                routes : routes,
                volumes  : volumes
            };

        });

        handler.error(function(status, errcode, headers) {
            alert ("Fail to get Card Controls from AlsaJsonGateway")
        });
    };

    // this method is called each time user manipulates UI
    scope.callback = function (action, value) {

      $log.log ("Scarlett callback action=", action, ' value=', value);

    };

    scope.init = function () {

        // extract sndcard index from URL's query
        scope.getControls ($location.search().card);

    };

    scope.init();

}


console.log ("Scarllett MixerApp Loaded");