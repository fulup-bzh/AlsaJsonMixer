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

newModule.directive('knobKnob', ["$log", "$timeout", "CtrlByNumid", function($log, $timeout, CtrlByNumid) {

	var template = '<div class="ajm-knob"  > '
			+ '<matrix-label class="ajm-knob-title" initvalues="channel"></matrix-label>'
	        + '<div class="ajm-knob-button" ng-mouseover="mouseEnter()" > '
		    + '<i class="ajm-knob-top"></i><div class="ajm-knob-base" ></div>'
			+ '<range-slider ng-show="actif || enter" formatter="setValue" callback="setValue" initvalues="ctrl"></range-slider>'
    		+ '</div>'
			+ '<span class="ajm-knob-value">{{value}}</span>'
			+ '</div>';

	function link(scope, elem, attrs, model) {

		// call when internal model value changes
		scope.initWidget = function(initvalues) {

			if (initvalues === undefined) return;
			// console.log ("InitWidget Knob value=%j", initvalues);

			scope.ctrl   =initvalues.ctrl;
			scope.channel=initvalues.channel;

			// let's ignore any empty value
			if ( scope.ctrl.notMore) scope.range = scope.ctrl.notMore - (scope.ctrl.notLess || 0);

			if (!scope.handle) scope.handle= scope.ctrl;

			scope.setValue (scope.ctrl.value);

			// save numid and register volume within central repository for session store/load
			CtrlByNumid.register (scope.channel.numid, scope);
		};

		scope.setValue = function (value, slider) {

			if (isNaN(value)) return; // hoops !!!
			scope.value = value; // formatter value is not an array

			var degree = ((scope.value/scope.range)*360);
			scope.rotate (degree);

			// balance equalisation not implement let's replicate value if needed
			var values=[];
			for (var idx=0; idx < scope.channel.count; idx++) {
				values.push (value);
			}

			// if not initial state and callback define, let's report value
			if (slider && scope.callback) scope.callback (scope.channel.numid, values);
		};

		scope.rotate = function (angle) {
			var rotate = (angle % 360);
			scope.knobtop.css('transform','rotate('+(rotate)+'deg)');
		};

		scope.toggleState = function () {

			if (! scope.actif) {
				scope.actif = true;
				elem.addClass('button-actif');
			} else {
				scope.actif = false;
				elem.removeClass('button-actif');
			}
		};

		// knob is hover display slider and remove after 3s
		scope.mouseEnter =function (){
			scope.enter = true;
			// remove slider after 3s
			$timeout.cancel (scope.timeout);
			scope.timeout= $timeout (function(){scope.enter =false}, 3000);
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
			initvalues : '='
		},
		restrict: 'E',
		link: link
	}
}]);

console.log ("KnobKnob Loaded");
