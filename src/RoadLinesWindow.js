import ObjectHelper from "./ObjectHelper";
import MapHelper from "./MapHelper";



class RoadLinesWindow {
    constructor() {
        this.window = null;
    }

    removeIceCubes() {
        let baseBlockIndex = ObjectHelper.GetObjectIndex("small_scenery", "BRBASE2");
        let iceCubeIndex = ObjectHelper.GetObjectIndex("small_scenery", "ICECUBE");


        let wallSmall = ObjectHelper.GetObjectIndex("wall", "WALLCB8");
        let wallHalf = ObjectHelper.GetObjectIndex("wall", "WALLCB16");
        let wallFull = ObjectHelper.GetObjectIndex("wall", "WALLCB32");

        /*
        let selectionVolume = new SelectionVolume();

        for (let y = 0; y < map.size.y; y++) {
            for (let x = 0; x < map.size.x; x++) {
                let tile = map.getTile(x, y);

                // Iterate every element on the tile
                for (let i = 0; i < tile.numElements; i++) {
                    let element = tile.getElement(i);


                    // If the element is a footpath, set the broken flag to true
                    if (element.type === 'small_scenery') {
                        if (element.object === iceCubeIndex) {
                            let baseHeight = element.baseHeight;
                            let clearanceHeight = element.clearanceHeight;
                            let height = clearanceHeight - baseHeight;

                            selectionVolume.addTileVolume(x, y, baseHeight, height);
                            /*
                            tile.removeElement(i);

                            let top = clearanceHeight - baseHeight;
                            for (let h = 0; h < top; h++) {
                                if (top - h >= 4) {
                                    MapHelper.PlaceWall(tile, wallFull, baseHeight + h);
                                    h += 3;
                                }
                                else if (top - h >= 2) {
                                    MapHelper.PlaceWall(tile, wallHalf, baseHeight + h);
                                    h += 1;
                                }
                                else {
                                    MapHelper.PlaceWall(tile, wallSmall, baseHeight + h);
                                }
                            }
                            continue;
                        }
                    }
                }
            }
        }*/
    }

    generate() {
        //this.removeIceCubes();
    }

    open() {
        if (this.window != null) {
            this.window.bringToFront();
            return;
        }

        let width = 200;
        let height = 100;

        let padding = 3;
        let doublePadding = padding * 2;
        let vpadding = 4;

        let that = this;
        this.window = ui.openWindow({
            classification: 'park',
            title: "Road Lines",
            width: width,
            height: height,
            widgets: [
                {
                    type: 'label',
                    name: 'label-description',
                    x: padding,
                    y: 23,
                    width: width - doublePadding,
                    height: 26,
                    text: "Transform ice-cubes into buildings."
                },
                {
                    type: 'button',
                    name: "button-generate",
                    x: padding,
                    y: height - vpadding - 16,
                    width: width - doublePadding,
                    height: 16,
                    text: "Generate",
                    onClick: () => { that.generate() }
                }
            ],
            onClose: () => {
                that.window = null;
            }
        });
    };
}
RoadLinesWindow.Instance = null;

export default RoadLinesWindow;