export class Entity {
    id;
    player;
    position;
    actionable;
    moveable;
    movement;
    renderable;
    health;
    name;
    soldier;
    city;
    static idCounter = BigInt(0);
    static newId() {
        return Entity.idCounter++;
    }
    constructor(id, player, position, actionable, moveable, movement, renderable, health, name, soldier, city) {
        this.id = id;
        this.player = player;
        this.position = position;
        this.actionable = actionable;
        this.moveable = moveable;
        this.movement = movement;
        this.renderable = renderable;
        this.health = health;
        this.name = name;
        this.soldier = soldier;
        this.city = city;
    }
}
export function isArchetype(entity, ...k) {
    return k.every(key => !!entity[key]);
}
