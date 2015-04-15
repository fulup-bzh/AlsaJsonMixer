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

newModule.provider('LabelByUid', labelByUid);

function labelByUid () {
    this.labelbyuid = [];
    var self = this; // I hate JavaScript

    // when injecting this provider application receive full object
    this.$get = function () {return self};

    this.register= function (scope) {
        if (!scope) return;
        // console.log ("LabelByUid register uid=%s label=%s", scope.uid, scope.label)
        this.labelbyuid [scope.uid] = scope;
    };

    this.setValue= function (uid, label) {
        if (!uid) return;
        // if scope is known, just update it, otherwise init tempry one
        if (this.labelbyuid  [uid] && this.labelbyuid [uid].setValue) this.labelbyuid [uid].setValue(label);
        else this.labelbyuid [uid] = {uid: uid, label: label}; // fake scope waiting for real one
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
    };

    // get label value from UID
    this.reset= function () {
        var pool =  this.labelbyuid;
        Object.keys(this.labelbyuid).forEach(function(uid, idx) {
            if (pool[uid] && pool[uid].setValue) pool [uid].setValue (undefined);
        });
    }
}

newModule.directive('matrixLabel', ["$log", 'LabelByUid', function($log, LabelByUid) {

    // warning template is not clean because of ng-moddel-options blur option.
    var ngoptions = "{ updateOn: 'default blur', debounce: {'default': 500, 'blur': 0} }";
    var template = '<input type="text" class="ajm-matrix-label" ng-model="label" list={{list}} placeholder={{placeholder}} ng-model-options="' + ngoptions + '">' ;

    console.log ("**** matrixLabel init");

    function link (scope, element, attrs, model) {

        scope.setValue = function (value) {
            scope.label = value;
        };

        // initialize widget upfront or later when data arrives
        scope.initWidget = function () {
           if (!scope.initvalues) return;

           // handle default attrs
           scope.list = attrs.list;
           scope.placeholder = attrs.placeholder;

           // console.log ("initvalues =%j", scope.initvalues)
           scope.uid   = scope.initvalues.uid;

           // initialise label from attribute or session content
           scope.label = LabelByUid.getValue (scope.uid) || scope.initvalues.label;

           LabelByUid.register (scope);
        };

        // if we have a callback let's watch for value change
        if (scope.callback) scope.$watch ('label', function(){
            scope.callback (scope.label, element);
        });

        // initialize widget now or later
        scope.initWidget();
        scope.$watch ('initvalues', scope.initWidget); // cb no params

    }

    return {
    template: template,
    scope: {
        initvalues : '=',
        label      : '=',
        used       : '=',
        callback   : '='
    },
    restrict: 'E',
    link: link
    };
}]);


console.log ("Matrix Label loaded");

