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

var newModule = angular.module('ajg-matrix-volume', []);

newModule.directive('matrixVolume', ["$log", '$timeout', function($log, $timeout) {


    function link (scope, element, attrs, model) {

        scope.prefad = [];

        // call when internal model value changes
        model.$formatters.unshift(function(modelvalue) {

            scope.rightTitle =  modelvalue.right.title;
            scope.leftTitle  =  modelvalue.left.title;

            if (!modelvalue) return; // make sure we have some data to work with
            // $log.log ("*** matrixvolume modelvalue=", modelvalue)

            scope.leftSliderModel  = modelvalue.left;
            scope.rightSliderModel = modelvalue.right;

            scope.rightBalanceModel =  90;
            scope.leftBalanceModel  = -90;

            // use left channel as pattern for slider
            scope.sliderBalanceModel= {
                title   : "Select Channel to adjust L/R channel balance",
                notMore : modelvalue.left.notMore,
                notLess : modelvalue.left.notLess,
                disabled: true
            }
        });

        scope.LeftSliderCB  = function (value, id) {
            //scope.callback ('LEFT-FADER' ,  value);
            if (scope.prefad.PFLM) scope.rightSliderModel  = {value: value};
            return (value); // formater value is use within handle
        };

        scope.RightSliderCB = function (value, id) {
            //scope.callback ('RIGHT-FADER' ,  value);
            if (scope.prefad.PFLM) scope.leftSliderModel = {value: value};
            return (value); // formater value is use within handle
        };

        scope.BalanceSliderCB = function (value, id) {
            //scope.callback ('BALANCE-FADER' ,  value);
            return (value); // formater value is use within handle
        };

        // Toogle Pre-Fader button and ajust class for CSS rendering
        scope.PreFader = function (event, action) {

           var button = angular.element(event.target);

           if (scope.prefad [action]) {
               scope.prefad [action] = false;
               button.removeClass ("pfl-button-active")
           } else {
               scope.prefad [action] = true;
               button.addClass ("pfl-button-active")
           }

           // callback action to requesting mixer
           scope.callback ('PFL-' + action,  scope.prefad [action]);

        };


        scope.init = function() {

            scope.inputid  = attrs.id    || "analog-in-" + parseInt (Math.random() * 1000);
            scope.name     = attrs.name  || "NoName";
            scope.label    = attrs.label || "NoLabel";
        };

        scope.init();
    }

    return {
    templateUrl: "partials/matrix-volume.html",
    scope: {
        callback: '='
    },
    restrict: 'E',
    require: 'ngModel',
    link: link
    };
}]);

console.log ("stereo slider loaded");

