import { City } from "./City.js";
import { Player } from "./Player.js";
import { Soldier } from "./Soldier.js";
import { With } from "./Util.js";
import { Actionable } from "./components/Actionable.js";
import { Health } from "./components/Health.js";
import { Moveable } from "./components/Moveable.js";
import { Movement } from "./components/Movement.js";
import { Named } from "./components/Named.js";
import { Position } from "./components/Position.js";
import { Renderable } from "./components/Renderable.js";

export class Entity
{
	static idCounter: bigint = BigInt(0);
	static newId(): bigint
	{
		return Entity.idCounter++;
	}

	constructor(
		public id: bigint,
		public player?: Player,
		public position?: Position,
		public actionable?: Actionable,
		public moveable?: Moveable,
		public movement?: Movement,
		public renderable?: Renderable,
		public health?: Health,
		public name?: Named,
		public soldier?: Soldier,
		public city?: City
	)
	{}
}

export type Archetype<K extends (keyof Entity)[]> = With<Entity, K[number]>;

export function isArchetype<K extends (keyof Entity)[]>(entity: Entity, ...k: K): entity is Archetype<K>
{
	return k.every(key => !!entity[key]);
}