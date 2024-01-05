import { navigateNear } from "./AStar.js";
import { isArchetype } from "./Entity.js";
import { Point2d } from "./Point2d.js";
import { Terrain } from "./Tile.js";
import { element } from "./Util.js";
import { AttackSoldierAction } from "./actions/AttackSoldierAction.js";
import { BuildSoldierAction } from "./actions/BuildSoldierAction.js";
import { HealAction } from "./actions/HealAction.js";
import { SettleAction } from "./actions/SettleAction.js";
import { TargetMoveAction } from "./actions/TargetMoveAction.js";
class ActionOption {
    name;
    execute;
    constructor(name, execute) {
        this.name = name;
        this.execute = execute;
    }
}
export class Controller {
    entities;
    gameState;
    camera;
    renderer;
    moveAction = null;
    drag = false;
    dragStart = Number.MAX_VALUE;
    constructor(entities, // temporary - we shouldn't keep a reference to this
    gameState, camera, renderer) {
        this.entities = entities;
        this.gameState = gameState;
        this.camera = camera;
        this.renderer = renderer;
        // Handle right-click events to move soldiers
        renderer.canvas.addEventListener('contextmenu', this.rightClickHandler.bind(this));
        // Handle click events to create soldiers and select soldiers
        renderer.canvas.addEventListener('click', this.leftClickHandler.bind(this));
        renderer.canvas.addEventListener("wheel", this.wheelHandler.bind(this));
        renderer.canvas.addEventListener("mousedown", this.mouseDownHandler.bind(this));
        renderer.canvas.addEventListener("mouseup", this.mouseUpHandler.bind(this));
        renderer.canvas.addEventListener("mousemove", this.mouseMoveHandler.bind(this));
        renderer.canvas.addEventListener("mouseleave", this.mouseLeaveHandler.bind(this));
    }
    calculateActions(player, selection) {
        const actions = [];
        if (isArchetype(selection, 'player', 'position', 'actionable', 'city')) {
            const nearestEnemy = this.gameState.findNearestEnemyTarget(selection.player, selection.position.position, []);
            if (selection.actionable.remaining > 0 && (nearestEnemy == null || nearestEnemy.position.position.stepsTo(selection.position.position) > 0))
                actions.push(new ActionOption("Train Soldier", () => new BuildSoldierAction(this.gameState, player, selection).execute(this.entities)));
        }
        else if (isArchetype(selection, 'player', 'position', 'actionable', 'movement', 'health', 'soldier')) {
            if (selection.actionable.remaining > 0) {
                if (selection.health.remaining < selection.health.amount)
                    actions.push(new ActionOption("Heal", () => new HealAction(selection).execute(this.entities)));
                actions.push(new ActionOption("Move", () => {
                    this.moveAction = (p) => {
                        const path = navigateNear(this.gameState, selection.position.position, p);
                        if (path)
                            return new TargetMoveAction(selection, path);
                        return { execute(entities) { console.log('NO ACTION'); } }; // TODO: this is pretty terrible
                    };
                }));
                const settlement = this.gameState.search(selection.position.position, 'player', 'city').find(city => city.player != player);
                if (settlement)
                    actions.push(new ActionOption("Settle", () => new SettleAction(player, selection, settlement).execute()));
                const enemiesInRange = this.gameState.findEnemiesInRange(player, selection.position.position, 1).filter(e => e.soldier);
                if (enemiesInRange.length > 0)
                    actions.push(new ActionOption("Attack", () => {
                        this.moveAction = (p) => {
                            const target = enemiesInRange.find(pos => Point2d.equivalent(pos.position.position, p));
                            if (target)
                                return new AttackSoldierAction(selection, target, this.gameState);
                            else
                                throw new Error("Invalid attack target");
                        };
                    }));
            }
        }
        return actions;
    }
    resolvePlayerActions() {
        while (this.renderer.unitActions.hasChildNodes())
            this.renderer.unitActions.removeChild(this.renderer.unitActions.lastChild);
        if (this.gameState.selection == null)
            return;
        const actions = this.calculateActions(this.gameState.humanPlayer, this.gameState.selection);
        for (const action of actions) {
            const actionButton = element("button", { "type": "button" }, action.name);
            const target = this.gameState.selection;
            actionButton.addEventListener("click", () => {
                action.execute();
                this.resolvePlayerActions();
            });
            this.renderer.unitActions.appendChild(actionButton);
        }
    }
    leftClickHandler(e) {
        e.preventDefault();
        if (this.drag)
            return;
        const coords = this.renderer.screenToGridCoords(e.offsetX, e.offsetY);
        if (this.moveAction) {
            if (this.gameState.inBounds(coords))
                this.moveAction(coords).execute(this.entities);
            else
                console.log(coords, 'Out of bounds');
            this.moveAction = null;
            console.log(`moveAction cleared: ${this.moveAction}`);
            return;
        }
        const oldSelection = this.gameState.selection;
        this.gameState.selection = this.gameState.search(coords).sort((a, b) => a.soldier ? -1 : b.soldier ? 1 : 0)
            .find(e => e.player?.id == this.gameState.humanPlayer.id) ?? null;
        this.resolvePlayerActions();
    }
    rightClickHandler(e) {
        e.preventDefault(); // Prevent the default context menu
        const target = this.renderer.screenToGridCoords(e.offsetX, e.offsetY);
        if (!this.gameState.selection) {
            this.gameState.search(target)
                .forEach(pos => console.log(pos));
            return;
        }
        if (isArchetype(this.gameState.selection, 'player', 'position', 'actionable', 'movement', 'health', 'soldier')) {
            const soldier = this.gameState.selection;
            const origin = soldier.position.position;
            const distanceToTarget = origin.stepsTo(target);
            const targetTerrain = this.gameState.map[target.y * this.gameState.numRows + target.x].terrain;
            if (targetTerrain == Terrain.WATER || targetTerrain == Terrain.MOUNTAINS)
                console.log(`Target (${target.y},${target.x}) is ${targetTerrain} and cannot be traversed`);
            else {
                const occupant = this.gameState.search(target, 'player', 'movement', 'health', 'soldier')[0] ?? undefined;
                if (occupant && distanceToTarget < 2) {
                    if (occupant.id == soldier.id) {
                        if (occupant.movement) {
                            occupant.movement.path = null;
                            occupant.movement.stepStart = null;
                        }
                    }
                    else if (occupant.player == this.gameState.humanPlayer)
                        console.log(`Can't stack friendly units`);
                    else if (soldier.actionable.remaining > 0 && distanceToTarget == 1)
                        new AttackSoldierAction(soldier, occupant, this.gameState).execute(this.entities);
                }
                else {
                    const path = navigateNear(this.gameState, soldier.position.position, target);
                    if (path)
                        new TargetMoveAction(soldier, path).execute(this.entities);
                }
            }
        }
        this.resolvePlayerActions();
    }
    wheelHandler(e) {
        e.preventDefault();
        const dscale = Math.max(-0.1, Math.min(0.1, e.deltaY * -0.001));
        const oldscale = this.camera.scale;
        this.camera.scale = Math.min(2.1, Math.max(0.6, this.camera.scale + dscale));
        //console.log(`Scroll: ${e.deltaY} -> ${dscale} => ${camera.scale}`);
        const dwidth = this.camera.width * (this.camera.scale - oldscale), dheight = this.camera.height * (this.camera.scale - oldscale);
        const percentX = e.offsetX / this.camera.width;
        const percentY = e.offsetY / this.camera.height;
        const dx = dwidth * percentX;
        const dy = dheight * percentY;
        this.camera.x += dx;
        this.camera.y += dy;
    }
    mouseDownHandler(e) {
        this.dragStart = Date.now();
    }
    mouseUpHandler(e) {
        this.drag = false;
        this.dragStart = Number.MAX_VALUE;
    }
    mouseMoveHandler(e) {
        if (Date.now() - this.dragStart >= 100)
            this.drag = true;
        if (this.drag) {
            this.camera.x -= e.movementX;
            this.camera.y -= e.movementY;
        }
    }
    mouseLeaveHandler(e) {
        this.drag = false;
        this.dragStart = Number.MAX_VALUE;
    }
}
function findSoldierEntity(entities, soldier) {
    return entities.find(e => soldier == e.soldier && isArchetype(e, 'position', 'movement', 'health'));
}
