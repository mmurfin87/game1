import { InputHandler } from "../InputMode";
import { Point2d } from "../Point2d";
import { Positioned } from "../Positioned";

export enum ActionExecutionState { COMPLETE, NEED_GRID_COORDS };

export type ActionExecutionParameter = {
    [ActionExecutionState.COMPLETE]: void,
    [ActionExecutionState.NEED_GRID_COORDS]: Point2d
};

export class ActionContinuation
{
    static complete(): ActionContinuation
    {
        return new ActionContinuation(ActionExecutionState.COMPLETE, () =>{});
    }

    constructor(
        public readonly executionState: ActionExecutionState,
        public readonly parameterHandler: (arg: ActionExecutionParameter[typeof executionState]) => void
    )
    {}
}

export interface Action
{
    name(): string;
    prepare(): number;
    execute(): ActionContinuation;
}