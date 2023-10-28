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

	screenToGridCoords(x: number, y: number): Point2d
	{
		x = x / this.scale;
		y = y / this.scale;
		const ts = this.tileSize, xo = this.width / 2, yo = 0;
		const r = Math.floor(((y - yo) * 2 / ts - (x - xo) / ts) / 2);
    	const c = Math.floor(((x - xo) / ts + (y - yo) * 2 / ts) / 2);
		console.log(`Converted (${x},${y}) => (${r},${c}) | (${x} - ${xo}) / ${ts}, (${y} - ${yo}) * 2 / ${ts} | (${x - xo}) / ${ts}, (${y - yo}) * 2 / ${ts} => ${(y - yo) * 2} / ${ts}`);
		return new Point2d(c, r);
	}

	gridToScreenCoords(coords: Point2d): Point2d
	{
		const ts = this.tileSize, xo = this.width / 2, yo = 0;
		const x = xo + (coords.x - coords.y) * ts, y = yo + (coords.x + coords.y) * ts / 2;
		return new Point2d(Math.floor(x), Math.floor(y));
	}
}