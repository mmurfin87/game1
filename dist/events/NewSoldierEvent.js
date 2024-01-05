export class NewSoldierEvent {
    id;
    position;
    moves;
    static name = 'NewSoldier';
    name = NewSoldierEvent.name;
    constructor(id, position, moves) {
        this.id = id;
        this.position = position;
        this.moves = moves;
    }
}
