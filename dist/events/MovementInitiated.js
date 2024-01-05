export class UnitMovementEvent {
    id;
    origin;
    target;
    start;
    duration;
    static name = 'UnitMovement';
    name = UnitMovementEvent.name;
    constructor(id, origin, target, start, duration) {
        this.id = id;
        this.origin = origin;
        this.target = target;
        this.start = start;
        this.duration = duration;
    }
}
