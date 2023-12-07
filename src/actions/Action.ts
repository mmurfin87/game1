import { Entity } from "../Entity.js";

export interface Action
{
    execute(entities: Entity[]): void
}