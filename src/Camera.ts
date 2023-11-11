import { Point2d } from "./Point2d.js";

export class Camera
{
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public scale: number,
		public tileSize: number
	)
	{}

	centerOnGrid(coords: Point2d): void
	{
		const screenCoords = this.gridToScreenCoords(coords);
		this.x = screenCoords.x - this.width / 2;
		this.y = screenCoords.y - this.height / 2;
	}

	screenToGridCoords(x: number, y: number): Point2d
	{
		//x = x * this.scale + this.x;
		//y = y * this.scale + this.y;
		//x = x / this.scale;
		//y = y / this.scale;
		const ts = this.tileSize, xo = (this.width/2 - this.x) * this.scale, yo = (0 - this.y) * this.scale;
		const r = Math.floor(((y - yo) * 2 / this.scale / ts - (x - xo) / this.scale / ts) / 2);
    	const c = Math.floor(((x - xo) / this.scale / ts + (y - yo) * 2 / this.scale / ts) / 2);
		//console.log(`Converted (${x},${y}) | ${this.x},${this.y} => (${r},${c}) | (${x} - ${xo}) / ${this.scale} / ${ts}, (${y} - ${yo}) * 2 / ${ts} | (${x - xo}) / ${this.scale} / ${ts}, (${y - yo}) * 2 / ${ts} => ${(y - yo) * 2} / ${ts}`);
		return new Point2d(c, r);
	}

	gridToScreenCoords(coords: Point2d): Point2d
	{
		const ts = this.tileSize, xo = this.width/2, yo = 0;
		const x = xo + (coords.x - coords.y) * ts, y = yo + (coords.x + coords.y) * ts / 2;
		return new Point2d(Math.floor(x), Math.floor(y));
	}
}