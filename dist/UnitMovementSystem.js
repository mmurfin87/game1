import { isArchetype } from "./Entity.js";
export class UnitMovementSystem {
    lastTurn = 0;
    update(entities, gameState) {
        for (const entity of entities) {
            if (entity.movement?.path?.length == 0)
                throw new Error("Path Length 0");
            if (isArchetype(entity, 'position', 'actionable', 'movement'))
                follow(entity, false, gameState);
        }
    }
    nextTurn(entities, gameState) {
        for (const entity of entities) {
            if (!isArchetype(entity, 'position', 'actionable', 'movement'))
                continue;
            if (entity.movement.path?.length == 0)
                throw new Error("Path Length 0");
            if (entity.actionable.remaining > 0)
                follow(entity, true, gameState);
            entity.movement.wait = true;
            entity.actionable.remaining = entity.actionable.actions;
        }
        this.lastTurn = gameState.currentTurn;
    }
}
function follow(entity, nextTurn, gameState) {
    if (!entity.position || !entity.movement)
        return false;
    const movement = entity.movement;
    if (movement.path == null)
        return false;
    else if (entity.actionable.remaining < 1) {
        movement.stepStart = null;
        movement.wait = true;
        return true;
    }
    else if (movement.stepStart == null) {
        if (movement.wait == false || nextTurn)
            movement.stepStart = gameState.currentTime;
        return true;
    }
    else if (movement.stepStart + movement.stepDuration < gameState.currentTime) {
        if (entity.actionable.remaining >= 1) {
            const nextCollision = gameState.search(movement.path[1], 'soldier');
            if (nextCollision.length > 0) {
                movement.stepStart = null;
                movement.wait = true;
                console.log(`Collision at: ${movement.path[1]}`, movement, nextCollision);
                return false;
            }
            entity.position.position = movement.path[1];
            entity.actionable.remaining -= 1;
            movement.path.splice(0, 1);
            movement.stepStart = entity.actionable.remaining > 0 ? gameState.currentTime : null;
            if (entity.actionable.remaining > 0)
                movement.stepStart = gameState.currentTime;
            else {
                movement.stepStart = null;
                movement.wait = true;
            }
            if (movement.path.length < 2) {
                movement.path = null;
                movement.stepStart = null;
                return false;
            }
        }
        else
            movement.stepStart = null;
        return true;
    }
    else
        return true;
}
