"use strict";function avirer(a){a.fn.knobKnob=function(b){var c=a.extend({snap:0,value:0,turn:function(){}},b||{}),d='<div class="knob">\r\n				<i class="top"></i>\r\n				<div class="base"></div>\r\n			</div>';return this.each(function(){var b=a(this);b.append(d);var e=a(".knob",b),f=e.find(".top"),g=-1,h=0,i=0,j=0,k=a(document);c.value>0&&c.value<=359&&(i=h=c.value,f.css("transform","rotate("+h+"deg)"),c.turn(h/359)),e.on("mousedown touchstart",function(a){a.preventDefault();var b,d,l,m,n=e.offset(),o={y:n.top+e.height()/2,x:n.left+e.width()/2},p=180/Math.PI;e.on("mousemove.rem touchmove.rem",function(a){return a=a.originalEvent.touches?a.originalEvent.touches[0]:a,b=o.y-a.pageY,d=o.x-a.pageX,l=Math.atan2(b,d)*p,0>l&&(l=360+l),-1==g&&(g=l),m=Math.floor(l-g+i),0>m?m=360+m:m>359&&(m%=360),c.snap&&m<c.snap&&(m=0),Math.abs(m-j)>180?!1:(h=m,j=m,f.css("transform","rotate("+h+"deg)"),void(scope.callback&&scope.callback(h/359)))}),k.on("mouseup.rem  touchend.rem",function(){e.off(".rem"),k.off(".rem"),i=h,g=-1})})})}}var ngapp=angular.module("mixer-ui-app",["ngRoute","ui-notification","bzm-range-slider","mm.foundation","bzm-knob-knob","ajg-mixer-connect","ajg-monitor-gateway","ajg-matrix-source","ajg-matrix-volume"]);ngapp.config(["$routeProvider","$locationProvider","$controllerProvider","$compileProvider","$filterProvider","$provide",function(a,b,c,d,e,f){ngapp.addController=c.register,ngapp.addDirective=d.directive,ngapp.routeProvider=a,ngapp.filterProvider=e,ngapp.provide=f,a.when("/",{templateUrl:"partials/mixer-connect.html"}).when("/scarlett",{templateUrl:"partials/scarlett-mixer.html",controller:"ScarlettMixerController as Scarlett",resolve:{deps:function(a,b){var c=a.defer(),d=["/mixers/dev/ScarlettMixerMod.js","/mixers/dev/ScarlettCaptureMod.js"];return $script(d,function(){b.$apply(function(){c.resolve()})}),c.promise}}}).when("/scarlett-18i8-usb",{redirectTo:"/scarlett"}).otherwise({redirectTo:"/"})}]);var newModule=angular.module("bzm-knob-knob",[]);newModule.directive("knobKnob",["$log","$timeout",function(){function a(a,b,c,d){d.$formatters.unshift(function(b){void 0!==b&&(b.notMore&&(a.range=b.notMore-(b.notLess||0)),a.value=b.value,a.setValue(a.value))}),a.setValue=function(b){var c=b/a.range*360;a.rotate(c),a.value=b},a.rotate=function(b){a.currentDeg=b%360,a.knobtop.css("transform","rotate("+a.currentDeg+"deg)")},a.toggleState=function(){return a.active?(a.active=!1,a.knobtop.removeClass("knob-button-active")):(a.active=!0,a.knobtop.addClass("knob-button-active")),a.active},a.mouseDown=function(){a.callback(a)},a.init=function(){a.knobtop=b.find("i"),a.notLess=0,a.notMore=100,a.startDeg=-1,a.currentDeg=0,a.rotation=0,a.lastDeg=0,a.channel=c.channel,a.title=c.title},a.init()}var b='<div class="knob" ng-mousedown="mouseDown($event)"> <i class="top"></i><div class="base"></div></div>';return{template:b,scope:{callback:"="},restrict:"E",require:"ngModel",link:a}}]);var newModule=angular.module("ajg-matrix-input",[]);newModule.directive("matrixInput",["$log","$timeout",function(){function a(a,b){var d=c.cloneNode(!1);return b.appendChild(d),d.label=a.name,d.textContent=a.name,d.value=a.id,d}function b(b,c,d,e){b.selectElem=c[0].firstChild,e.$formatters.unshift(function(a){b.volume=a,b.selection=a.value,b.selectElem.value=a.value}),b.$watch("matrixSourcesPool",function(){for(var d=c[0].firstChild,e=0;e<b.matrixSourcesPool.length;e++){var f=a(b.matrixSourcesPool[e],d);b.matrixSourcesPool[e].options.push(f),b.matrixSourcesPool[e].used?f.disabled=!0:b.volume&&b.volume.value===e&&(b.callback(b.volume,e),f.selected=!0)}}),b.selected=function(){return b.selection=b.selectElem.value,void 0!==b.selection?b.matrixSourcesPool[b.selection].used?void(b.selection=b.volume.value):void b.callback(b.volume,b.selection):void 0}}var c=document.createElement("option"),d='<select title="{{channel.name}}" title={{channel.name}} class="ajg-stereo-input-linein" ng-click="selected()"></select>';return{template:d,scope:{channel:"=",callback:"=",matrixSourcesPool:"="},restrict:"E",require:"ngModel",link:b}}]),newModule.directive("matrixSource",["$log","$timeout",function(){function a(a,b,c,d){a.leftChannel="",a.rightChannel="",a.prefad=[],d.$formatters.unshift(function(b){b&&(a.leftChannel={name:b.left.name,actif:b.left.actif,numid:b.left.numid,value:b.left.value[0]},a.rightChannel={name:b.right.name,actif:b.right.actif,numid:b.right.numid,value:b.right.value[0]},a.label=b.label,a.matrixSourcesPool=b.matrixSourcesPool)}),a.selected=function(b,c){b&&(a.callback.free(b.value),a.callback.take(c),b.value=c)},a.init=function(){a.inputid=c.id||"analog-in-"+parseInt(1e3*Math.random()),a.name=c.name||"NoName",a.label=c.label||"NoLabel"},a.init()}var b='<div class="small-1 columns ajg-stereo-input"><line-input class="ajg-select-left"  lines-in-pool="matrixSourcesPool" ng-model=leftChannel  callback="selected"></line-input><line-input class="ajg-select-right" lines-in-pool="matrixSourcesPool" ng-model=rightChannel callback="selected"></line-input><input type="text" class="ajg-stereo-input-linein" value="{{label}}"></div>';return{template:b,scope:{callback:"="},restrict:"E",require:"ngModel",link:a}}]);var newModule=angular.module("ajg-matrix-source",[]);newModule.directive("lineInput",["$log","$timeout",function(){function a(a,b){var d=c.cloneNode(!1);return b.appendChild(d),d.label=a.name,d.textContent=a.name,d.value=a.id,d}function b(b,c,d,e){b.selectElem=c[0].firstChild,e.$formatters.unshift(function(a){b.volume=a,b.selection=a.value,b.selectElem.value=a.value}),b.$watch("matrixLinesPool",function(){for(var d=c[0].firstChild,e=0;e<b.matrixLinesPool.length;e++){var f=a(b.matrixLinesPool[e],d);b.matrixLinesPool[e].options.push(f),b.matrixLinesPool[e].used?f.disabled=!0:b.volume&&b.volume.value===e&&(b.callback(b.volume,e),f.selected=!0)}}),b.selected=function(){return b.selection=b.selectElem.value,void 0!==b.selection?b.matrixLinesPool[b.selection].used?void(b.selection=b.volume.value):void b.callback(b.volume,b.selection):void 0}}var c=document.createElement("option"),d='<select title="{{channel.name}}" title={{channel.name}} class="ajg-stereo-input-linein" ng-click="selected()"></select>';return{template:d,scope:{channel:"=",callback:"=",matrixLinesPool:"="},restrict:"E",require:"ngModel",link:b}}]),newModule.directive("matrixSource",["$log","$timeout",function(){function a(a,b,c,d){a.leftLine="",a.rightLine="",a.prefad=[],d.$formatters.unshift(function(b){b&&(a.leftLine={name:b.leftLine.name,actif:b.leftLine.actif,numid:b.leftLine.numid,value:b.leftLine.value[0]},a.rightLine={name:b.rightLine.name,actif:b.rightLine.actif,numid:b.rightLine.numid,value:b.rightLine.value[0]},a.label=b.label,a.matrixLinesPool=b.matrixLinesPool)}),a.selected=function(b,c){b&&(a.callback.free(b.value),a.callback.take(c),b.value=c)},a.init=function(){a.inputid=c.id||"analog-in-"+parseInt(1e3*Math.random()),a.name=c.name||"NoName",a.label=c.label||"NoLabel",a.route=c.route||!1,a.source=c.source||!1},a.init()}var b='<div class="small-1 columns ajg-stereo-input"><input ng-show="route" type="text" class="ajg-stereo-input-linein" value="{{label}}"><line-input class="ajg-select-left"  matrix-lines-pool="matrixLinesPool" ng-model=leftLine  callback="selected"></line-input><line-input class="ajg-select-right" matrix-lines-pool="matrixLinesPool" ng-model=rightLine callback="selected"></line-input><input ng-show="source" type="text" class="ajg-stereo-input-linein" value="{{label}}"></div>';return{template:b,scope:{callback:"="},restrict:"E",require:"ngModel",link:a}}]);var newModule=angular.module("ajg-matrix-volume",[]);newModule.directive("matrixVolume",["$log","$timeout",function(){function a(a,b,c,d){a.prefad=[],d.$formatters.unshift(function(b){if(b){a.rightTitle=b.rightLine.title,a.leftTitle=b.leftLine.title,a.leftSliderModel=b.leftLine,a.rightSliderModel=b.rightLine,a.rightBalanceModel={value:0,notMore:64,notLess:-64},a.leftBalanceModel={value:0,notMore:64,notLess:-64};var c=(b.leftLine.notMore-b.leftLine.notLess)/2;a.sliderBalanceModel={title:"Select Channel to adjust L/R channel balance",notMore:c,notLess:-1*c,disabled:!0}}}),a.LeftSliderCB=function(b){return a.prefad.PFLM&&(a.rightSliderModel={value:b}),b},a.RightSliderCB=function(b){return a.prefad.PFLM&&(a.leftSliderModel={value:b}),b},a.BalanceSliderCB=function(b){return a.callback("BALANCE-FADER",b),a.activeKnob&&a.activeKnob.setValue(b),b},a.PreFader=function(b,c){var d=angular.element(b.target);a.prefad[c]?(a.prefad[c]=!1,d.removeClass("pfl-button-active")):(a.prefad[c]=!0,d.addClass("pfl-button-active")),a.callback("PFL-"+c,a.prefad[c])},a.knobResetCB=function(){a.rightBalanceModel=a.leftBalanceModel={value:0},a.rightBalanceModel=a.leftBalanceModel={value:0},a.activeKnob&&(a.activeKnob.toggleState(),a.activeKnob=null,a.sliderBalanceModel={disabled:!0})},a.knobToggleCB=function(b){b.toggleState()?(a.activeKnob&&a.activeKnob.toggleState(),a.activeKnob=b,a.sliderBalanceModel={disabled:!1,value:b.value}):(a.sliderBalanceModel={disabled:!0},a.activeKnob=!1)},a.init=function(){a.inputid=c.id||"analog-in-"+parseInt(1e3*Math.random()),a.name=c.name||"NoName",a.label=c.label||"NoLabel"},a.init()}return{templateUrl:"partials/matrix-volume.html",scope:{callback:"="},restrict:"E",require:"ngModel",link:a}}]);var newModule=angular.module("ajg-mixer-connect",[]);newModule.directive("ajgMixerConnect",["$log","$timeout","$http","$location","$route",function(a,b,c,d,e){function f(a,b,f){a.getCards=function(){var b={request:"get-cards"},d=c.get("/alsajson",{params:b});d.success(function(b){a.online=1,a.sndcards=b}),d.error(function(){a.online=0})},a.selectCard=function(b){var c="/"+a.sndcards[b].name.toLowerCase().replace(/ /g,"-");!c in e.routes&&(c="/generic"),d.path(c).search("card",a.sndcards[b].index)},a.init=function(){a.title=f.title||"Sound Cards @ Gateway",a.icon=f.icon,a.getCards()},a.init()}var g='<div class="ajg-mixer-connect"><div><i class="ajg-connect-title">{{title}}<i><ajg-monitor-status class="ajg-connect-status" icon={{icon}}"></ajg-monitor-status></div><div  ng-repeat="sndcard in sndcards"><div  title="{{sndcard.info}}"  ng-click="selectCard(sndcard.index)"><div class="row ajg-connect-sndcard"><div class="small-10 columns"><span class="ajg-connect-name"> {{sndcard.name}} </span></div><div class="small-1 columns"><span class="ajg-connect-uid">  {{sndcard.uid}}  </span></div></div></div></div></div>';return{template:g,scope:{},restrict:"E",link:f}}]);var newModule=angular.module("ajg-monitor-gateway",[]);newModule.directive("ajgMonitorStatus",["$log","$timeout","$http","$location","Notification",function(a,b,c,d,e){function f(a){this.pingrate=1e3*a,this.elems=[],this.status;var d=this;this.register=function(a){this.elems.push(a),this.status?(a.addClass("ajg-online"),a.removeClass("ajg-offline")):(a.addClass("ajg-offline"),a.removeClass("ajg-online"))},this.online=function(){for(var a=0;a<this.elems.length;a++)this.elems[a].addClass("ajg-online"),this.elems[a].removeClass("ajg-offline")},this.offline=function(){for(var a=0;a<this.elems.length;a++)this.elems[a].addClass("ajg-offline"),this.elems[a].removeClass("ajg-online")},this.getping=function(){var a={request:"get-ping"},f=c.get("/alsajson",{params:a});f.success(function(){d.status||(e.success({message:"Alsa Server Back to Live",delay:3e3}),d.online()),d.status=1}),f.error(function(){d.status&&(e.warning({message:"Alsa Server Lost",delay:5e3}),d.offline()),d.status=0}),b(d.getping,d.pingrate)},this.getping()}function g(a,b,c){a.init=function(){a.icon=c.icon||"fa-cog",a.hostname=d.host(),a.httpdport=d.port(),i.register(b)},a.init()}var h='<div class="ajg-monitor"><span class="ajg-monitor-gateway ">alsa://{{hostname}}:{{httpdport}}</span><i class="ajg-monitor-status fa fa-cog"></i></div>',i=new f(10);return{template:h,scope:{},restrict:"E",link:g}}]),function(a){a.fn.knobKnob=function(b){var c=a.extend({snap:0,value:0,turn:function(){}},b||{}),d='<div class="knob">\r\n				<div class="top"></div>\r\n				<div class="base"></div>\r\n			</div>';return this.each(function(){var b=a(this);b.append(d);var e=a(".knob",b),f=e.find(".top"),g=-1,h=0,i=0,j=0,k=a(document);c.value>0&&c.value<=359&&(i=h=c.value,f.css("transform","rotate("+h+"deg)"),c.turn(h/359)),e.on("mousedown touchstart",function(a){a.preventDefault();var b,d,l,m,n=e.offset(),o={y:n.top+e.height()/2,x:n.left+e.width()/2},p=180/Math.PI;e.on("mousemove.rem touchmove.rem",function(a){return a=a.originalEvent.touches?a.originalEvent.touches[0]:a,b=o.y-a.pageY,d=o.x-a.pageX,l=Math.atan2(b,d)*p,0>l&&(l=360+l),-1==g&&(g=l),m=Math.floor(l-g+i),0>m?m=360+m:m>359&&(m%=360),c.snap&&m<c.snap&&(m=0),Math.abs(m-j)>180?!1:(h=m,j=m,f.css("transform","rotate("+h+"deg)"),void c.turn(h/359))}),k.on("mouseup.rem  touchend.rem",function(){e.off(".rem"),k.off(".rem"),i=h,g=-1})})})}}(jQuery);