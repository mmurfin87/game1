import { City } from "../City.js";
import { Player } from "../Player.js";
import { Positioned } from "../Positioned.js";
import { Soldier } from "../Soldier.js";
import { Action, ActionContinuation } from "./Action.js";

type Search = (row: number, col: number) => Positioned[];

export class SettleAction implements Action
{
    private settlement: City | null = null;

    constructor(private humanPlayer: Player, private selection: Soldier, private search: Search)
    {}

    name(): string
    {
        return "Settle";
    }

    prepare(): number
    {
        this.settlement = this.search(this.selection.row, this.selection.col).find(v => v.type == "City" && (v as City).player != this.humanPlayer) as City | null;
		return this.settlement != null && this.settlement.player != this.humanPlayer ? 1 : -1;
    }

    execute(): ActionContinuation
    {
        if (this.settlement)
            this.settlement.player = this.humanPlayer;
        return ActionContinuation.complete();
    }
}