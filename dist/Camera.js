import { Point2d } from "./Point2d.js";
export class Camera {
    x;
    y;
    width;
    height;
    scale;
    tileSize;
    constructor(x, y, width, height, scale, tileSize) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.tileSize = tileSize;
    }
    centerOnGrid(coords) {
        const screenCoords = this.gridToScreenCoords(coords);
        this.x = screenCoords.x - this.width / 2;
        this.y = screenCoords.y - this.height / 2;
    }
    screenToGridCoords(x, y) {
        //x = x * this.scale + this.x;
        //y = y * this.scale + this.y;
        //x = x / this.scale;
        //y = y / this.scale;
        const ts = this.tileSize, xo = (this.width / 2 - this.x) * this.scale, yo = (0 - this.y) * this.scale;
        const r = Math.floor(((y - yo) * 2 / this.scale / ts - (x - xo) / this.scale / ts) / 2);
        const c = Math.floor(((x - xo) / this.scale / ts + (y - yo) * 2 / this.scale / ts) / 2);
        //console.log(`Converted (${x},${y}) | ${this.x},${this.y} => (${r},${c}) | (${x} - ${xo}) / ${this.scale} / ${ts}, (${y} - ${yo}) * 2 / ${ts} | (${x - xo}) / ${this.scale} / ${ts}, (${y - yo}) * 2 / ${ts} => ${(y - yo) * 2} / ${ts}`);
        return new Point2d(c, r);
    }
    gridToScreenCoords(coords) {
        const ts = this.tileSize, xo = this.width / 2, yo = 0;
        const x = xo + (coords.x - coords.y) * ts, y = yo + (coords.x + coords.y) * ts / 2;
        return new Point2d(Math.floor(x), Math.floor(y));
    }
}
