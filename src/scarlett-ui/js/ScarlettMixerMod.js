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
ngapp.addController ('ScarlettMixerController', ['$log', '$location', '$http', '$timeout', 'Notification', 'CtrlByNumid', 'LabelByUid', ScarlettController]);
function ScarlettController ($log, $location, $http, $timeout, Notification, CtrlByNumid, LabelByUid) {

    var scope = this;  // as controler model in route
    scope.SessionLabelPool = []; // where to store label pool
    scope.SessionLabelName = {uid:'session', label:'current-session'};
    scope.SessionLabelInfo = {uid:'info', label: undefined};

    // load session list
    scope.ResetSession = function (resetmod) {

        // send AJAX request to Alsa-Json-Gateway
        var query= {request:"session-list", cardid: scope.cardid};
        var handler = $http.get('/jsonapi', {params: query});

        // position every sndcontrol to zero
        if (resetmod > 1) {
            var numids = CtrlByNumid.getNumids();
            scope.SendAlsaCtrlsCB (numids, [0,0,0,0,0,0,0,0,0,0,0,0])
        }

        // Clear session and reload current effective value from sndcard
        if (resetmod > 0) {
            LabelByUid.reset ();
            scope.GetSndControls();
        }

        handler.error(function(status, errcode, headers) {
            alert ("Fail to upload session list [sndcard=" + scope.cardid + "from AlsaJsonGateway")
        });

        // process json response from alsa-gateway
        handler.success(function(response, errcode, headers, config) {

            // process standard AJG error messages
            if (response.ajgtype === "AJG_message") {
                if (response.status == 'empty') Notification.warning ({message: response.info, delay: 5000});
                else Notification.error ({message: response.info, delay: 5000});
                return;
            }

            // verify response is a valid "AJG_sessions",
            if (response.ajgtype != "AJG_sessions") {
                alert("AJM:FAIL ScarlettMixerController not a AJG_sessions record sndcard=" + scope.cardid + ", response=" + JSON.stringify(response));
                return;
            }
            // provide session list to UI
            scope.SessionsList = response.data;
        });
    };

    // load default session upfront
    scope.SessionLoad = function (sessionname, element) {

        if (!sessionname) return; // ignore invalid calls

        // send AJAX request to Alsa-Json-Gateway
        var query= {request:"session-load", cardid: scope.cardid, session: sessionname};
        var handler = $http.get('/jsonapi', {params: query});

        handler.error(function(status, errcode, headers) {
            alert ("Fail to upload " + sessionname + " from AlsaJsonGateway")
        });

        // process json response from alsa-gateway
        handler.success(function(response, errcode, headers, config) {
            scope.sndcard = response.sndcard;

            // process standard AJG error messages
            if (response.ajgtype === "AJG_message") {
                element.addClass ("ajg-error");
                element.removeClass ("ajg-success");
                if (response.status == 'empty') Notification.warning ({message: response.info, delay: 5000});
                else Notification.error ({message: response.info, delay: 5000});
                return;
            }

            // verify response is a valid "AJG_session",
            if (response.ajgtype !== "AJG_session") {
                alert("AJM:FAIL ScarlettMixerController sndcard=" + scope.cardid + ", response=" + JSON.stringify(response));
                return;
            }

            // session was loaded
            element.removeClass ("ajg-error");
            element.addClass ("ajg-success");

            // push control id to central registery
            if (response.data) {
                for (var idx = 0; idx < response.data.length; idx++) {
                    var record = response.data [idx];
                    CtrlByNumid.setValue(record.numid, record.value);
                }
            }
            // $log.log("Control Numid Pool=", CtrlByNumid.getPool());

            // extract labels and push then to UI
            if (response.info) {
                var info = response.info;
                if (info.ajgtype != "AJG_infos" || !info.data) {
                    alert("AJM:FAIL ScarlettMixerController sndcard=" + scope.cardid + ", invalid info=" + JSON.stringify(info));
                    return;
                }

                for (var idx = 0; idx < info.data.length; idx++) {
                    var record = info.data [idx];
                    //console.log ("restore label uid=%d label=%d", record.uid, record.label)
                    LabelByUid.setValue(record.uid, record.label);
                }
            }
        });
    };

    // Extract board control and try to build a smart logic on ALSA name semantic !!!
    scope.GetSndControls = function () {

        // send AJAX request to Alsa-Json-Gateway
        var query= {request:"ctrl-get-all", cardid: scope.cardid};
        var handler = $http.get('/jsonapi', {params: query});

        handler.error(function(status, errcode, headers) {
            alert ("Fail to get SndCard's controls from AlsaJsonGateway")
        });

        // process json response from alsa-gateway
        handler.success(function(response, errcode, headers, config) {
            scope.sndcard  = response.sndcard;
            var sources=[], mixes=[], routes=[], mSwitches=[], iSwitches=[], pSwitches=[],   mVolumes=[], mSources=[];
            var uSwitch, ySwitch ,sSwitch;

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

                // Master 2L (Headphone 1) Source Playback Enu [warning 'm' missing !!!]
                // Master 1R (Monitor) Source Playback Enum
                if (name[0] === 'master' && name[name.length-3] === "source" && name[name.length-2] === "playback") {
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

                // Clock source "Scarlett 18i8 USB-Sync"
                if (name[0] === 'scarlett' && name[2] === "usb-sync") {
                    uSwitch =  control;
                }

                // Clock status "Sample Clock Sync Status"
                if (name[0] === 'sample' && name[2] === "sync") {
                    ySwitch =control;
                }

                // Clock source "Sample Clock Source"
                if (name[0] === 'sample' && name[2] === "source") {
                    sSwitch =control;
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
                    impedance : iSwitches,
                    usb       : uSwitch,
                    syncon    : ySwitch,
                    clock     : sSwitch
                }
            };
        });
    };

    scope.SessionStore =function () {

       // extract session name and provide default info if not set by user
       var sessionname = LabelByUid.getValue (scope.SessionLabelName.uid);
       var sessioninfo = LabelByUid.getValue (scope.SessionLabelInfo.uid);
       if (sessioninfo  === undefined) {
           var date = new Date().toLocaleString();
           var defaultinfo = "AJG session created at " + date;
           scope.LabelByUid.setValue (scope.SessionLabelInfo.uid,defaultinfo);
       }

       // get all labels from pool to save them with session
       var labelspool  = LabelByUid.getPool ();

       // add AJG_session info type to data
       var sessioninfo = {
           ajgtype: "AJG_infos",
           data   : labelspool
       };

        // send AJAX request to Alsa-Json-Gateway
       var query= {request:"session-store", cardid: scope.cardid, session: sessionname};
       var handler = $http({
           method : 'POST',
           url    : '/jsonapi',
           params :  query,       // URL query
           data   :  JSON.stringify(sessioninfo) // POST data in JSON
       });


       // process json response from alsa-gateway
       handler.success(function(response, errcode, headers, config) {
          Notification.success ({message: "Session Store on AlsaJsonGateway", delay: 3000});
       });

       handler.error(function(status, errcode, headers) {
            alert ("Fail to Store Session onto AlsaJsonGateway status=" + status);
       });
    };

    scope.checkSyncStatus = function () {
        // send AJAX request to Alsa-Json-Gateway
        var query= {request:"ctrl-get-one", cardid: scope.cardid, numid: 208};
        var handler = $http.get('/jsonapi', {params: query});

        // "data": [ { "numid": 208, "actif": true, "value": [ 1 ] }
        handler.success(function(response, errcode, headers, config) {

            if (!response.data || response.data[0]) scope.BoardSyncStatus= false;
            else scope.BoardSyncStatus= response.data[0].value[0];
        });
    };

    // this method is called each time user manipulates UI
    scope.SendAlsaCtrlsCB = function (numids, values) {

      // send AJAX request to Alsa-Json-Gateway
      var query= {request:"ctrl-set-many", cardid: scope.cardid, value:JSON.stringify(values)};
      var handler = $http({
        method : 'POST',
        url    : '/jsonapi',
        params :  query,       // URL query
        data   :  JSON.stringify(numids) // POST data in JSON
  });

      // Hoops hack for source sync status update
      if (numids[0] === 207) $timeout (scope.checkSyncStatus, 1000);

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
        scope.ResetSession (0);
        scope.GetSndControls ();
    };

    scope.init();

}


console.log ("Scarllett MixerApp Loaded");