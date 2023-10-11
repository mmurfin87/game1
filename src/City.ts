import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";

export class City
{
	public readonly type = "City"
	
    constructor(
		public row: number, 
		public col: number,
		public player: Player,
		public moves: number,
		public movesLeft: number = moves) 
	{
    }

	position(): Point2d
	{
		return new Point2d(this.col, this.row);
	}
}