import { Player } from "./Player.js";

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
}