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

            if (!modelvalue) return; // make sure we have some data to work with
            $log.log ("matrixvolume directive modelvalue=", modelvalue)

            // we use left mix as reference and compute right mix from balance level
            var refMix =  modelvalue.leftMix;
            var range  = (refMix.leftFader.notMore - refMix.leftFader.notLess) /2;

            scope.leftSliderTitle  =  refMix.leftFader.title;
            scope.rightSliderTitle =  refMix.rightFader.title;

            // attache right mix NUMID to reference channel to compute balance equalization
            refMix.leftFader.rightMix = {
                numid: modelvalue.rightMix.leftFader.numid,
                value: modelvalue.rightMix.leftFader.value
            };
            refMix.rightFader.rightMix = {
                numid: modelvalue.rightMix.rightFader.numid,
                value: modelvalue.rightMix.rightFader.value
            };

            // some info to compute both channel with the same callback
            refMix.leftFader.left=true;
            refMix.rightFader.right=true;

            scope.leftSliderModel  = refMix.leftFader;
            scope.rightSliderModel = refMix.rightFader;

            scope.rightBalanceModel =  scope.leftBalanceModel = {
                value :  0,
                notMore : range/2,
                notLess : -1*range/2
            };

            scope.sliderBalanceModel= {
                title   : "Select Channel to adjust L/R channel balance",
                notMore : range,
                notLess : (-1*range),
                disabled: true
            }
        });

        // formatter CB are call when a slide move, then should return value presented in handle
        scope.FaderSliderCB  = function (value, id, modelvalue) {

            // on mono mode both slider are synchronized
            if (model.right && scope.prefad.PFLM) scope.rightSliderModel  = {value: value}; // if mono let's sync channel
            if (model.left  && scope.prefad.PFLM) scope.leftSliderModel  = {value: value};  // if mono let's sync channel

            $log.log ("LeftSliderCB handle", modelvalue, 'balance value', scope.rightBalanceModel);

            // compute balance equalisation
            if (model.left)  value = value + scope.leftSliderModel.value;
            if (model.right) value = value + scope.rightSliderModel.value;

            // notify board capture about value change
            scope.callback (modelvalue, value);
            return (value); // formatter value is display within handle
        };

        scope.BalanceSliderCB = function (value, id) {
            scope.callback ('BALANCE-FADER' ,  value);

            if (scope.activeKnob) scope.activeKnob.setValue(value);
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

        scope.knobResetCB = function() {
            scope.rightBalanceModel =  scope.leftBalanceModel  = {value : 0};
            scope.rightBalanceModel =  scope.leftBalanceModel  = {value : 0};
            if (scope.activeKnob)  {
                scope.activeKnob.toggleState();
                scope.activeKnob = null;
                scope.sliderBalanceModel= {disabled: true };
            }
        };

        scope.knobToggleCB = function (button) {
            if (button.toggleState()) {
                if (scope.activeKnob) scope.activeKnob.toggleState();
                scope.activeKnob = button;
                scope.sliderBalanceModel= {disabled: false, value: button.value};
            }
            else {
                scope.sliderBalanceModel= {disabled: true };
                scope.activeKnob = false;
            }
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

