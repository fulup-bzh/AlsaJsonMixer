/**
 * @name		jQuery SwitchSwitch plugin
 * @author		Fulup Ar Foll Angular from Martin Angelov JQuery Version
 * @version 	1.0
 * @url			http://git-hub/fulup-bzh
 * @Jquery		http://tutorialzine.com/2011/11/pretty-switches-css3-jquery/
 * @license		MIT License
 *
 */

'use strict';

var newModule = angular.module('ajm-playback-switch', []);

newModule.directive('playbackSwitch', ["$log", function($log, $timeout) {

	var template = '<div class="playback-switch" title="{{switch.name}}"> '
		         + '  <span ng-repeat="count in indexes" ng-click="toggleState($event, $index)" class="playback-switch-button {{extraclass}}">{{count}}</span>'
		         + '</div>';

	var globalcount = 1;

	function link(scope, elem, attrs, model) {

		// call when internal model value changes
		scope.initWidget = function(initvalues) {
			var indexes  = [];
            var idx;

			if (initvalues === undefined) return;
			// $log.log ("playback-switch init=", initvalues);

			// ng-repeat refuse to loop on boolean data !!!
			for (idx = 0; idx < initvalues.value.length; idx++ ) {
				indexes.push (globalcount++);

			}

			// update UI and save initvalues
			scope.indexes = indexes;
            scope.switch = initvalues;


			// master switch is the only one that is not stereo
            if (idx === 1) scope.extraclass="playback-switch-master";
			else scope.extraclass="";

		};


		scope.toggleState = function (event, index) {

			var button  = angular.element(event.target);
			var value = scope.switch.value;

			if (! value [index]) {
				value [index] = true;
				button.addClass('button-actif');
			} else {
				value [index] = false;
				button.removeClass('button-actif');
			}

			// send control value to alsa gateway
			scope.callback (scope.switch.numid, scope.switch.value);
		};


		// initialize widget
  		scope.switchid  = attrs.id | "switch-" + parseInt (Math.random() * 1000);
		scope.$watch ('initvalues', function () { 	// init Values may arrive late
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
