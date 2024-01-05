export class MoveOrderEvent {
    id;
    path;
    static name = 'MoveOrder';
    name = MoveOrderEvent.name;
    constructor(id, path) {
        this.id = id;
        this.path = path;
    }
}
