import { Point2d } from "../Point2d";

export class Movement
{
	constructor(
		public path: Point2d[] | null,
		public stepStart: number | null,
		public stepDuration: number,
		public wait: boolean,
		public moves: number,
		public movesLeft: number
	)
	{}
}