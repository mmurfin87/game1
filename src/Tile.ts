import { Soldier } from "./Soldier.js";

export enum Terrain
{
	GRASSLAND = "Grassland",
	FOREST = "Forest",
	MOUNTAINS = "Mountains",
	WATER = "Water"
}

export class Tile
{
	constructor(
		public terrain: Terrain,
		public occupant: Soldier | null = null
	)
	{}
}