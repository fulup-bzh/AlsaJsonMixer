/**
 * @name		jQuery KnobKnob plugin
 * @author		Fulup Ar Foll Angular from Martin Angelov JQuery Version
 * @version 	1.0
 * @url			http://git-hub/fulup-bzh
 * @Jquery		http://tutorialzine.com/2011/11/pretty-switches-css3-jquery/
 * @license		MIT License
 *
 */

function avirer ($){
	
	$.fn.knobKnob = function(props){
	
		var options = $.extend({
			snap: 0,
			value: 0,
			turn: function(){}
		}, props || {});
	
		var tpl = '<div class="knob">\
				<i class="top"></i>\
				<div class="base"></div>\
			</div>';
	
		return this.each(function(){
			
			var el = $(this);
			el.append(tpl);
			
			var knob = $('.knob',el),
				knobTop = knob.find('.top'),
				startDeg = -1,
				currentDeg = 0,
				rotation = 0,
				lastDeg = 0,
				doc = $(document);
			
			if(options.value > 0 && options.value <= 359){
				rotation = currentDeg = options.value;
				knobTop.css('transform','rotate('+(currentDeg)+'deg)');
				options.turn(currentDeg/359);
			}
			
			knob.on('mousedown touchstart', function(e){
			
				e.preventDefault();
			
				var offset = knob.offset();
				var center = {
					y : offset.top + knob.height()/2,
					x: offset.left + knob.width()/2
				};
				
				var a, b, deg, tmp,
					rad2deg = 180/Math.PI;
				
				knob.on('mousemove.rem touchmove.rem',function(e){
					
					e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;
					
					a = center.y - e.pageY;
					b = center.x - e.pageX;
					deg = Math.atan2(a,b)*rad2deg;
					
					// we have to make sure that negative
					// angles are turned into positive:
					if(deg<0){
						deg = 360 + deg;
					}
					
					// Save the starting position of the drag
					if(startDeg == -1){
						startDeg = deg;
					}
					
					// Calculating the current rotation
					tmp = Math.floor((deg-startDeg) + rotation);
					
					// Making sure the current rotation
					// stays between 0 and 359
					if(tmp < 0){
						tmp = 360 + tmp;
					}
					else if(tmp > 359){
						tmp = tmp % 360;
					}
					
					// Snapping in the off position:
					if(options.snap && tmp < options.snap){
						tmp = 0;
					}
					
					// This would suggest we are at an end position;
					// we need to block further rotation.
					if(Math.abs(tmp - lastDeg) > 180){
						return false;
					}
					
					currentDeg = tmp;
					lastDeg = tmp;
		
					knobTop.css('transform','rotate('+(currentDeg)+'deg)');
					if (scope.callback) scope.callback(currentDeg/359);
				});
			
				doc.on('mouseup.rem  touchend.rem',function(){
					knob.off('.rem');
					doc.off('.rem');
					
					// Saving the current rotation
					rotation = currentDeg;
					
					// Marking the starting degree as invalid
					startDeg = -1;
				});
			
			});
		});
	};
	
};


'use strict';

var newModule = angular.module('bzm-knob-knob', []);

newModule.directive('knobKnob', ["$log", '$timeout', function($log, $timeout) {

	var template = '<div class="knob" ng-mousedown="mouseDown($event)"> <i class="top"></i><div class="base"></div></div>';

	function link(scope, elem, attrs, model) {

		scope.count=0;

		// call when internal model value changes
		model.$formatters.unshift(function(modelvalue) {
			scope.value = modelvalue;

			if (scope.count++ > 100) return;

			// let's ignore any empty value
			if (modelvalue === undefined) return;

			scope.currentDeg = (scope.value % 360);

		    scope.knobtop.css('transform','rotate('+(scope.currentDeg)+'deg)');
			if (scope.callback) scope.callback (scope.currentDeg);

		});

		scope.mouseDown =function (event){

			$log.log ("mouse down knob=", event);


			return;

			var event = (event.originalEvent.touches) ? event.originalEvent.touches[0] : event;

			var a = center.y - event.pageY;
			var b = center.x - event.pageX;
			var deg = Math.atan2(a,b)*rad2deg;

			// Save the starting position of the drag
			if(startDeg == -1) startDeg = deg;

			// Calculating the current rotation
			var tmp = Math.floor((deg-startDeg) + scope.rotation);

			// Making sure the current rotation stays between 0 and 359
   		    tmp = tmp % 360;

			// Snapping in the off position:
			if(options.snap && tmp < options.snap){
				tmp = 0;
			}

			// This would suggest we are at an end position;
			// we need to block further rotation.
			if(Math.abs(tmp - lastDeg) > 180){
				return false;
			}

			var currentDeg = tmp;
			lastDeg = tmp;

			knobTop.css('transform','rotate('+(currentDeg)+'deg)');
			if (scopevent.callback) scopevent.callback(currentDeg/359);
		};


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

		scope.init = function () {
			scope.knobtop = elem.find('i');
			scope.startDeg = -1;
			scope.currentDeg = 0;
			scope.rotation = 0;
			scope.lastDeg = 0;

			scope.title = attrs.title;
		};

		scope.init(); // let's init knob
	}

	return {
		template: template,
		scope: {
			callback   : '='
		},
		restrict: 'E',
		require : 'ngModel',
		link: link
	}
}]);
