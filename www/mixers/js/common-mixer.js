"use strict";function ajgMasterVolume(a){function b(b,c,d){b.initWidget=function(c){void 0!==c&&(c.numid>200&&a.log("master-volume init=",c),b.volumes=c)},b.masterid=d.id|"master-"+parseInt(1e3*Math.random()),b.$watch("initvalues",function(){b.initvalues&&b.initWidget(b.initvalues)}),b.panelTitle=d.panelTitle||"Volumes"}var c='<div class="ajm-master-volume"> <p class="ajm-volume-title">"{{panelTitle}}"</p><knob-knob ng-repeat="volume in volumes"  title="{{volume.channel.label}}" callback="callback"   class="ajm-volume-knob valuecount-{{volume.channel.count}}" initvalues="volume"></knob-knob></div>';return{template:c,scope:{callback:"=",initvalues:"="},restrict:"E",link:b}}function labelByUid(){this.labelbyuid=[];var a=this;this.$get=function(){return a},this.register=function(a){a&&(this.labelbyuid[a.uid]=a)},this.setValue=function(a,b){a&&(this.labelbyuid[a]&&this.labelbyuid[a].setValue?this.labelbyuid[a].setValue(b):this.labelbyuid[a]={uid:a,label:b})},this.getPool=function(){var a=[],b=this.labelbyuid;return Object.keys(this.labelbyuid).forEach(function(c,d){var e=b[c];a.push({uid:e.uid,label:e.label})}),a},this.getValue=function(a){return this.labelbyuid[a]?this.labelbyuid[a].label:void 0},this.reset=function(){var a=this.labelbyuid;Object.keys(this.labelbyuid).forEach(function(b,c){a[b]&&a[b].setValue&&a[b].setValue(void 0)})}}function AjgNumidCtrlPool(){this.ctrlbynumid=[];var a=this;this.$get=function(){return a},this.register=function(a,b){b&&(this.ctrlbynumid[a]=b)},this.setValue=function(a,b){if(a){var c=this.ctrlbynumid[a];c&&c.setValue&&c.setValue(b)}},this.refreshPool=function(a){var b=this.ctrlbynumid;Object.keys(this.ctrlbynumid).forEach(function(c,d){if(b[c].getCbHandle){var e=b[c],f=e.getCbHandle();f.mixgrp==a&&e.forceRefresh(50)}})},this.getNumids=function(){var a=[];this.ctrlbynumid;return Object.keys(this.ctrlbynumid).forEach(function(b,c){a.push(parseInt(b))}),a},this.getPool=function(){var a=[],b=this.ctrlbynumid;return Object.keys(this.ctrlbynumid).forEach(function(c,d){var e=b[c];a.push({numid:e.numid,value:e.value})}),a},this.getValue=function(a){return this.ctrlbynumid[a]?this.ctrlbynumid[a].value:void 0}}var ngapp=angular.module("mixer-ui-app",["ngRoute","ui-notification","bzm-range-slider","mm.foundation","ajm-knob-knob","ajm-playback-switch","ajm-register-numid","ajm-mixer-connect","ajm-monitor-gateway","ajm-matrix-route","ajm-matrix-fader","ajm-master-volume","ajm-matrix-label"]);ngapp.config(["$routeProvider","$locationProvider","$controllerProvider","$compileProvider","$filterProvider","$provide",function(a,b,c,d,e){ngapp.addController=c.register,ngapp.addDirective=d.directive,ngapp.routeProvider=a,ngapp.provide=e;var f;f=AJG_GLOBAL_DEBUG?["/mixers/dev/ScarlettMasterMod.js","/mixers/dev/ScarlettMixerMod.js","/mixers/dev/ScarlettCaptureMod.js"]:["/mixers/js/scarlett-mixer.js"],a.when("/",{templateUrl:"partials/mixer-connect.html"}).when("/scarlett",{templateUrl:"partials/scarlett-mixer.html",controller:"ScarlettMixerController as Scarlett",resolve:{deps:["$q","$rootScope",function(a,b){var c=a.defer();return $script(f,function(){b.$apply(function(){c.resolve()})}),c.promise}]}}).when("/scarlett-18i8-usb",{redirectTo:"/scarlett"}).when("/scarlett-18i20-usb",{redirectTo:"/scarlett"}).when("/scarlett-6i6-usb",{redirectTo:"/scarlett"}).otherwise({redirectTo:"/"})}]);var newModule=angular.module("ajm-knob-knob",[]);newModule.directive("knobKnob",["$log","$timeout","CtrlByNumid",function(a,b,c){function d(a,d,e,f){a.initWidget=function(b){void 0!==b&&(a.ctrl=b.ctrl,a.channel=b.channel,a.ctrl.notMore&&(a.range=a.ctrl.notMore-(a.ctrl.notLess||0)),a.handle||(a.handle=a.ctrl),a.setValue(a.ctrl.value),c.register(a.channel.numid,a))},a.setValue=function(b,c){if(!isNaN(b)){a.value=b;var d=a.value/a.range*360;a.rotate(d);for(var e=[],f=0;f<a.channel.count;f++)e.push(b);a.normalized=parseInt(Math.sqrt(b/a.range)*a.range),c&&a.callback&&a.callback(a.channel.numid,[a.normalized,a.normalized])}},a.rotate=function(b){var c=b%360;a.knobtop.css("transform","rotate("+c+"deg)")},a.toggleState=function(){a.actif?(a.actif=!1,d.removeClass("button-actif")):(a.actif=!0,d.addClass("button-actif"))},a.mouseEnter=function(){a.enter=!0,b.cancel(a.timeout),a.timeout=b(function(){a.enter=!1},3e3)},a.knobid=e.id|"knob-"+parseInt(1e3*Math.random()),a.knobtop=d.find("i"),a.notLess=e.notLess||0,a.notMore=e.notMore||100,a.range=a.notMore-a.notLess,a.masterid=e.id|"master-"+parseInt(1e3*Math.random()),a.$watch("initvalues",function(){a.initvalues&&a.initWidget(a.initvalues)})}var e='<div class="ajm-knob"  > <matrix-label class="ajm-knob-title" initvalues="channel"></matrix-label><div class="ajm-knob-button" ng-mouseover="mouseEnter()" > <i class="ajm-knob-top"></i><div class="ajm-knob-base" ></div><range-slider ng-show="actif || enter" formatter="setValue" callback="setValue" initvalues="ctrl"></range-slider></div><span class="ajm-knob-value">{{normalized}}</span></div>';return{template:e,scope:{callback:"=",initvalues:"="},restrict:"E",link:d}}]);var newModule=angular.module("ajm-master-volume",[]);newModule.directive("masterVolume",["$log",ajgMasterVolume]);var newModule=angular.module("ajm-matrix-fader",[]);newModule.directive("matrixFader",["$log","$timeout","CtrlByNumid",function(a,b,c){function d(a,b,d,e){a.prefad=[],a.initWidget=function(b){if(b){var c=b[0];a.range=c[0].ctrl.notMore-c[0].ctrl.notLess,2==c[0].length&&(a.stereo=!0),a.MixerModel=b,a.ctrlById=[],a.sliderById=[],a.syncMix=[];for(var d=(2===b.length,2===b[0].length),e=0;e<b.length;e++){d&&(a.syncMix[e]=!1);for(var f=b[e],g=0;g<f.length;g++){var h=f[g];a.ctrlById[h.channel.numid]=h.ctrl}}}},a.StereoMix=function(b,c){var d=angular.element(b.target);if(a.syncMix[c])a.syncMix[c]=!1,d.removeClass("pfl-button-actif"),Object.keys(a.sliderById).forEach(function(b,d){var e=a.sliderById[b].getCbHandle(),f=a.sliderById[b];e.idxin===c&&(f.updateClass("not-sync",!0),0!==e.idxout&&f.setDisable(!1))},a.sliderById);else{a.syncMix[c]=!0;var e=0;Object.keys(a.sliderById).forEach(function(b,d){var f=a.sliderById[b].getCbHandle(),g=a.sliderById[b];f.idxin===c&&(a.sliderById[b].updateClass("not-sync",!1),0==f.idxout?e=g.getValue():(g.setDisable(!0),g.setValue(e)))},a.sliderById),d.addClass("pfl-button-actif")}},a.SliderInit=function(b){var d=b.getCbHandle();a.sliderById[d.numid]=b,c.register(d.numid,b)},a.FaderSliderCB=function(b,c){var d=[];if(void 0==c)return b;if(a.prefad.PFLM)Object.keys(a.sliderById).forEach(function(c,e){var f=a.sliderById[c].getCbHandle(),g=a.sliderById[c];g.setValue(b),d.push(f.numid)},a.sliderById);else{var e=c.getCbHandle();if(d.push(e.numid),a.syncMix[e.idxin]){var f=a.sliderById[e.numid+1];f.setValue(b),d.push(e.numid+1)}}var g=parseInt(Math.sqrt(b/a.range)*a.range);return a.ismuted||a.callback(d,g),g},a.ToggleMute=function(b,c){if(c){a.ismuted=!0;var d=[];Object.keys(a.sliderById).forEach(function(c,e){var f=a.sliderById[c].getCbHandle();b==f.idxin&&d.push(f.numid)},a.sliderById),a.callback(d,0)}else a.ismuted=!1,Object.keys(a.sliderById).forEach(function(c,d){var e=a.sliderById[c].getCbHandle();if(b==e.idxin){var f=a.sliderById[c],g=f.getValue(g);a.callback([e.numid],g)}},a.sliderById)},a.PreFader=function(b,c){var d=angular.element(b.target);a.prefad[c]?(a.prefad[c]=!1,d.removeClass("pfl-button-actif"),"MUTL"==c&&a.ToggleMute(0,!1),"MUTR"==c&&a.ToggleMute(1,!1)):(a.prefad[c]=!0,d.addClass("pfl-button-actif"),"MUTL"==c&&a.ToggleMute(0,!0),"MUTR"==c&&a.ToggleMute(1,!0))},a.inputid=d.id||"analog-in-"+parseInt(1e3*Math.random()),a.name=d.name||"NoName",a.label=d.label||"NoLabel",a.switchid=d.id|"switch-"+parseInt(1e3*Math.random()),a.$watch("initvalues",function(){a.initvalues&&a.initWidget(a.initvalues)})}return{templateUrl:"partials/matrix-fader.html",scope:{callback:"=",initvalues:"="},restrict:"E",link:d}}]);var newModule=angular.module("ajm-matrix-label",[]);newModule.provider("LabelByUid",labelByUid),newModule.directive("matrixLabel",["$log","LabelByUid",function(a,b){function c(a,c,d,e){a.setValue=function(b){a.label=b},a.initWidget=function(){a.initvalues&&(a.list=d.list,a.placeholder=d.placeholder,a.uid=a.initvalues.uid,a.label=b.getValue(a.uid)||a.initvalues.label,b.register(a))},a.callback&&a.$watch("label",function(){a.callback(a.label,c)}),a.initWidget(),a.$watch("initvalues",a.initWidget)}var d="{ updateOn: 'default blur', debounce: {'default': 1000, 'blur': 0} }",e='<input type="text" class="ajm-matrix-label" ng-model="label" list={{list}} placeholder={{placeholder}} ng-model-options="'+d+'">';return{template:e,scope:{initvalues:"=",label:"=",used:"=",callback:"="},restrict:"E",link:c}}]);var newModule=angular.module("ajm-matrix-route",[]);newModule.directive("lineInput",["$log","CtrlByNumid",function(a,b){function c(a,b){var c=e.cloneNode(!1);return b.appendChild(c),c.label=a.name,c.textContent=a.name,c.value=a.id,c}function d(a,d,e){a.selectElem=d[0].firstChild,a.initWidget=function(c){a.channel=c,a.selection=c.value,a.selectElem.value=c.value,b.register(a.channel.numid,a)},a.setValue=function(b){a.selection=b,a.selectElem.value=b},a.$watch("matrixLinesPool",function(){for(var b=d[0].firstChild,e=0;e<a.matrixLinesPool.length;e++){var f=c(a.matrixLinesPool[e],b);a.matrixLinesPool[e].options.push(f),a.matrixLinesPool[e].used?f.disabled=!0:a.channel&&a.channel.value===e&&(a.callback(a.matrixLinesPool,a.channel,e,!0),f.selected=!0)}}),a.selected=function(){return a.selection=a.selectElem.value,void 0!==a.selection?a.matrixLinesPool[a.selection].used?void(a.selection=a.channel.value):void a.callback(a.matrixLinesPool,a.channel,a.selection):void 0},a.initvalues&&a.initWidget(a.initvalues)}var e=document.createElement("option"),f='<select title="{{channel.name}}" title={{channel.name}} ng-click="selected()"></select>';return{template:f,scope:{channel:"=",callback:"=",matrixLinesPool:"=",initvalues:"="},restrict:"E",link:d}}]),newModule.directive("matrixRoute",["$log",function(a){function b(b,c,d,e){b.leftLine="",b.rightLine="",b.prefad=[],b.initWidget=function(a){a&&(b.MatrixLines=a.lines,b.matrixLinesPool=a.matrixLinesPool,b.info={uid:a.uid,label:a.label})},b.selected=function(c,d,e,f){d&&(f||(a.log("free channel ",d.value),b.callback.free(c,d,d.value)),b.callback.take(c,d,e),d.value=e)},b.init=function(){b.inputid=d.id||"matrix-"+parseInt(1e3*Math.random()),b.name=d.name||"NoName",b.label=d.label||"NoLabel",b.initvalues&&b.initWidget(b.initvalues),b.$watch("initvalues",function(){b.initvalues&&b.initWidget(b.initvalues)})},b.init()}var c='<div class="ajm-matrix-route"><matrix-label class="ajm-route-label" initvalues="info"></matrix-label><div class="ajm-route-select" ng-repeat="line in MatrixLines"><line-input class="ajm-route-linein ajm-select-{{$index}}"  matrix-lines-pool="matrixLinesPool" initvalues="line" callback="selected"></line-input></div></div>';return{template:c,scope:{callback:"=",initvalues:"="},restrict:"E",link:b}}]);var newModule=angular.module("ajm-mixer-connect",[]);newModule.directive("mixerConnect",["$log","$timeout","$http","$location","$route",function(a,b,c,d,e){function f(a,b,f){a.sndbrand=function(a){var b=a.name.split(" ")[0];return b.toLowerCase()},a.getCards=function(){var b={request:"card-get-all"},d=c.get("/jsonapi",{params:b});d.success(function(b,c,d,e){return"AJG_sndlist"!=b.ajgtype?void alert("AJM:FATAL ajm-mixer-connect response="+b):(a.online=1,void(a.sndcards=b.data))}),d.error(function(b,c,d){a.online=0})},a.selectCard=function(b){if(void 0==b)return void alert("AJM:Fatal invalid sndcard index [please report bug]");var c="/"+a.sndcards[b].name.toLowerCase().replace(/ /g,"-");!c in e.routes&&(c="/generic"),d.path(c).search("card","hw:"+a.sndcards[b].cardid)},a.title=f.title||"Sound Cards @ Gateway",a.icon=f.icon,a.getCards()}var g='<div class="ajm-mixer-connect"><div><i class="ajm-connect-title">{{title}}<i><monitor-status class="ajm-connect-status" icon={{icon}}"></monitor-status></div><div  ng-repeat="sndcard in sndcards"><div  title="{{sndcard.info}}" ng-click="selectCard($index)"> <div class="row ajm-connect-sndcard ajm-{{sndbrand (sndcard)}}"><div class="small-10 columns"><span class="ajm-connect-name"> {{sndcard.name}} </span></div><div class="small-1 columns"><span class="ajm-connect-uid">  {{sndcard.devid}}  </span></div></div></div></div></div>';return{template:g,scope:{},restrict:"E",link:f}}]);var newModule=angular.module("ajm-monitor-gateway",[]);newModule.directive("monitorStatus",["$log","$timeout","$http","$location","Notification",function(a,b,c,d,e){function f(a){this.pingrate=1e3*a,this.elems=[],this.status;var d=this;this.register=function(a){this.elems.push(a),this.status?(a.addClass("ajm-online"),a.removeClass("ajm-offline")):(a.addClass("ajm-offline"),a.removeClass("ajm-online"))},this.online=function(){for(var a=0;a<this.elems.length;a++)this.elems[a].addClass("ajm-online"),this.elems[a].removeClass("ajm-offline")},this.offline=function(){for(var a=0;a<this.elems.length;a++)this.elems[a].addClass("ajm-offline"),this.elems[a].removeClass("ajm-online")},this.getping=function(){var a={request:"ping-get"},f=c.get("/jsonapi",{params:a});f.success(function(a,b,c,f){d.status||(e.success({message:"Alsa Server Back to Live",delay:3e3}),d.online()),d.status=1}),f.error(function(a,b,c){d.status&&(e.warning({message:"Alsa Server Lost",delay:5e3}),d.offline()),d.status=0}),b(d.getping,d.pingrate)},this.getping()}function g(a,b,c){a.init=function(){a.icon=c.icon||"fa-cog",a.hostname=d.host(),a.httpdport=d.port(),i.register(b)},a.init()}var h='<div class="ajm-monitor"><span class="ajm-monitor-gateway" ng-click="clicked($event)" >alsa://{{hostname}}:{{httpdport}}</span><i class="ajm-monitor-status fa fa-cog"></i></div>',i=new f(30);return{template:h,scope:{callback:"="},restrict:"E",link:g}}]);var newModule=angular.module("ajm-playback-switch",[]);newModule.directive("playbackSwitch",["$log","CtrlByNumid",function(a,b){function c(a,c,d,f){a.initWidget=function(c){var d,f=[];if(void 0!==c){for(d=0;d<c.value.length;d++)f.push(e++);a.indexes=f,a["switch"]=c,b.register(c.numid,a),1===d?a.extraclass="playback-switch-master":a.extraclass=""}};c.find("span");a.setValue=function(b){for(var d=a["switch"].value,e=c.find("span"),f=0;f<d.length;f++)d[f]=b[f],d[f]?e.addClass("button-actif"):e.removeClass("button-actif"),e=e.next()},a.toggleState=function(b,c){var d=angular.element(b.target),e=a["switch"].value;e[c]?(e[c]=!1,d.removeClass("button-actif")):(e[c]=!0,d.addClass("button-actif")),a.callback(a["switch"].numid,a["switch"].value)},"true"===d.first&&(e=1),a.switchid=d.id|"switch-"+parseInt(1e3*Math.random()),a.$watch("initvalues",function(){a.initvalues&&a.initWidget(a.initvalues)})}var d='<div class="playback-switch" title="{{switch.name}}">   <span ng-repeat="count in indexes" ng-click="toggleState($event, $index)" class="playback-switch-button {{extraclass}}">{{count}}</span></div>',e=0;return{template:d,scope:{callback:"=",initvalues:"="},restrict:"E",link:c}}]);var newModule=angular.module("ajm-register-numid",[]);newModule.provider("CtrlByNumid",AjgNumidCtrlPool);