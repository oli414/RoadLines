/// <reference path="../../../bin/openrct2.d.ts" />

import MapHelper from "./MapHelper";
import ObjectHelper from "./ObjectHelper";

let downCoord;
let currentCoord;

let direction = 0;

let lineStyle = 0;
let lineColor = 2;
let lineStyles = [
    "rct2.scenery_wall.walllt32",
    "rct2.scenery_wall.walllt32",
    "rct2.scenery_wall.wallrh32",
    "rct2.scenery_wall.wc17",
    "rct2.scenery_wall.wc17"
];

// Object IDs were changed in NSF
if (context.apiVersion < 39) {
    lineStyles = [
        "rct2.walllt32",
        "rct2.walllt32",
        "rct2.wallrh32",
        "rct2.wc17",
        "rct2.wc17"
    ];
}

const lineStyleHeights = [
    4,
    4,
    4,
    2,
    2
];
const striped = [
    false,
    true,
    false,
    false,
    true
];

function selectTheMap() {
    let left = Math.min(downCoord.x, currentCoord.x);
    let right = Math.max(downCoord.x, currentCoord.x);
    let top = Math.min(downCoord.y, currentCoord.y);
    let bottom = Math.max(downCoord.y, currentCoord.y);
    ui.tileSelection.range = {
        leftTop: { x: left, y: top },
        rightBottom: { x: right, y: bottom }
    };
}

function finishSelection() {
    let left = Math.floor(Math.min(downCoord.x, currentCoord.x) / 32);
    let right = Math.floor(Math.max(downCoord.x, currentCoord.x) / 32);
    let top = Math.floor(Math.min(downCoord.y, currentCoord.y) / 32);
    let bottom = Math.floor(Math.max(downCoord.y, currentCoord.y) / 32);

    const roadLineWall = ObjectHelper.GetObjectIndex("wall", lineStyles[lineStyle]);

    let viewRotation = ui.mainViewport.rotation;
    viewRotation += direction;
    while (viewRotation > 1) {
        viewRotation -= 2;
    }

    for (let x = left; x <= right; x++) {
        if (striped[lineStyle] && viewRotation === 1 && x % 2 === 0) {
            continue;
        }
        for (let y = top; y <= bottom; y++) {
            if (striped[lineStyle] && viewRotation === 0 && y % 2 === 0) {
                continue;
            }

            let tile = map.getTile(x, y);
            let surfaceHeight = MapHelper.GetTileSurfaceZ(x, y);


            if ((viewRotation === 0 && x !== left) || (viewRotation === 1 && y !== bottom)) {
                let elementN = MapHelper.PlaceWall(tile, roadLineWall, surfaceHeight - lineStyleHeights[lineStyle]);
                MapHelper.SetTileElementRotation(tile, elementN._index, 0 + viewRotation);
                MapHelper.SetPrimaryTileColor(tile, elementN._index, lineColor);
            }

            if ((viewRotation === 0 && x !== right) || (viewRotation === 1 && y !== top)) {
                let elementS = MapHelper.PlaceWall(tile, roadLineWall, surfaceHeight - lineStyleHeights[lineStyle]);
                MapHelper.SetTileElementRotation(tile, elementS._index, 2 + viewRotation);
                MapHelper.SetPrimaryTileColor(tile, elementS._index, lineColor);
            }
        }
    }
}

let main = function () {
    if (typeof ui === 'undefined') {
        return;
    }
    let window = null;
    ui.registerMenuItem("Road Lines", function () {
        if (ui.tool && ui.tool.id == "road-lines-tool") {
            ui.tool.cancel();
        } else {
            ui.activateTool({
                id: "road-lines-tool",
                cursor: "cross_hair",
                onStart: function (e) {
                    ui.mainViewport.visibilityFlags |= (1 << 7);
                },
                onDown: function (e) {
                    if (e.mapCoords.x === 0 && e.mapCoords.y === 0) {
                        return;
                    }
                    downCoord = e.mapCoords;
                    currentCoord = e.mapCoords;
                },
                onMove: function (e) {
                    if (e.mapCoords.x === 0 && e.mapCoords.y === 0) {
                        return;
                    }
                    if (e.isDown) {
                        currentCoord = e.mapCoords;
                        selectTheMap();
                    } else {
                        downCoord = e.mapCoords;
                        currentCoord = e.mapCoords;
                        selectTheMap();
                    }
                },
                onUp: function (e) {
                    finishSelection();
                    ui.tileSelection.range = null;
                },
                onFinish: function () {
                    ui.tileSelection.range = null;
                    ui.mainViewport.visibilityFlags &= ~(1 << 7);
                    if (window != null)
                        window.close();
                },
            });

            if (window == null) {
                const width = 300;
                const buttonWidth = 50;
                const switchWidth = 46;
                const buttonsHeight = 40 + 18 * 2;
                
                let buttonB;
                let buttonA;
                buttonA = {
                    type: 'button',
                    image: 5636,
                    isPressed: direction == 0,
                    name: "button-left",
                    x: 3 + 60,
                    y: buttonsHeight,
                    width: switchWidth,
                    height: 26,
                    onClick: function () {
                        window.findWidget(buttonA.name).isPressed = true;
                        window.findWidget(buttonB.name).isPressed = false;
                        direction = 0;
                    }
                };
                buttonB = {
                    type: 'button',
                    image: 5637,
                    isPressed: direction == 1,
                    name: "button-right",
                    x: 3 + switchWidth + 8 + 60,
                    y: buttonsHeight,
                    width: switchWidth,
                    height: 26,
                    onClick: function () {
                        window.findWidget(buttonB.name).isPressed = true;
                        window.findWidget(buttonA.name).isPressed = false;
                        direction = 1;
                    }
                }
                
                window = ui.openWindow({
                    classification: 'park',
                    title: "Road Lines",
                    width: width,
                    height: buttonsHeight + 32,
                    widgets: [
                        {
                            type: 'label',
                            name: 'label-description',
                            x: 3,
                            y: 23,
                            width: width - 6,
                            height: 26,
                            text: "Drag to construct roadlines."
                        },
                        {
                            type: 'button',
                            name: "button-cancel",
                            x: width - buttonWidth - 6,
                            y: buttonsHeight + 12,
                            width: buttonWidth,
                            height: 16,
                            text: "Cancel",
                            onClick: function () {
                                if (window != null)
                                    window.close();
                            }
                        },
                        {
                            type: 'label',
                            name: 'label-direction',
                            x: 3,
                            y: buttonsHeight + 2,
                            width: width - 6,
                            height: 26,
                            text: "Direction:"
                        },
                        buttonA,
                        buttonB,
                        {
                            type: 'label',
                            name: 'label-style',
                            x: 3,
                            y: 40,
                            width: 60 - 6,
                            height: 26,
                            text: "Style:"
                        },
                        {
                            type: "dropdown",
                            x: 3 + 60,
                            y: 40,
                            width: width - 6 - (3 + 60),
                            height: 12,
                            name: "line_dropdown",
                            text: "",
                            items: ["Line (Steel Latticework)", "Striped Line (Steel Latticework)", "Dots (Balustrade)", "Weathered Line (Wooden Snow Fence)", "Striped Weathered Line (Wooden Snow Fe"],
                            selectedIndex: lineStyle,
                            onChange: function (e) {
                                lineStyle = e;
                            }
                        },
                        {
                            type: 'label',
                            name: 'label-color',
                            x: 3,
                            y: 40 + 18,
                            width: 60 - 6,
                            height: 26,
                            text: "Color:"
                        },
                        {
                            type: "colourpicker",
                            x: 3 + 60,
                            y: 40 + 18,
                            width: width - 6 - (3 + 60),
                            height: 12,
                            name: "line_color",
                            colour: lineColor,
                            onChange: function (e) {
                                lineColor = e;
                            }
                        }
                    ],
                    onClose: function () {
                        window = null;
                        if (ui.tool && ui.tool.id == "road-lines-tool") {
                            ui.tool.cancel();
                        }
                    }
                });
            }
            else {
                window.bringToFront();
            }
        }
    });
};

registerPlugin({
    name: 'Road Lines',
    version: '1.2.1',
    licence: 'MIT',
    authors: ['Oli414'],
    type: 'local',
    minApiVersion: 34,
    targetApiVersion: 39,
    main: main
}); 