export class SettleAction {
    player;
    selection;
    settlement;
    constructor(player, selection, settlement) {
        this.player = player;
        this.selection = selection;
        this.settlement = settlement;
    }
    execute() {
        if (this.selection.actionable.remaining < 1)
            throw new Error("Not enough moves");
        if (this.settlement.player == this.player)
            throw new Error("Player already owns this settlement");
        this.selection.actionable.remaining -= 1;
        this.settlement.player = this.player;
    }
}
