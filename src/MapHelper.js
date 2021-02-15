
class MapHelper {
    static InsertTileElement(tile, height) {
        let index = MapHelper.FindPlacementPosition(tile, height);
        let element = tile.insertElement(index);
        element._index = index;
        element.baseHeight = height;
        return element;
    }

    static FindPlacementPosition(tile, height) {
        let index = 0;
        for (index = 0; index < tile.numElements; index++) {
            let element = tile.getElement(index);
            if (element.baseHeight >= height) {
                break;
            }
        }
        return index;
    }

    static GetTileSurfaceZ(x, y) {
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

    static PlaceSmallScenery(tile, objectIndex, height, orientation = 0) {
        let element = MapHelper.InsertTileElement(tile, height);
        element.type = "small_scenery";
        element.object = objectIndex;
        element.clearanceHeight = height + 1;
        return element;
    }

    static PlaceWall(tile, objectIndex, height, orientation = 0) {
        let element = MapHelper.InsertTileElement(tile, height);
        element.type = "wall";
        element.object = objectIndex;
        element.clearanceHeight = height + 1;
        return element;
    }

    static GetElementIndex(tile, element) {
        for (var i = 0; i < tile.numElements; i++) {
            var elementB = tile.getElement(i);
            if (elementB && element == elementB) {
                return i;
            }
        }
        return null;
    }

    static SetPrimaryTileColor(tile, elementIndex, color) {
        tile.elements[elementIndex].primaryColour = color;
    }

    static SetTileElementRotation(tile, elementIndex, orientation) {
        tile.elements[elementIndex].direction = orientation;
    }

    static GetTileElementRotation(tile, elementIndex) {
        return tile.elements[elementIndex].direction;
    }
}

export default MapHelper;