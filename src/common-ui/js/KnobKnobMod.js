/**
 * @name		jQuery KnobKnob plugin
 * @author		Fulup Ar Foll Angular from Martin Angelov JQuery Version
 * @version 	1.0
 * @url			http://git-hub/fulup-bzh
 * @Jquery		http://tutorialzine.com/2011/11/pretty-switches-css3-jquery/
 * @license		MIT License
 *
 */

'use strict';

var newModule = angular.module('ajm-knob-knob', []);

newModule.directive('knobKnob', ["$log", function($log) {

	var template = '<div class="knob-knob" ng-mouseover="mouseEnter(1)" ng-mouseleave="mouseEnter(0)" ng-mousedown="toggleState()"> '
		         + '<i class="top"></i><div class="base"></div>'
		         + '<range-slider ng-show="actif || enter" formatter="setValue" callback="setValue" initvalues="initvalues"></range-slider>'
			     + '<span class="display-value">{{value}} </span>'
		         + '</div>';

	function link(scope, elem, attrs, model) {

		// call when internal model value changes
		scope.initWidget = function(initvalues) {

			if (initvalues === undefined) return;
			// console.log ("formatter Knob value=%j", initvalues);

			// let's ignore any empty value
			if ( initvalues.notMore) scope.range = initvalues.notMore - (initvalues.notLess || 0);

			if (!scope.handle) scope.handle= initvalues;

			scope.setValue (scope.initvalues.value, undefined);

		};

		scope.setValue = function (value, slider) {
			// ignore any non number value
			if (isNaN(value)) return;

			scope.value = value;
			var degree = ((scope.value/scope.range)*360);
			scope.rotate (degree);

			// if not initial state and callback define, let's report value
			if (slider && scope.callback) scope.callback (value, scope.cbhandle);
		};

		scope.rotate = function (angle) {

			var rotate = (angle % 360);
			// $log.log ("scope.rotate angle=%d", angle)
			scope.knobtop.css('transform','rotate('+(rotate)+'deg)');
		};

		scope.toggleState = function () {

			if (! scope.actif) {
				scope.actif = true;
				//scope.knobtop.addClass('button-actif');
				elem.addClass('button-actif');
			} else {
				scope.actif = false;
				elem.removeClass('button-actif');
			}
		};

		// knob is hover
		scope.mouseEnter =function (hover){
			// scope.callback (scope.value, scope.knobid, scope.handle);
			console.log ("knob mouseover hover=%d", hover)

			if (hover) scope.enter = true;
			else scope.enter=false;
		};

		// initialize widget

		scope.knobid  = attrs.id | "knob-" + parseInt (Math.random() * 1000);
		scope.knobtop = elem.find('i');
		scope.notLess = attrs.notLess || 0;
		scope.notMore = attrs.notMore || 100;
		scope.range   = scope.notMore - scope.notLess;

		scope.masterid = attrs.id | "master-" + parseInt(Math.random() * 1000);
		scope.$watch('initvalues', function () { 	// init Values may arrive late
			if (scope.initvalues) scope.initWidget(scope.initvalues);
		});
	}

	return {
		template: template,
		scope: {
			callback   : '=',
			initvalues : '=',
			inithook   : '=',  // Hook point to control slider from API
			cbhandle   : '='  // Argument added to every callback
		},
		restrict: 'E',
		link: link
	}
}]);
