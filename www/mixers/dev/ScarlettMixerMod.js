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

 Object: this module processes return from http://localhost:1234/jsonapi?request=ctl-get-all&cardid=hw:xx.
 As AlSA retuens a flat control list of sndcard controls and does not understand complex music oriented sound boards.
 This module parse returned information from AlsaJsonGateway and organises them in a model that is compliant with
 Scarlett board logic and group them by mixers, capture, volumes, etc ...

 */

'use strict';

// Lazy Directive load
ngapp.addController ('ScarlettMixerController', ['$log', '$location', '$http', 'Notification', ScarlettController]);
function ScarlettController ($log, $location, $http, Notification) {

    var scope = this;  // as controler model in route
    scope.SessionLabelPool = []; // where to store label pool
    scope.SessionLabelName = {uid:'main-session', label:'default-session'};


    // load default session upfront
    scope.loadSession = function (sessionname) {

        // send AJAX request to Alsa-Json-Gateway
        var query= {request:"session-load", cardid: scope.cardid, args: sessionname};
        var handler = $http.get('/jsonapi', {params: query});

        handler.error(function(status, errcode, headers) {
            alert ("Fail to upload " + sessionname + " from AlsaJsonGateway")
        });

        // process json response from alsa-gateway
        handler.success(function(response, errcode, headers, config) {
            scope.sndcard = response.sndcard;

            // verify response is a valid "AJG_ctrls",
            if (response.ajgtype != "AJG_session") {
                alert("AJM:FAIL ScarlettMixerController sndcard=" + scope.cardid + ", response=" + JSON.stringify(response));
                return;
            }
            // make sure we ready to display session
            if (!scope.SessionLabelPool.setValue) {
                alert ("SessionLabelPool not ready");
                return;
            }
            // extract labels and push then to UI
            var labels = response.data.labels;
            for (var idx=0; idx < labels.length; idx ++) {
                var record = labels [idx];
                scope.SessionLabelPool.setValue (record.uid, record.label);
            }
        });
    };

    // get current board controls
    scope.getControls = function () {

        // send AJAX request to Alsa-Json-Gateway
        var query= {request:"ctrl-get-all", cardid: scope.cardid};
        var handler = $http.get('/jsonapi', {params: query});

        handler.error(function(status, errcode, headers) {
            alert ("Fail to get SndCard's controls from AlsaJsonGateway")
        });

        // process json response from alsa-gateway
        handler.success(function(response, errcode, headers, config) {
            scope.sndcard  = response.sndcard;
            var sources=[], mixes=[], routes=[], mSwitches=[], iSwitches=[], pSwitches=[], mVolumes=[], mSources=[];

            // verify response is a valid "AJG_ctrls",
            if (response.ajgtype !=  "AJG_ctrls") {
                alert ("AJM:FATAL ScarlettMixerController sndcard=" +scope.cardid +", response=" + JSON.stringify (response));
                return;
            }
            // extract controls from response
            var controls = response.data;

            for (var idx =0; idx < controls.length; idx++) {
                var control = controls[idx];
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
                            volumes : []
                        };
                    }
                    mixes[mixnum].volumes.push (control);
                }

                // Master 2 (Headphone 1) Playback Switch
                if (name[0] === 'master' && name[name.length-1] === "switch") {
                    mSwitches.push (control);
                }

                // Master 1 (Monitor) Playback Volume
                if (name[0] === 'master' && name[name.length-1] === "volume") {
                    mVolumes.push (control);
                }

                // Master 1R (Monitor) Source Playback Enum
                if (name[0] === 'master' && name[name.length-1] === "enum") {
                    mSources.push (control);
                }

                // Input 2 Pad Switch
                if (name[0] === 'input' && name[2] == 'pad') {
                    pSwitches.push (control);
                }

                // Input 2 Impedance Switch
                if (name[0] === 'input' && name[2] === "impedance") {
                    iSwitches.push (control);
                }

            } // end loop for controls

            // move mixes from associate array to standard array for easier handling
            var mixesarray = [];
            if (mixes) Object.keys(mixes).forEach(function(key, index) {
                mixesarray.push (mixes[key]);
            }, mixes);

            // push result to scope globally to limit number of watch events
            scope.alsamixer = {
                sources: sources,
                routes: routes,
                mixes: mixesarray
            };

            scope.alsamaster = {
                volumes: mVolumes,
                sources: mSources,
                switches : {
                    master    : mSwitches,
                    pad       : pSwitches,
                    impedance : iSwitches
                }
            };
        });


    };

    scope.SessionSave =function () {
       var sessionname = scope.SessionLabelPool.getValue ('main-session');
       var labelspool  = scope.SessionLabelPool.getPool ();
       $log.log ("session=", sessionname, "pool=", labelspool);

       // send AJAX request to Alsa-Json-Gateway
       var query= {request:"session-store", cardid: scope.cardid, numids: JSON.stringify(numids), name: sessionname, args:JSON.stringify(values)};
       var handler = $http.get('/jsonapi', {params: query});

       // process json response from alsa-gateway
       handler.success(function(response, errcode, headers, config) {
          Notification.success ({message: "Session Store on AlsaJsonGateway", delay: 3000});
       });

       handler.error(function(status, errcode, headers) {
            alert ("Fail to Store Session onto AlsaJsonGateway")
       });
    };

    // this method is called each time user manipulates UI
    scope.SendAlsaCtrlsCB = function (numids, values) {

      // send AJAX request to Alsa-Json-Gateway
      var query= {request:"ctrl-set-many", cardid: scope.cardid, numids: JSON.stringify(numids), args:JSON.stringify(values)};
      var handler = $http.get('/jsonapi', {params: query});

      // process json response from alsa-gateway
      handler.success(function(response, errcode, headers, config) {
          // should we do something in case of success ???
      });

      handler.error(function(status, errcode, headers) {
         alert ("Fail to send Card Controls to AlsaJsonGateway")
      });

    };

    scope.init = function () {

        // extract sndcard index from URL's query
        scope.cardid = $location.search().card;
        scope.getControls ();
    };

    scope.init();

}


console.log ("Scarllett MixerApp Loaded");