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

// this module is load statically before any route is cativated
var newModule = angular.module('ajm-monitor-gateway', []);

// http://stackoverflow.com/questions/18368485/angular-js-resizable-div-directive
newModule.directive ('monitorStatus', ["$log", '$timeout', '$http', '$location','Notification'
                   , function($log, $timeout, $http, $location, Notification) {


    var template =
          '<div class="ajm-monitor">'
        + '<span class="ajm-monitor-gateway" ng-click="clicked($event)" >alsa://{{hostname}}:{{httpdport}}</span>'
        + '<i class="ajm-monitor-status fa fa-cog"></i>'
        + '</div>'
        ;

    // Monitor object is shared by all MonitorStatus instances
    // This object add/remove online/offline classes to status element
    function monitor (pingrate) {
        this.pingrate = pingrate *1000; // move to seconds
        this.elems = [];
        this.status;

        var self = this; // I hate Java Script

        // register a new element and apply current status
        this.register = function (elem) {
            this.elems.push(elem);
            if (this.status) {
                elem.addClass    ("ajm-online");
                elem.removeClass ("ajm-offline");
            } else {
                elem.addClass    ("ajm-offline");
                elem.removeClass ("ajm-online");
            }
        };

        this.online = function () {
            for (var idx=0; idx < this.elems.length; idx ++) {
                this.elems[idx].addClass    ("ajm-online");
                this.elems[idx].removeClass ("ajm-offline");
            }
        };

        this.offline = function(){
            for (var idx=0; idx < this.elems.length; idx ++) {
                this.elems[idx].addClass    ("ajm-offline");
                this.elems[idx].removeClass ("ajm-online");
            }
        };

        // Check Gateway status
        this.getping = function() {

            // send AJAX request to Alsa-Json-Gateway
            var query= {request:"ping-get"};
            var handler = $http.get('/jsonapi', {params: query});
            handler.success(function(response, errcode, headers, config) {
                if (!self.status)  {
                    Notification.success ({message: "Alsa Server Back to Live", delay: 3000});
                    self.online();
                }
                self.status = 1;
            });

            handler.error(function(response, errcode, headers) {
                if (self.status)  {
                    Notification.warning ({message: "Alsa Server Lost", delay: 5000});
                    self.offline();
                }
                self.status = 0;
            });

            $timeout (self.getping,self.pingrate);
        };

        // initialise ping request
        this.getping();
    }

    // instantiate shared monitor object
    var monitoring = new monitor(30); // monitor gateway every 30s

    function link (scope, elem, attrs) {

       scope.init = function () {
           // Provide some default for missing attributes
           scope.icon      = attrs.icon   || "fa-cog";
           scope.hostname  = $location.host();
           scope.httpdport = $location.port();

           monitoring.register(elem);
       };

       scope.init();
    }

    return {
        template: template,
        scope: {
            callback : "="
        },
        restrict: 'E',
        link: link
    };
}]);

console.log ("Monitor Gateway Loaded");

