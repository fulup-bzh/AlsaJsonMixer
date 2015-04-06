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
            // $log.log ("matrixvolume directive modelvalue=", modelvalue)

            // we use left mix as reference and compute right mix from balance level
            var refMix =  modelvalue.leftMix;
            var range  = (refMix.leftFader.notMore - refMix.leftFader.notLess) /2;

            scope.leftSliderTitle  =  refMix.leftFader.title;
            scope.rightSliderTitle =  refMix.rightFader.title;

            // some info to compute both channels with the same callback
            refMix.leftFader.channelNum =1;
            refMix.rightFader.channelNum=2;

            // attach model to active sliders
            scope.leftSliderModel  = refMix.leftFader;
            scope.rightSliderModel = refMix.rightFader;

            // Balances definition for both knob and attached shared slider
            scope.leftBalanceModel = scope.rightBalanceModel = scope.sliderBalanceModel= {
                value     : 0,
                notMore   : range/2,
                notLess   : -1*range/2
            };
            scope.sliderBalanceModeldisabled  = true; // do not display handle on slider

            // keep track of ALSA controls numids Two Channels IN and Two channels out
            scope.ctrlsNumid = {
                left : {
                    mixLeft: modelvalue.leftMix.leftFader.numid,
                    mixRight: modelvalue.rightMix.leftFader.numid
                },
                right : {
                    mixLeft: modelvalue.leftMix.rightFader.numid,
                    mixRight: modelvalue.rightMix.rightFader.numid
                }
            };

            // by default balance & volume value is null
            scope.balanceValue = {
                left      : 0,
                right     : 0
            };

            scope.volumeValue = {
                left      : 0,
                right     : 0
            };

            console.log ("ctrlsNumid %j",scope.ctrlsNumid )
        });

        scope.activateCtrls = function (channelNum) {
            var value, numids;

            if (channelNum == 1) {
                value  = scope.volumeValue.left;
                numids = scope.ctrlsNumid.left;
            }
            if (channelNum == 2) {
                value  = scope.volumeValue.right;
                numids = scope.ctrlsNumid.right;
            }

            // compute balance equalisation and create alsa controls
            var leftMix  = {
                numid:  numids.mixLeft,
                values: [(scope.balanceValue.left <= 0) ? value  : value - scope.balanceValue.left]
            };

            var rightMix = {
                numid : numids.mixRight,
                values: [(scope.balanceValue.right >= 0) ? value : value + scope.balanceValue.right]
            };

            // notify board capture about values
            scope.callback ([leftMix, rightMix]);

        };

        // formatter CB are call when a slide move, then should return value presented in handle
        scope.FaderSliderCB  = function (value, id, model) {

            //ingnore empty callback
            if (model == undefined) return;

            // in mono mode both slider are synchronized
            if (model.channelNum == 1) {
                if (scope.prefad.PFLM) scope.leftSliderModel = {value: value};
                scope.volumeValue.left = value;
            }

            if (model.channelNum == 2) {
                if (scope.prefad.PFLM) scope.rightSliderModel = {value: value};
                scope.volumeValue.right = value;
            }

            // send control to Alsa
            scope.activateCtrls (model.channelNum);

            // return value displays within handle
            return (value);
        };

        scope.BalanceSliderCB = function (value, id, model) {

            //ingnore empty callback
            if (model == undefined) return;

            $log.log ("BalanceSliderCB=", model)

            if (scope.activeKnob) {

                // rotate knob to reflect balance
                scope.activeKnob.setValue(value);

                // store balance in model depending on active knob
                if (scope.activeKnob.channelNum === 1) scope.balanceValue.left  = value;
                if (scope.activeKnob.channelNum === 2) scope.balanceValue.right = value;
                scope.activateCtrls (scope.activeKnob.channelNum);
            }

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

