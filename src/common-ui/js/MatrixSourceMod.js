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

var newModule = angular.module('ajg-matrix-source', []);

newModule.directive('lineInput', ["$log", '$timeout', function($log, $timeout) {

    var optionTemplate = document.createElement('option');
    // do not use ng-model in select as it break initial value setting
    var template = '<select title="{{channel.name}}" title={{channel.name}} class="ajg-stereo-input-linein" ng-click="selected()"></select>';

    function addOption(linein, parent) {

        // create the option to insert
        var element= optionTemplate.cloneNode(false);
        parent.appendChild(element);

        element.label       = linein.name;
        element.textContent = linein.name;
        element.value       = linein.id;
        return element;
    }

    function link(scope, element, attrs, model) {

        scope.selectElem = element[0].firstChild; // access set initial value manually to bypass Angular limitation

        // call when internal model value changes
        model.$formatters.unshift(function(modelvalue) {
            scope.volume = modelvalue;

            // $log.log("formatter set modelvalue=", modelvalue, "model",model);
            scope.selection = modelvalue.value;
            scope.selectElem.value = modelvalue.value;
        });

        // we need to wait for matrixSourcePool to be ready before building selection list
        scope.$watch ('matrixSourcePool', function () {
            // default value is off

            // select is first child in template, remove 1st empty option
            var parent = element[0].firstChild; // get select
            for (var idx = 0; idx < scope.matrixSourcePool.length; idx++) {
                var option = addOption(scope.matrixSourcePool[idx], parent);
                scope.matrixSourcePool[idx].options.push (option);

                if (scope.matrixSourcePool[idx].used) {
                    option.disabled = true;
                } else  if (scope.volume && scope.volume.value === idx) {
                    scope.callback (scope.volume, idx);
                    option.selected = true;
                }
            }
        });

        // access new value only if not used
        scope.selected = function () {
            scope.selection = scope.selectElem.value;

            // if selection is undefined ignore request
            if (scope.selection === undefined) return;

            if (scope.matrixSourcePool [scope.selection].used) {
                scope.selection = scope.volume.value;
                return;
            }
            scope.callback (scope.volume, scope.selection);
        };
    }

    return {
        template: template,
        scope: {
            channel    : '=',
            callback   : '=',
            matrixSourcePool: '='
        },
        restrict: 'E',
        require: 'ngModel',
        link: link
    }
}]);

newModule.directive('matrixSource', ["$log", '$timeout', function($log, $timeout) {


    var template
   = '<div class="small-1 columns ajg-stereo-input">'
   + '<line-input class="ajg-select-left"  matrix-source-pool="matrixSourcePool" ng-model=leftChannel  callback="selected"></line-input>'
   + '<line-input class="ajg-select-right" matrix-source-pool="matrixSourcePool" ng-model=rightChannel callback="selected"></line-input>'
   + '<input type="text" class="ajg-stereo-input-linein" value="{{label}}">'
   + '</div>';

    function link (scope, element, attrs, model) {

        scope.leftChannel = '';
        scope.rightChannel= '';
        scope.prefad = [];

        // call when internal model value changes
        model.$formatters.unshift(function(modelvalue) {

            if (!modelvalue) return; // make sure we have some data to work with

            // $log.log ("matrix-source", modelvalue)

            // set default options from current assigned values
            scope.leftChannel = {
                name : modelvalue.left.name,
                actif: modelvalue.left.actif, 
                numid: modelvalue.left.numid,
                value: modelvalue.left.value[0]
            };
            
            scope.rightChannel = {
                name : modelvalue.right.name,
                actif: modelvalue.right.actif,
                numid: modelvalue.right.numid,
                value: modelvalue.right.value[0]
            };

            scope.label      = modelvalue.label;
            scope.matrixSourcePool= modelvalue.matrixSourcePool;
        });

        scope.selected = function (channel, selection) {
            // ignore initial empty events
            if (!channel) return;

            // free channel 1st in case same one was reselected
            scope.callback.free (channel.value);
            scope.callback.take (selection);
            channel.value = selection;
        };

        scope.init = function() {
            scope.inputid  = attrs.id    || "analog-in-" + parseInt (Math.random() * 1000);
            scope.name     = attrs.name  || "NoName";
            scope.label    = attrs.label || "NoLabel";
        };

        scope.init();
    }

    return {
    template: template,
    scope: {
        callback: '='
    },
    restrict: 'E',
    require: 'ngModel',
    link: link
    };
}]);

console.log ("stereo input loaded");

