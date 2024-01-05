import { navigateNear } from "../AStar.js";
export class AttackSoldierAction {
    attacker;
    defender;
    gameState;
    constructor(attacker, defender, gameState) {
        this.attacker = attacker;
        this.defender = defender;
        this.gameState = gameState;
    }
    execute(entities) {
        const distance = this.attacker.position.position.stepsTo(this.defender.position.position);
        if (this.attacker.actionable.remaining < distance)
            throw new Error("Not enough moves to attack");
        const origHealth = this.defender.health.remaining;
        this.defender.health.remaining -= Math.max(1, Math.floor(this.attacker.health.remaining / 2));
        if (this.defender.health.remaining > 0)
            this.attacker.health.remaining -= Math.floor((origHealth * 1.2) / 2);
        else {
            const defenderIndex = entities.indexOf(this.defender);
            if (defenderIndex != -1)
                entities.splice(defenderIndex, 1);
            if (this.attacker.movement && this.attacker.health.remaining > 0) {
                const path = navigateNear(this.gameState, this.attacker.position.position, this.defender.position.position);
                if (path) {
                    this.attacker.movement.path = path;
                    this.attacker.movement.stepStart = null;
                    this.attacker.movement.wait = false;
                }
                else
                    console.log("Can't move to defeated defender position!", this.attacker.position.position, this.defender.position.position);
            }
        }
        this.attacker.actionable.remaining -= distance;
        if (this.attacker.health.remaining <= 0) {
            const attackerIndex = entities.indexOf(this.attacker);
            if (attackerIndex != -1)
                entities.splice(attackerIndex, 1);
        }
        console.log(`Attacked defender at ${this.defender.position.position} which has ${this.defender.health.remaining} left`);
    }
}
