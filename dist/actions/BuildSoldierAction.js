import { Entity } from "../Entity.js";
import { Soldier } from "../Soldier.js";
import { Actionable } from "../components/Actionable.js";
import { Health } from "../components/Health.js";
import { Moveable } from "../components/Moveable.js";
import { Movement } from "../components/Movement.js";
import { Position } from "../components/Position.js";
import { Renderable } from "../components/Renderable.js";
export class BuildSoldierAction {
    gameState;
    player;
    selection;
    constructor(gameState, player, selection) {
        this.gameState = gameState;
        this.player = player;
        this.selection = selection;
    }
    execute(entities) {
        if (this.selection.actionable.remaining < 1)
            throw new Error("Insufficient remaining actions");
        entities.push(new Entity(Entity.newId(), this.player, new Position(this.selection.position.position.clone()), new Actionable(2, 0), new Moveable(2), new Movement(null, null, 500, false), new Renderable('soldier', 'black', null), new Health(10, 10), undefined, new Soldier()));
        this.selection.actionable.remaining = 0;
    }
}
