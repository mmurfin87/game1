import { City } from "./City.js";
import { Player } from "./Player.js";
import { Positioned } from "./Positioned.js";
import { Soldier } from "./Soldier.js";
import { Tile, Terrain } from "./Tile.js";

export class GameState
{
	constructor(
		public currentTime: number,
		public currentTurn: number,
		public readonly map: Tile[],
		public readonly tileSize: number,
		public readonly numRows: number,
		public readonly numCols: number,
		public readonly cities: City[],
		public readonly soldiers: Soldier[],
		public readonly barbarianPlayer: Player,
		public readonly humanPlayer: Player,
		public readonly players: Player[],
		public selection: Positioned | null
	)
	{}

	checkVictory(): boolean
	{
		return this.cities.find(city => city.player != this.humanPlayer) === undefined;
	}

	// Function to generate random cities
	generateRandomCities()
	{
		for (let row = 0; row < this.numRows; row++)
		{
			for (let col = 0; col < this.numCols; col++)
			{
				const rand = Math.random();
				let terrain: Terrain = Terrain.GRASSLAND;
				if (rand < 0.55)
					terrain = Terrain.GRASSLAND;
				else if (rand < 0.8)
					terrain = Terrain.FOREST;
				else if (rand < 0.9)
					terrain = Terrain.MOUNTAINS;
				else
					terrain = Terrain.WATER;
					this.map[row * this.numRows + col] = new Tile(terrain);

				if (Math.random() < 0.1) {
					this.map[row * this.numRows + col].terrain = Terrain.GRASSLAND;	// make sure city is on a traversible ground
					this.cities.push(new City(row, col, this.barbarianPlayer, 1));
				}
			}
		}

		this.cities[0].player = this.humanPlayer;
		this.cities[this.cities.length-1].player = this.players[this.players.length-1];
	}

	select(x: number, y: number, player:Player): Positioned | null
	{
		const r = Math.floor(y / this.tileSize), c = Math.floor(x / this.tileSize);
		for (const pos of this.search(r, c))
			if (pos.player.id == player.id)
				return pos;
		return null;
	}

	target<T extends Positioned>(x: number, y: number, player: Player, restrictType?: T['type']): T | null
	{
		const r = Math.floor(y / this.tileSize), c = Math.floor(x / this.tileSize);
		for (const pos of this.search(r, c))
		{
			if (restrictType && pos.type !== restrictType)
				break;
			if (pos.type == "Soldier" && pos.player.id == player.id)	// can't stack soldiers
				break;
			console.log(`Selected ${pos.type} (${pos.row},${pos.col}`);
			return pos as T;
		}
		return null;
	}

	search(row: number, col: number): Positioned[]
	{
		const result = [];
		// Order soldiers first so they are selected over cities
		for (const posArray of [this.soldiers, this.cities])
			for (const pos of posArray)
				if (row == pos.row && col == pos.col)
					result.push(pos);
		return result;
	}
}