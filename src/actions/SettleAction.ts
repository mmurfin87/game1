import { City } from "../City.js";
import { Player } from "../Player.js";
import { Positioned } from "../Positioned.js";
import { Soldier } from "../Soldier.js";
import { Action, ActionDependency, PreparedAction } from "./Action.js";

type Search = (row: number, col: number) => Positioned[];

export class SettleAction extends PreparedAction
{
    constructor(private humanPlayer: Player, private selection: Soldier, private search: Search)
    {
        super("Settle");
    }

    execute(): void
    {
        const settlement = this.search(this.selection.row, this.selection.col).find(v => v.type == "City" && (v as City).player != this.humanPlayer) as City | null;
        if (settlement)
            settlement.player = this.humanPlayer;
    }
}