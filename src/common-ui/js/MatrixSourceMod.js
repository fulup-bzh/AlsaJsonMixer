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

        // we need to wait for matrixLinesPool to be ready before building selection list
        scope.$watch ('matrixLinesPool', function () {
            // default value is off

            // select is first child in template, remove 1st empty option
            var parent = element[0].firstChild; // get select
            for (var idx = 0; idx < scope.matrixLinesPool.length; idx++) {
                var option = addOption(scope.matrixLinesPool[idx], parent);
                scope.matrixLinesPool[idx].options.push (option);

                if (scope.matrixLinesPool[idx].used) {
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


            console.log ("1 selection callback")

            // if selection is undefined ignore request
            if (scope.selection === undefined) return;

            if (scope.matrixLinesPool [scope.selection].used) {
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
            matrixLinesPool: '='
        },
        restrict: 'E',
        require: 'ngModel',
        link: link
    }
}]);

newModule.directive('matrixSource', ["$log", '$timeout', function($log, $timeout) {


    var template
   = '<div class="small-1 columns ajg-stereo-input">'
   + '<input ng-show="route" type="text" class="ajg-stereo-input-linein" value="{{label}}">'
   + '<line-input class="ajg-select-left"  matrix-lines-pool="matrixLinesPool" ng-model=leftLine  callback="selected"></line-input>'
   + '<line-input class="ajg-select-right" matrix-lines-pool="matrixLinesPool" ng-model=rightLine callback="selected"></line-input>'
   + '<input ng-show="source" type="text" class="ajg-stereo-input-linein" value="{{label}}">'
   + '</div>';

    function link (scope, element, attrs, model) {

        scope.leftLine = '';
        scope.rightLine= '';
        scope.prefad = [];

        // call when internal model value changes
        model.$formatters.unshift(function(modelvalue) {

            if (!modelvalue) return; // make sure we have some data to work with

            // $log.log ("matrix-source directive", modelvalue, " left=", modelvalue.leftLine);

            // set default options from current assigned values
            scope.leftLine = {
                name : modelvalue.leftLine.name,
                actif: modelvalue.leftLine.actif, 
                numid: modelvalue.leftLine.numid,
                value: modelvalue.leftLine.value[0]
            };
            
            scope.rightLine = {
                name : modelvalue.rightLine.name,
                actif: modelvalue.rightLine.actif,
                numid: modelvalue.rightLine.numid,
                value: modelvalue.rightLine.value[0]
            };

            scope.label           = modelvalue.label;
            scope.matrixLinesPool= modelvalue.matrixLinesPool;
        });

        scope.selected = function (channel, selection) {
            // ignore initial empty events
            if (!channel) return;

            console.log ("slection callback")
            // free channel 1st in case same one was reselected
            scope.callback.free (channel.value);
            scope.callback.take (selection);
            channel.value = selection;
        };

        scope.init = function() {
            scope.inputid  = attrs.id     || "analog-in-" + parseInt (Math.random() * 1000);
            scope.name     = attrs.name   || "NoName";
            scope.label    = attrs.label  || "NoLabel";
            scope.route    = attrs.route  || false;
            scope.source   = attrs.source || false;
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

