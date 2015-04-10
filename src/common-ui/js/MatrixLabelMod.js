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

var newModule = angular.module('ajm-matrix-label', []);



newModule.directive('matrixLabel', ["$log", function($log) {

    // warning template is not clean because of ng-moddel-options blur option.
    var template = '<input type="text" class="matrix-label" ng-model="label" ng-model-options="{ updateOn: ' + "'blur'" +' }">' ;

    // pool is share within all instances of matrix-label
    function pool() {
        this.labelbyuid = [];

        this.register= function (scope) {
            if (!scope) return;
            this.labelbyuid [scope.uid] = scope;
        };

        this.setValue= function (uid, label) {
            if (!uid) return;
            // if scope is known, just update it, otherwise init tempry one
            if (this.labelbyuid  [uid]) this.labelbyuid [uid].setValue (label);
            else this.labelbyuid [uid] = {uid: uid, label: label};
        };
        
        // return complete pool as an array for session saving
        this.getPool = function () {
            var response = [];
            var pool =  this.labelbyuid;
            Object.keys(this.labelbyuid).forEach(function(uid, idx) {
                var record = pool[uid];
                response.push ({uid: record.uid, label: record.label});
            });

            return response;
        };

        // get label value from UID 
        this.getValue= function (uid) {
            // if uid is registered return label
            if (this.labelbyuid[uid]) return (this.labelbyuid [uid].label);
            return undefined;
        }
    }

    // instanciate pool only once on load
    var sharedpool= new pool();

    function link (scope, element, attrs, model) {

        scope.setValue = function (value) {
            scope.label = value;
        };

        // initialize widget upfront or later when data arrives
        scope.initWidget = function () {
           if (!scope.initvalues) return;

           console.log ("initvalues =%j", scope.initvalues)
           scope.uid   = scope.initvalues.uid;
           scope.label = sharedpool.getValue (scope.uid) || scope.initvalues.label;
           sharedpool.register (scope);
        };

        // if a labelpool is provided extract value and return handle
        if (scope.labelpool) scope.labelpool= sharedpool;

        // initialize widget now or later
        scope.initWidget ();
        scope.$watch ('initvalues', scope.initWidget);
    }

    return {
    template: template,
    scope: {
        labelpool  : '=',
        initvalues : '=',
        label : '='
    },
    restrict: 'E',
    link: link
    };
}]);


console.log ("Matrix Label loaded");

