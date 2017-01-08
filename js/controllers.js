'use strict';

/* Controllers */

var orionMapping = angular.module("orionMapping", ['leaflet-directive', 'ngCookies']);
orionMapping.controller("MappingController", ["$scope", "leafletData",
                        '$http', '$cookies', '$cookieStore',
    function ($scope, leafletData,  $http, $cookies, $cookieStore) {



         /**
         * Set default setting of map - icon-cog on the panel of widget
         */
        $scope.master= {};
        $scope.update = function(center) {
            $scope.master= angular.copy(center);
            $cookies.userLat = center.lat;
            $cookies.userLng = center.lng;
            $cookies.userZoom = center.zoom;

        };

        /**
         * Get default setting of map - icon-target on the panel of widget
         */
         $scope.showLeaflet = function() {
            leafletData.getMap().then(function(map) {
                map.panTo ([$cookies.userLat, $cookies.userLng]);
                map.setZoom($cookies.userZoom);

            });
        };

        /**
         * Set default setting of map - icon-target on the panel of widget
         */
        leafletData.getMap().then(function(map) {
            map.panTo ([$cookies.userLat, $cookies.userLng]);
            map.setZoom($cookies.userZoom);

        });

        /**
         * Functional of zoomBox icon on left side of the map
         */
        leafletData.getMap().then(function(map) {
            var control = L.control.zoomBox({modal: true});
            map.addControl(control);

            L.Control.ZoomBox = L.Control.extend({
                _active: false,
                _map: null,
                includes: L.Mixin.Events,
                options: {
                    position: 'topleft',
                    className: 'fa fa-search-plus',
                    modal: false
                },
                onAdd: function (map) {
                    this._map = map;
                    this._container = L.DomUtil.create('div', 'leaflet-zoom-box-control leaflet-bar');
                    this._container.title = "Zoom to specific area";
                    var link = L.DomUtil.create('a', this.options.className, this._container);
                    link.href = "#";

                    // Bind to the map's boxZoom handler
                    var _origMouseDown = map.boxZoom._onMouseDown;
                    map.boxZoom._onMouseDown = function(e){
                        _origMouseDown.call(map.boxZoom, {
                            clientX: e.clientX,
                            clientY: e.clientY,
                            which: 1,
                            shiftKey: true
                        });
                    };

                    map.on('zoomend', function(){
                        if (map.getZoom() == map.getMaxZoom()){
                            L.DomUtil.addClass(link, 'leaflet-disabled');
                        }
                        else {
                            L.DomUtil.removeClass(link, 'leaflet-disabled');
                        }
                    }, this);
                    if (!this.options.modal) {
                        map.on('boxzoomend', this.deactivate, this);
                    }

                    L.DomEvent
                        .on(this._container, 'dblclick', L.DomEvent.stop)
                        .on(this._container, 'click', L.DomEvent.stop)
                        .on(this._container, 'click', function(){
                            this._active = !this._active;
                            if (this._active && map.getZoom() != map.getMaxZoom()){
                                this.activate();
                            }
                            else {
                                this.deactivate();
                            }
                        }, this);
                    return this._container;
                },
                activate: function() {
                    L.DomUtil.addClass(this._container, 'active');
                    this._map.dragging.disable();
                    this._map.boxZoom.addHooks();
                    L.DomUtil.addClass(this._map.getContainer(), 'leaflet-zoom-box-crosshair');
                },
                deactivate: function() {
                    L.DomUtil.removeClass(this._container, 'active');
                    this._map.dragging.enable();
                    this._map.boxZoom.removeHooks();
                    L.DomUtil.removeClass(this._map.getContainer(), 'leaflet-zoom-box-crosshair');
                    this._active = false;
                    this._map.boxZoom._moved = false; //to get past issue w/ Leaflet locking clicks when moved is true (https://github.com/Leaflet/Leaflet/issues/3026).
                }
            });

            L.control.zoomBox = function (options) {
                return new L.Control.ZoomBox(options);
            };
        });

        /**
         * Functional of icon-magnifier-add on the panel of widget
         */
        $scope.zoomIn = function() {
            leafletData.getMap().then(function(map) {
                map.setZoom(map.getZoom() < map.getMaxZoom() ? map.getZoom() + 1 : map.getMaxZoom());

            });
        };

        /**
         * Functional of icon-magnifier-remove on the panel of widget
         */
        $scope.zoomOut = function() {
            leafletData.getMap().then(function(map) {
                map.setZoom(map.getZoom() > map.getMinZoom() ? map.getZoom() - 1 : map.getMinZoom());
            });
        };

        /**
         * Functional of icon-frame on the panel of widget
         */
        $scope.fitbounds = function() {
            leafletData.getMap().then(function(map) {

                map.fitBounds(markers.getBounds(), {padding: [10, 10]});
            });
        };


var popupcontent = '<h3>Rome</h3> Rome is a city and special comune (named "Roma Capitale") in Italy. Rome is the capital of Italy and region of Lazio. With 2.9 million residents in 1,285 km2 (496.1 sq mi), it is also the countrys largest and most populated comune and fourth-most populous city in the European Union by population within city limits. The Metropolitan City of Rome has a population of 4.3 million residents.The city is located in the central-western portion of the Italian Peninsula, within Lazio (Latium), along the shores of Tiber river.';


        /**
         * Configuration and contents of the Open Street Map
         */
        angular.extend($scope, {


            center:{
                lat: 41.91613803741995,
                lng: 12.463388442993164,
                zoom: 12

            },

            layers: {
                baselayers: {
                    openStreetMap: {
                        name: 'OpenStreetMap',
                        type: 'xyz',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    }
                },
                overlays: {
                    rome: {
                        type: 'group',
                        name: 'Rome',
                        visible: true
                    }

                }
            },


            //TODO downloading data from geoJson-file
            markers: {

                marker1: {
                    group: 'art',
                    layer: 'rome',
                    lat: 41.91613803741995,
                    lng: 12.463388442993164,
                    message: popupcontent,
                    icon: {
                        type: "makiMarker",
                        icon: "art-gallery",
                        color: "#f86767",
                        size: "l"
                    }

                },
                marker2: {
                    group: 'art',
                    layer: 'rome',
                    lat: 41.91830953372325,
                    lng: 12.442874908447266,
                    message: popupcontent,
                    icon: {
                        type: "makiMarker",
                        icon: "art-gallery",
                        color: "#f86767",
                        size: "l"
                    }

                },
                marker3: {
                    group: 'art',
                    layer: 'rome',
                    lat: 41.90700417055315, 
                    lng: 12.46175765991211,
                    message: popupcontent,
                    icon: {
                        type: "makiMarker",
                        icon: "art-gallery",
                        color: "#f86767",
                        size: "l"
                    }

                },
                marker4: {
                    group: 'cafe',
                    layer: 'rome',
                    lat: 41.920672548686824,
                    lng: 12.491798400878906,
                    message: popupcontent,
                    icon: {
                        type: "makiMarker",
                        icon: "cafe",
                        color: "#1087bf",
                        size: "l"
                    }

                },
                marker5: {
                    group: 'cafe',
                    layer: 'rome',
                    lat: 41.91070897340646,
                    lng: 12.498579025268555,
                    message: popupcontent,
                    icon: {
                        type: "makiMarker",
                        icon: "cafe",
                        color: "#1087bf",
                        size: "l"
                    }

                },
                marker6: {
                    group: 'cafe',
                    layer: 'rome',
                    lat: 41.902085393192955,
                    lng: 12.490682601928711,
                    message: popupcontent,
                    icon: {
                        type: "makiMarker",
                        icon: "cafe",
                        color: "#1087bf",
                        size: "l"
                    }

                }
                
            }
        });




    }]);

