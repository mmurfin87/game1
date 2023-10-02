import { City } from "./City.js";
import { Soldier } from "./Soldier.js";

interface HasMoves
{
    type: string;
    moves: number;
    movesLeft: number;
}

export type Actionable = Extract<Soldier, HasMoves> | Extract<City, HasMoves>;