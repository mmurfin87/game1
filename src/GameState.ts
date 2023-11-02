import { City } from "./City.js";
import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";
import { Positioned } from "./Positioned.js";
import { Soldier } from "./Soldier.js";
import { Tile, Terrain } from "./Tile.js";

export class GameState
{
	public gameover: boolean = false;

	constructor(
		public currentTime: number,
		public currentTurn: number,
		public readonly map: Tile[],
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

	checkWinner(): Player | null
	{
		const winner = this.cities.find(city => city.player != this.barbarianPlayer)?.player ?? null;
		if (this.cities.some(city => city.player != winner && city.player != this.barbarianPlayer))
			return null;
		return winner;
	}


	cleanupDefeatedPlayers()
	{
		const playersAlive = this.cities.reduce<Player[]>((r, c) => {
				if (!r.includes(c.player))
					r.push(c.player);
				return r;
			}, 
			[]);
		for (let i = 0; i < this.soldiers.length; i++)
			if (!playersAlive.includes(this.soldiers[i].player))
				this.soldiers.splice(i, 1);
	}

	// Function to generate random cities
	generateRandomCities()
	{
		while (this.cities.length < this.players.length)
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
						if (this.cities.some(city => Math.abs(city.row - row) < 3 && Math.abs(city.col - col) < 3))
							continue;
						this.map[row * this.numRows + col].terrain = Terrain.GRASSLAND;	// make sure city is on a traversible ground
						this.cities.push(new City(row, col, this.barbarianPlayer, 1));
					}
				}
			}
		}

		for (const player of this.players)
		{
			if (player == this.barbarianPlayer)
				continue;
			let index = Math.floor(Math.random() * this.cities.length), i = (index + 1) % this.cities.length;
			for (; i != index; i = (i + 1) % this.cities.length)
			{
				if (this.cities[i].player == this.barbarianPlayer)
					break;
				if (i == index)
					throw new Error("Not enough cities");
			}
			this.cities[i].player = player;

		}
		//this.cities[0].player = this.humanPlayer;
		//this.cities[this.cities.length-5].player = this.players[2];
		//this.cities[this.cities.length-1].player = this.players[this.players.length-1];
	}

	select(gridCoords: Point2d, player:Player): Positioned | null
	{
		for (const pos of this.search(gridCoords.y, gridCoords.x))
			if (pos.player.id == player.id)
				return pos;
		return null;
	}

	target<T extends Positioned>(gridCoords: Point2d, player: Player, restrictType?: T['type']): T | null
	{
		for (const pos of this.search(gridCoords.y, gridCoords.x))
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

	tileAtPoint(coords: Point2d): Tile
	{
		return this.tileAtCoords(coords.x, coords.y);
	}

	tileAtCoords(x: number, y: number): Tile
	{
		return this.map[y * this.numRows + x];
	}
}