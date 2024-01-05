export class PlayerSelectionEvent {
    player;
    selection;
    static name = 'PlayerSelection';
    name = PlayerSelectionEvent.name;
    constructor(player, selection) {
        this.player = player;
        this.selection = selection;
    }
}
