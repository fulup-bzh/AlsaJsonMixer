"use strict";function scarletteCapture(a){function b(b,c,d,e){b.matrixSourcesPool=[],b.matrixRoutesPool=[],b.updatePool=function(a,b,c){a[b].used=c;for(var d=0;d<a[b].options.length;d++)a[b].options[d].disabled=c},b.takeLinePool=function(a,c){0==c||a[c].used||b.updatePool(a,c,!0)},b.freeLinePool=function(a,c){0!=c&&b.updatePool(a,c,!1)},b.ProcessRouteSource=function(a){var b={name:a.name,actif:a.actif,numid:a.numid,value:a.value,line:a};return b},b.ProcessFader=function(a){var b={numid:a.numid,actif:a.actif,value:a.value[0],notLess:a.ctrl.min,notMore:a.ctrl.max,byStep:a.ctrl.step};return b},b.ProcessStereoMix=function(a,c){for(var d=[],e=0;e<a.volumes.length;e+=2){var f={leftMix:{title:a.volumes[e].name,leftFader:b.ProcessFader(a.volumes[e]),rightFader:b.ProcessFader(a.volumes[e])},rightMix:{title:a.volumes[e+1].name,leftFader:b.ProcessFader(c.volumes[e]),rightFader:b.ProcessFader(c.volumes[e])}};d.push(f)}return d},e.$formatters.unshift(function(c){if(c){for(var d=[],e=[],f=[],g=c.sources[1].ctrl.enums,h=0;h<g.length;h++)b.matrixSourcesPool.push({id:h,name:g[h],used:!1,options:[]});for(var h=0;h<c.sources.length;h+=2){var i=c.sources[h],j=c.sources[h+1],k="["+(h+1)+"/"+(h+2)+"]",l={uid:i.numid+"-"+j.numid,title:"Stereo Capture Line "+k,label:"Line "+k,name:"Capt "+k,matrixLinesPool:b.matrixSourcesPool,leftLine:b.ProcessRouteSource(i),rightLine:b.ProcessRouteSource(j)};d.push(l)}for(var m=c.routes[1].ctrl.enums,h=0;h<m.length;h++)b.matrixRoutesPool.push({id:h,name:m[h],used:!1,options:[]});for(var h=0;h<c.routes.length;h+=2){var i=c.routes[h],j=c.routes[h+1],k="["+(h+1)+"/"+(h+2)+"]",l={uid:i.numid+"-"+j.numid,title:"Stereo Output Route"+k,label:"Route "+k,name:"Out "+k,matrixLinesPool:b.matrixRoutesPool,leftLine:b.ProcessRouteSource(i),rightLine:b.ProcessRouteSource(j)};e.push(l)}for(var n=0;n<c.volumes.length;n+=2){var o=c.volumes[n],p=c.volumes[n+1],q={name:"Mix-"+o.name+" / "+p.name,stereomix:b.ProcessStereoMix(o,p)};f.push(q)}b.matrixSources=d,b.matrixRoutes=e,b.matrixMixVols=f,a.log("matrixMixVolsMix=",f)}}),b.matrixSourcesPoolCB={take:function(a){b.takeLinePool(b.matrixSourcesPool,a)},free:function(a){b.freeLinePool(b.matrixSourcesPool,a)}},b.matrixRoutesPoolCB={take:function(a){b.takeLinePool(b.matrixRoutesPool,a)},free:function(a){b.freeLinePool(b.matrixRoutesPool,a)}},b.matrixMixFaderCB=function(b,c){a.log("matrixMixVolscallback model=",b,"value=",c)}}return{templateUrl:"partials/scarlett-capture.html",require:"ngModel",scope:{callback:"="},restrict:"E",link:b}}function ScarlettController(a,b,c){var d=this;d.getControls=function(a){var b={request:"get-ctrls",sndcard:a},e=c.get("/alsajson",{params:b});e.success(function(a){d.sndcard=a.sndcard;for(var b=[],c=[],e=[],f=0;f<a.controls.length;f++){var g=a.controls[f],h=g.name.toLowerCase().split(" ");if("input"===h[0]&&"capture"===h[3]&&b.push(g),"matrix"===h[0]&&"playback"==h[3]&&e.push(g),"matrix"===h[0]&&"mix"===h[2]&&"volume"==h[5]){var i=h[3];c[i]||(c[i]={name:i.toUpperCase(),route:"",volumes:[]}),c[i].volumes.push(g)}}var j=[];c&&Object.keys(c).forEach(function(a){j.push(c[a])},c),d.alsamixer={sources:b,routes:e,volumes:j}}),e.error(function(){alert("Fail to get Card Controls from AlsaJsonGateway")})},d.callback=function(b,c){a.log("Scarlett callback action=",b," value=",c)},d.init=function(){d.getControls(b.search().card)},d.init()}ngapp.addDirective("scarlettCapture",["$log",scarletteCapture]),ngapp.addController("ScarlettMixerController",["$log","$location","$http",ScarlettController]);