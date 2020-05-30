"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapHelper = function () {
    function MapHelper() {
        _classCallCheck(this, MapHelper);
    }

    _createClass(MapHelper, null, [{
        key: "InsertTileElement",
        value: function InsertTileElement(tile, height) {
            var index = MapHelper.FindPlacementPosition(tile, height);
            var element = tile.insertElement(index);
            element._index = index;
            element.baseHeight = height;
            return element;
        }
    }, {
        key: "FindPlacementPosition",
        value: function FindPlacementPosition(tile, height) {
            var index = 0;
            for (index = 0; index < tile.numElements; index++) {
                var element = tile.getElement(index);
                if (element.baseHeight >= height) {
                    break;
                }
            }
            return index;
        }
    }, {
        key: "GetTileSurfaceZ",
        value: function GetTileSurfaceZ(x, y) {
            var tile = map.getTile(x, y);
            if (tile) {
                for (var i = 0; i < tile.numElements; i++) {
                    var element = tile.getElement(i);
                    if (element && element.type == "surface") {
                        return element.baseHeight;
                    }
                }
            }
            return null;
        }
    }, {
        key: "PlaceSmallScenery",
        value: function PlaceSmallScenery(tile, objectIndex, height) {
            var orientation = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            var element = MapHelper.InsertTileElement(tile, height);
            element.type = "small_scenery";
            element.object = objectIndex;
            element.clearanceHeight = height + 1;
            return element;
        }
    }, {
        key: "PlaceWall",
        value: function PlaceWall(tile, objectIndex, height) {
            var orientation = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            var element = MapHelper.InsertTileElement(tile, height);
            element.type = "wall";
            element.object = objectIndex;
            element.clearanceHeight = height + 1;
            return element;
        }
    }, {
        key: "GetElementIndex",
        value: function GetElementIndex(tile, element) {
            for (var i = 0; i < tile.numElements; i++) {
                var elementB = tile.getElement(i);
                if (elementB && element == elementB) {
                    return i;
                }
            }
            return null;
        }
    }, {
        key: "SetPrimaryTileColor",
        value: function SetPrimaryTileColor(tile, elementIndex, color) {
            var data = tile.data;
            var typeFieldIndex = 6;
            data[16 * elementIndex + typeFieldIndex] = color;
            tile.data = data;
        }
    }, {
        key: "SetTileElementRotation",
        value: function SetTileElementRotation(tile, elementIndex, orientation) {
            var data = tile.data;
            var typeFieldIndex = 0;
            var directionMask = 3;
            data[16 * elementIndex + typeFieldIndex] &= ~directionMask;
            data[16 * elementIndex + typeFieldIndex] |= orientation & directionMask;
            tile.data = data;
        }
    }, {
        key: "GetTileElementRotation",
        value: function GetTileElementRotation(tile, elementIndex) {
            var data = tile.data;
            var typeFieldIndex = 0;
            var directionMask = 3;
            return data[16 * elementIndex + typeFieldIndex] & directionMask;
        }
    }]);

    return MapHelper;
}();

var ObjectHelper = function () {
    function ObjectHelper() {
        _classCallCheck(this, ObjectHelper);
    }

    _createClass(ObjectHelper, null, [{
        key: "GetObjectIndex",
        value: function GetObjectIndex(type, identifier) {
            var list = context.getAllObjects(type);
            for (var i = 0; i < list.length; i++) {
                var obj = list[i];
                if (obj.identifier.trim() === identifier) {
                    return obj.index;
                }
            }
        }
    }]);

    return ObjectHelper;
}();

/// <reference path="../../../bin/openrct2.d.ts" />

var downCoord = void 0;
var currentCoord = void 0;

var direction = 0;

var lineStyle = 0;
var lineColor = 0;
var lineStyles = ["rct2.walllt32", "rct2.walllt32", "rct2.wallrh32", "rct2.wc17", "rct2.wc17"];
var lineStyleHeights = [4, 4, 4, 2, 2];
var striped = [false, true, false, false, true];
var colors = [2, 18, 6, 1, 0];

function selectTheMap() {
    var left = Math.min(downCoord.x, currentCoord.x);
    var right = Math.max(downCoord.x, currentCoord.x);
    var top = Math.min(downCoord.y, currentCoord.y);
    var bottom = Math.max(downCoord.y, currentCoord.y);
    ui.tileSelection.range = {
        leftTop: { x: left, y: top },
        rightBottom: { x: right, y: bottom }
    };
}

function finishSelection() {
    var left = Math.floor(Math.min(downCoord.x, currentCoord.x) / 32);
    var right = Math.floor(Math.max(downCoord.x, currentCoord.x) / 32);
    var top = Math.floor(Math.min(downCoord.y, currentCoord.y) / 32);
    var bottom = Math.floor(Math.max(downCoord.y, currentCoord.y) / 32);

    var roadLineWall = ObjectHelper.GetObjectIndex("wall", lineStyles[lineStyle]);

    var viewRotation = ui.mainViewport.rotation;
    viewRotation += direction;
    while (viewRotation > 1) {
        viewRotation -= 2;
    }

    for (var x = left; x <= right; x++) {
        if (striped[lineStyle] && viewRotation === 1 && x % 2 === 0) {
            continue;
        }
        for (var y = top; y <= bottom; y++) {
            if (striped[lineStyle] && viewRotation === 0 && y % 2 === 0) {
                continue;
            }

            var tile = map.getTile(x, y);
            var surfaceHeight = MapHelper.GetTileSurfaceZ(x, y);

            if (viewRotation === 0 && x !== left || viewRotation === 1 && y !== bottom) {
                var elementN = MapHelper.PlaceWall(tile, roadLineWall, surfaceHeight - lineStyleHeights[lineStyle]);
                MapHelper.SetTileElementRotation(tile, elementN._index, 0 + viewRotation);
                MapHelper.SetPrimaryTileColor(tile, elementN._index, colors[lineColor]);
            }

            if (viewRotation === 0 && x !== right || viewRotation === 1 && y !== top) {
                var elementS = MapHelper.PlaceWall(tile, roadLineWall, surfaceHeight - lineStyleHeights[lineStyle]);
                MapHelper.SetTileElementRotation(tile, elementS._index, 2 + viewRotation);
                MapHelper.SetPrimaryTileColor(tile, elementS._index, colors[lineColor]);
            }
        }
    }
}

var main = function main() {
    if (typeof ui === 'undefined') {
        return;
    }
    var window = null;
    ui.registerMenuItem("Road Lines", function () {
        if (ui.tool && ui.tool.id == "road-lines-tool") {
            ui.tool.cancel();
        } else {
            ui.activateTool({
                id: "road-lines-tool",
                cursor: "cross_hair",
                onStart: function onStart(e) {
                    ui.mainViewport.visibilityFlags |= 1 << 7;
                },
                onDown: function onDown(e) {
                    if (e.mapCoords.x === 0 && e.mapCoords.y === 0) {
                        return;
                    }
                    downCoord = e.mapCoords;
                    currentCoord = e.mapCoords;
                },
                onMove: function onMove(e) {
                    if (e.mapCoords.x === 0 && e.mapCoords.y === 0) {
                        return;
                    }
                    if (e.isDown) {
                        console.log(e.mapCoords);
                        currentCoord = e.mapCoords;
                        selectTheMap();
                    } else {
                        downCoord = e.mapCoords;
                        currentCoord = e.mapCoords;
                        selectTheMap();
                    }
                },
                onUp: function onUp(e) {
                    finishSelection();
                    ui.tileSelection.range = null;
                },
                onFinish: function onFinish() {
                    ui.tileSelection.range = null;
                    ui.mainViewport.visibilityFlags &= ~(1 << 7);
                    if (window != null) window.close();
                }
            });

            if (window == null) {
                var width = 300;
                var buttonWidth = 50;
                var switchWidth = 32;
                var buttonsHeight = 40 + 18 * 2;
                window = ui.openWindow({
                    classification: 'park',
                    title: "Road Lines",
                    width: width,
                    height: buttonsHeight + 20,
                    widgets: [{
                        type: 'label',
                        name: 'label-description',
                        x: 3,
                        y: 23,
                        width: width - 6,
                        height: 26,
                        text: "Drag to construct roadlines."
                    }, {
                        type: 'button',
                        name: "button-cancel",
                        x: width - buttonWidth - 6,
                        y: buttonsHeight,
                        width: buttonWidth,
                        height: 16,
                        text: "Cancel",
                        onClick: function onClick() {
                            if (window != null) window.close();
                        }
                    }, {
                        type: 'label',
                        name: 'label-direction',
                        x: 3,
                        y: buttonsHeight + 2,
                        width: width - 6,
                        height: 26,
                        text: "Direction:"
                    }, {
                        type: 'button',
                        name: "button-left",
                        x: 3 + 60,
                        y: buttonsHeight,
                        width: switchWidth,
                        height: 16,
                        text: "\\",
                        onClick: function onClick() {
                            direction = 0;
                        }
                    }, {
                        type: 'button',
                        name: "button-right",
                        x: 3 + switchWidth + 8 + 60,
                        y: buttonsHeight,
                        width: switchWidth,
                        height: 16,
                        text: "/",
                        onClick: function onClick() {
                            direction = 1;
                        }
                    }, {
                        type: 'label',
                        name: 'label-style',
                        x: 3,
                        y: 40,
                        width: 60 - 6,
                        height: 26,
                        text: "Style:"
                    }, {
                        type: "dropdown",
                        x: 3 + 60,
                        y: 40,
                        width: width - 6 - (3 + 60),
                        height: 12,
                        name: "line_dropdown",
                        text: "",
                        items: ["Line (Steel Latticework)", "Striped Line (Steel Latticework)", "Dots (Balustrade)", "Weathered Line (Wooden Snow Fence)", "Striped Weathered Line (Wooden Snow Fe"],
                        selectedIndex: lineStyle,
                        onChange: function onChange(e) {
                            lineStyle = e;
                        }
                    }, {
                        type: 'label',
                        name: 'label-color',
                        x: 3,
                        y: 40 + 18,
                        width: 60 - 6,
                        height: 26,
                        text: "Color:"
                    }, {
                        type: "dropdown",
                        x: 3 + 60,
                        y: 40 + 18,
                        width: width - 6 - (3 + 60),
                        height: 12,
                        name: "line_color",
                        text: "",
                        items: ["White", "Yellow", "Blue", "Grey", "Black"],
                        selectedIndex: lineColor,
                        onChange: function onChange(e) {
                            lineColor = e;
                        }
                    }],
                    onClose: function onClose() {
                        window = null;
                        if (ui.tool && ui.tool.id == "road-lines-tool") {
                            ui.tool.cancel();
                        }
                    }
                });
            } else {
                window.bringToFront();
            }
        }
    });
};

registerPlugin({
    name: 'Road Lines',
    version: '1.0',
    authors: ['Oli414'],
    type: 'local',
    main: main
});
