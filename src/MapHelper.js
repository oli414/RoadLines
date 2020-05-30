
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
        let data = tile.data;
        let typeFieldIndex = 6;
        data[16 * elementIndex + typeFieldIndex] = color;
        tile.data = data;
    }

    static SetTileElementRotation(tile, elementIndex, orientation) {
        let data = tile.data;
        let typeFieldIndex = 0;
        let directionMask = 3;
        data[16 * elementIndex + typeFieldIndex] &= ~directionMask;
        data[16 * elementIndex + typeFieldIndex] |= orientation & directionMask;
        tile.data = data;
    }

    static GetTileElementRotation(tile, elementIndex) {
        let data = tile.data;
        let typeFieldIndex = 0;
        let directionMask = 3;
        return (data[16 * elementIndex + typeFieldIndex] & directionMask);
    }
}

export default MapHelper;