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

var newModule = angular.module('ajm-matrix-route', []);

newModule.directive('lineInput', ["$log", '$timeout', function($log, $timeout) {

    var optionTemplate = document.createElement('option');
    // do not use ng-model in select as it break initial value setting
    var template = '<select title="{{channel.name}}" title={{channel.name}} class="ajm-stereo-input-linein" ng-click="selected()"></select>';

    function addOption(linein, parent) {

        // create the option to insert
        var element= optionTemplate.cloneNode(false);
        parent.appendChild(element);

        element.label       = linein.name;
        element.textContent = linein.name;
        element.value       = linein.id;
        return element;
    }

    function link(scope, element, attrs) {

        scope.selectElem = element[0].firstChild; // access set initial value manually to bypass Angular limitation

        // call when internal model value changes
        scope.initWidget = function (initvalues) {

            scope.channel   = initvalues;
            scope.selection = initvalues.value;
            scope.selectElem.value = initvalues.value;
        };

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
                } else  if (scope.channel && scope.channel.value === idx) {
                    scope.callback (scope.channel, idx, true);
                    option.selected = true;
                }
            }
        });

        // access new value only if not used
        scope.selected = function () {

            scope.selection = scope.selectElem.value;

            // if selection is undefined ignore request
            if (scope.selection === undefined) return;

            if (scope.matrixLinesPool [scope.selection].used) {
                scope.selection = scope.channel.value;
                return;
            }
            scope.callback (scope.channel, scope.selection);
        };

        scope.$watch ('initvalues', function () { 	// init Values may arrive late
            if (scope.initvalues) scope.initWidget(scope.initvalues);
        });
    }

    return {
        template: template,
        scope: {
            channel    : '=',
            callback   : '=',
            matrixLinesPool: '=',
            initvalues : '='
        },
        restrict: 'E',
        link: link
    }
}]);


newModule.directive('matrixRoute', ["$log", function($log) {

    var template
   = '<div class="small-1 columns ajm-stereo-input">'
   + '<matrix-label ng-show="source" class="ajm-stereo-input-linein" initvalues="info"></matrix-label>'
   + '<div class="ajm-matrix-volume-fader" ng-repeat="line in MatrixLines">'
   + '<line-input class="ajm-select-{{$index}}"  matrix-lines-pool="matrixLinesPool" initvalues="line" callback="selected"></line-input>'
   + '</div>'
   + '<matrix-label ng-show="route" class="ajm-stereo-input-linein" initvalues="info"></matrix-label>'
   + '</div>';

    function link (scope, element, attrs, model) {

        scope.leftLine = '';
        scope.rightLine= '';
        scope.prefad = [];

        // call when internal model value changes
        scope.initWidget = function (initvalues)  {

            if (!initvalues) return; // make sure we have some data to work with
            // $log.log ("matrix-source directive", initvalues);

            scope.MatrixLines    = initvalues.lines;
            scope.matrixLinesPool= initvalues.matrixLinesPool;

            scope.info = {
                uid   : initvalues.uid,
                label : initvalues.label
            }
        };

        scope.selected = function (channel, selection, initphase) {
            // ignore initial empty events
            if (!channel) return;

            // free channel 1st in case same one was reselected
            if (!initphase) scope.callback.free (channel, selection);
            scope.callback.take (channel, selection);
            channel.value = selection;
        };

        scope.init = function() {
            scope.inputid  = attrs.id     || "matrix-" + parseInt (Math.random() * 1000);
            scope.name     = attrs.name   || "NoName";
            scope.label    = attrs.label  || "NoLabel";
            scope.route    = attrs.route  || false;
            scope.source   = attrs.source || false;

            if (scope.initvalues) scope.initWidget (scope.initvalues);
        };

        scope.init();
    }

    return {
    template: template,
    scope: {
        callback : '=',
        initvalues: '='
    },
    restrict: 'E',
    link: link
    };
}]);

console.log ("Matrix Route loaded");

