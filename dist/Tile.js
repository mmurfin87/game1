export var Terrain;
(function (Terrain) {
    Terrain["GRASSLAND"] = "Grassland";
    Terrain["FOREST"] = "Forest";
    Terrain["MOUNTAINS"] = "Mountains";
    Terrain["WATER"] = "Water";
})(Terrain || (Terrain = {}));
export class Tile {
    terrain;
    constructor(terrain) {
        this.terrain = terrain;
    }
}
