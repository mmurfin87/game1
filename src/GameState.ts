import { City } from "./City.js";
import { Archetype, Entity, isArchetype } from "./Entity.js";
import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";
import { Tile, Terrain } from "./Tile.js";
import { Health } from "./components/Health.js";
import { Movement } from "./components/Movement.js";
import { Position } from "./components/Position.js";
import { Renderable } from "./components/Renderable.js";

export class GameState
{
	public gameover: boolean = false;

	constructor(
		public currentTime: number,
		public currentTurn: number,
		public readonly map: Tile[],
		public readonly numRows: number,
		public readonly numCols: number,
		public readonly entities: Entity[],
		public readonly barbarianPlayer: Player,
		public readonly humanPlayer: Player,
		public readonly players: Player[],
		public selection: Entity | null
	)
	{}

	checkWinner(): Player | null
	{
		const winner = this.entities.find(e => e.city && e.player != this.barbarianPlayer)?.player ?? null;
		if (this.entities.some(e => e.city && e.player != winner && e.player != this.barbarianPlayer))
			return null;
		return winner;
	}

	cleanupDefeatedPlayers()
	{
		const playersAlive = this.entities.reduce<Player[]>((r, c) => {
				if (c.city && c.player && !r.includes(c.player))
					r.push(c.player);
				return r;
			}, 
			[]);
		for (let i = 0; i < this.entities.length; i++)
		{
			const e = this.entities[i];
			if (e.player && !playersAlive.includes(e.player))
				this.entities.splice(i, 1);
		}
	}

	// Function to generate random cities
	generateRandomCities()
	{
		const cities: Archetype<['position', 'player', 'movement', 'city', 'renderable']>[] = [];//this.entities.filter((e: Entity): e is Archetype<['position', 'player', 'movement', 'city']> => isArchetype(e, 'position', 'player', 'movement', 'city'))
		while (cities.length < this.players.length)
		{
			for (let row = 0; row < this.numRows; row++)
			{
				for (let col = 0; col < this.numCols; col++)
				{
					const rand = Math.random();
					let terrain: Terrain = Terrain.GRASSLAND;
					if (rand < 0.55)
						terrain = Terrain.GRASSLAND;
					else if (rand < 0.85)
						terrain = Terrain.FOREST;
					else if (rand < 0.95)
						terrain = Terrain.MOUNTAINS;
					else
						terrain = Terrain.WATER;
						this.map[row * this.numRows + col] = new Tile(terrain);

					if (Math.random() < 0.1) {
						if (cities.some(city => Math.abs(city.position.position.x - col) < 3 && Math.abs(city.position.position.y - row) < 3))
							continue;
						this.map[row * this.numRows + col].terrain = Terrain.GRASSLAND;	// make sure city is on a traversible ground
						cities.push(new Entity(
							Entity.newId(),
							this.barbarianPlayer,
							new Position(new Point2d(col, row)),
							new Movement(null, null, 0, true, 1, 1),
							new Renderable('city', 'yellow', null),
							new Health(10, 10),
							undefined,
							new City()) as Archetype<['position', 'player', 'movement', 'city', 'renderable']>
						);
					}
				}
			}
		}

		for (const player of this.players)
		{
			if (player == this.barbarianPlayer)
				continue;
			let index = Math.floor(Math.random() * cities.length), i = (index + 1) % cities.length;
			for (; i != index; i = (i + 1) % cities.length)
			{
				if (cities[i].player == this.barbarianPlayer)
					break;
				if (i == index)
					throw new Error("Not enough cities");
			}
			cities[i].player = player;

		}
		cities.forEach(c => this.entities.push(c));
	}

	search<T extends (keyof Entity)[]>(coords: Point2d, ...keys: T): Archetype<['position', ...T]>[]
	{
		const result: Archetype<T>[] = [];
		for (const e of this.entities)
			if (isArchetype(e, ...keys) && e.position && Point2d.equivalent(coords, e.position.position))
				result.push(e);
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

	findNearestEnemyTarget(player: Player, origin: Point2d, exclude: Entity[]): EnemyArchetype | null
	{
		let nearest: EnemyArchetype | null = null, dist: number = 0;
		for (const e of this.entities)
		{
			if (!isEnemyArchetype(e) || !(e.city || e.soldier) || e.player == player || exclude.includes(e))
				continue;
			const stepsTo = origin.stepsTo(e.position.position);
			if (nearest == null || stepsTo < dist)
			{
				nearest = e;
				dist = stepsTo;
			}
		}
		return nearest;
	}

	findEnemiesInRange(player: Player, origin: Point2d, range: number): EnemyArchetype[]
	{
		const result: EnemyArchetype[] = [];
		for (const e of this.entities)
			if (isEnemyArchetype(e) && (e.city || e.soldier) && e.player != player && origin.stepsTo(e.position.position) <= range)
				result.push(e);
		return result;
	}
}

export type EnemyArchetype = Archetype<['player', 'position', 'movement', 'health']>;

function isEnemyArchetype(e: Entity): e is EnemyArchetype
{
	return isArchetype(e, 'player', 'position', 'movement', 'health');
}