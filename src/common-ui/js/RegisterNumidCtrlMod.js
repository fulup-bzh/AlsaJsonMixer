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

 This file provide a central registry point to store controls by numid
 elements.

 */

'use strict';

// this module is load statically before any route is cativated
var newModule = angular.module('ajm-register-numid', []);

// object for widget to register there control ID and scope
newModule.provider('CtrlByNumid',  AjgNumidCtrlPool);
function AjgNumidCtrlPool () {
    this.ctrlbynumid = [];
    var self = this; // I hate JavaScript

    // when injecting this provider application receive full object
    this.$get = function () {return self};

    this.register= function (numid, scope) {
        if (!scope) return;
        this.ctrlbynumid [numid] = scope;
        //console.log ("registering scope")
        //console.log (scope)
    };

    this.setValue= function (numid, value) {
        if (!numid) return;

        // if scope is known, just update it, otherwise init temporally one
        var registeredscope = this.ctrlbynumid [numid];
        if (registeredscope  && registeredscope.setValue) registeredscope.setValue (value);
    };

    // Refresh sliders when TAB is open
    this.refreshPool = function (mixgrp) {
        var pool =  this.ctrlbynumid;
        Object.keys(this.ctrlbynumid).forEach(function(numid, idx) {
            if (pool[numid].getCbHandle) {
                var slider = pool[numid];
                var handle = slider.getCbHandle();
                if (handle.mixgrp == mixgrp) slider.forceRefresh(50);
            }
        });
    };

    // return complete pool as an array for session saving
    this.getPool = function () {
        var response = [];
        var pool =  this.ctrlbynumid;
        Object.keys(this.ctrlbynumid).forEach(function(numid, idx) {
            var record = pool[numid];
            response.push ({numid: record.numid, value: record.value});
        });
        return response;
    };

    // get value value from NUMID
    this.getValue= function (numid) {
        // if numid is registered return value
        if (this.ctrlbynumid[numid]) return (this.ctrlbynumid [numid].value);
        return undefined;
    }
}

console.log ("Register Numid Controls Loaded");

