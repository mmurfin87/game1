enum Terrain
{
	GRASSLAND = "Grassland",
	FOREST = "Forest",
	MOUNTAINS = "Mountains",
	WATER = "Water"
}

class Tile
{
	constructor(
		public terrain: Terrain
	)
	{}
}