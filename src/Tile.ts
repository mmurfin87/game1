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
		public terrain: Terrain
	)
	{}
}