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

var newModule = angular.module('ajm-matrix-fader', []);

newModule.directive('matrixFader', ["$log", '$timeout', function($log, $timeout) {


    function link (scope, element, attrs, model) {

        scope.prefad = [];

        // call when internal model value changes
        scope.initWidget = function(initvalues) {

            if (!initvalues) return; // make sure we have some data to work with
            //$log.log ("matrixFader initvalues=", initvalues)

            // we use left mix as reference and compute right mix from balance level
            var refMix =  initvalues[0];
            var range  = (refMix[0].notMore - refMix[0].notLess) /2;

            // check if mixes are groupe in stereo
            if (refMix[0].length  == 2) scope.stereo = true;

            scope.BalanceModel = {
                    value: 0,
                    notMore: range / 2,
                    notLess: -1 * range / 2
            };

            // attach model to actif sliders and keep a local copy as MixerModel will be erase
            scope.MixerModel  = initvalues;

            // scan model value to extract useful information for UI
            scope.ctrlById= [];
            scope.sliderById= [];
            scope.syncMix= [];

            // do we have two output
            var stereoIn  = (initvalues.length === 2);
            var stereoOut = (initvalues[0].length === 2);

            for (var idx=0; idx < initvalues.length; idx ++) {
                if (stereoOut) scope.syncMix [idx] = true;  // by default stereo mix are synchronized

                var playback = initvalues [idx];
                for (var jdx=0; jdx < playback.length; jdx ++) {
                    var current =  playback [jdx];
                    scope.ctrlById [playback [jdx].channel.numid] = playback [jdx].ctrl;
                }
            }
        };

        // this method sync/unsync stereo output channel [ex: Mix A/B]
        // sync sliders are disable to remove handle
        // unsync sliders are actif but with a "not-sync" class in order CSS to reduce handle size
        scope.StereoMix = function (event, index) {

            var button = angular.element(event.target);
            if (scope.syncMix [index]) {
               scope.syncMix  [index] = false;
               button.removeClass ("pfl-button-actif")

               // loop on associative array to check which slide should be unsync 
               Object.keys(scope.sliderById).forEach(function(key, idx) {
                   var handle =  scope.sliderById[key].getCbHandle();
                   var slider =  scope.sliderById[key];

                   if (handle.idxin === index) {
                       slider.updateClass("not-sync", true);
                       if (handle.idxout !== 0)   slider.setDisable(false);
                   }
               }, scope.sliderById);
                
            } else {
               scope.syncMix  [index] = true;
               var value=0;
               // loop on associative array to check which slide should be unsync
               Object.keys(scope.sliderById).forEach(function(key, idx) {
                  var handle =  scope.sliderById[key].getCbHandle();
                  var slider =  scope.sliderById[key];

                  if (handle.idxin === index) {
                      scope.sliderById[key].updateClass ("not-sync", false);
                      if (handle.idxout == 0) {
                          value = slider.getValue();
                      } else {
                          slider.setDisable(true);
                          slider.setValue (value);
                      }
                  }
               }, scope.sliderById);
               button.addClass ("pfl-button-actif")
            }
        };
            
        scope.SliderInit = function(slider) {

            var handle =  slider.getCbHandle();
            // buid a list and an associative array of controls
            scope.sliderById [handle.numid] = slider;

        };

        // formatter CB are call when a slide move, then should return value presented in handle
        scope.FaderSliderCB  = function (value, slider) {
            var targets=[]; // numid concerned by this action

            // ignore initial slider settings
            if (slider == undefined) return (value);

            // if capture are in sync let's move all channels together
            if (scope.prefad.PFLM) {

                // loop on associative array to check which slide should be unsync
                Object.keys(scope.sliderById).forEach(function(key, idx) {
                    var handle =  scope.sliderById[key].getCbHandle();
                    var slider =  scope.sliderById[key];
                    slider.setValue (value);
                    targets.push (handle.numid);
                }, scope.sliderById);
            } else {

                // extract cbHandle from slider object
                var handle = slider.getCbHandle();
                targets.push(handle.numid); // main channel is always part of tageted control

                $log.log("FaderSliderCB numid=", handle.numid, " value=", value, 'handle=', handle);

                // if playback mix are in sync move both playback channels
                if (scope.syncMix [handle.idxin]) {
                    var next = scope.sliderById[handle.numid + 1]; // output payback channels from mix A/B have continuous numid
                    next.setValue(value);
                    targets.push(handle.numid + 1);
                }
            }

            // send value to every concerned channel control numid
            // console.log ("numids=%j value=%d", targets, value)
            scope.callback (targets, value);

            // return value displays within handle
            return (value);
        };


        // Toogle Pre-Fader button and ajust class for CSS rendering
        scope.PreFader = function (event, action) {

           var button = angular.element(event.target);

           if (scope.prefad [action]) {
               scope.prefad [action] = false;
               button.removeClass ("pfl-button-actif")
           } else {
               scope.prefad [action] = true;
               button.addClass ("pfl-button-actif")
           }
        };

        scope.knobResetCB = function() {
            scope.rightBalanceModel =  scope.leftBalanceModel  = {value : 0};
            scope.rightBalanceModel =  scope.leftBalanceModel  = {value : 0};
            if (scope.actifKnob)  {
                scope.actifKnob.toggleState();
                scope.actifKnob = null;
                scope.sliderBalanceModel= {disabled: true };
            }
        };

        scope.knobToggleCB = function (button) {
            if (button.toggleState()) {
                if (scope.actifKnob) scope.actifKnob.toggleState();
                scope.actifKnob = button;
                scope.sliderBalanceModel= {disabled: false, value: button.value};
            }
            else {
                scope.sliderBalanceModel= {disabled: true };
                scope.actifKnob = false;
            }
        };

        // initialize widget
        scope.inputid  = attrs.id    || "analog-in-" + parseInt (Math.random() * 1000);
        scope.name     = attrs.name  || "NoName";
        scope.label    = attrs.label || "NoLabel";
        scope.switchid  = attrs.id | "switch-" + parseInt (Math.random() * 1000);
        scope.$watch ('initvalues', function () { 	// init Values may arrive late
            if (scope.initvalues) scope.initWidget(scope.initvalues);
        });

    }

    return {
    templateUrl: "partials/matrix-fader.html",
    scope: {
        callback: '=',
        initvalues : '='
    },
    restrict: 'E',
    link: link
    };
}]);

console.log ("Matrix Fader loaded");

