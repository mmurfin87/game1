import { navigateNear } from "./AStar.js";
import { Camera } from "./Camera.js";
import { City } from "./City.js";
import { Archetype, Entity, isArchetype } from "./Entity.js";
import { GameState } from "./GameState.js";
import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";
import { Positioned } from "./Positioned.js";
import { Renderer } from "./Renderer.js";
import { Soldier } from "./Soldier.js";
import { Terrain } from "./Tile.js";
import { element } from "./Util.js";
import { Action } from "./actions/Action.js";
import { AttackSoldierAction } from "./actions/AttackSoldierAction.js";
import { BuildSoldierAction } from "./actions/BuildSoldierAction.js";
import { HealAction } from "./actions/HealAction.js";
import { SettleAction } from "./actions/SettleAction.js";
import { TargetMoveAction } from "./actions/TargetMoveAction.js";

class ActionOption
{
	constructor(
		public readonly name: string,
		public readonly execute: () => void
	)
	{}
}

export class Controller
{
	private moveAction: ((coords: Point2d) => Action) | null = null;
	private drag: boolean = false;
	private dragStart: number = Number.MAX_VALUE;

	constructor(
		private entities: Entity[],		// temporary - we shouldn't keep a reference to this
		private gameState: GameState,
		private camera: Camera,
		private renderer: Renderer)
	{
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
	
	private calculateActions(player: Player, selection: Positioned): ActionOption[]
	{
		const actions: ActionOption[] = [];
		switch (selection.type)
		{
			case "City":
			{
				const nearestEnemy = this.gameState.findNearestEnemyTarget(selection.player, selection.locate(), []);
				if (selection.movesLeft > 0 && (nearestEnemy == null || nearestEnemy.locate().stepsTo(selection.locate()) > 0))
					actions.push(new ActionOption("Train Soldier", () => new BuildSoldierAction(this.gameState, player, selection).execute(this.entities)));
			}
				break;
			case "Soldier":
				const entity: SoldierArchetype | undefined = findSoldierEntity(this.entities, selection);
				if (!entity)
					throw new Error("Can't find entity for selection");
				if (entity.movement.movesLeft > 0)
				{
					if (entity.health.remaining < entity.health.amount)
						actions.push(new ActionOption("Heal", () => new HealAction(entity).execute(this.entities)));
					actions.push(new ActionOption("Move", () => 
					{ 
						this.moveAction = (p: Point2d) => {
							const path = navigateNear(this.gameState, entity.position.position, p);
							if (path)
								return new TargetMoveAction(entity, path);
							return {execute(entities: Entity[]) { console.log('NO ACTION'); }};	// TODO: this is pretty terrible
						}; 
					}));
					const settlement: City | undefined = this.gameState.searchCoords(entity.position.position.y, entity.position.position.x).find(pos => pos.type == "City" && pos.player != player) as City | undefined;
					if (settlement)
						actions.push(new ActionOption("Settle", () => new SettleAction(player, entity, settlement).execute()));
					const enemiesInRange = this.gameState.findEnemiesInRange(player, entity.position.position, 1).filter(e => e.type == "Soldier");
					if (enemiesInRange.length > 0)
						actions.push(new ActionOption("Attack", () => { 
							this.moveAction = (p: Point2d) => {
								//console.log(`Attacking on ${p} -> ${p.stepScale(gameState.tileSize)}`);
								let target: Positioned | Archetype<['position', 'movement', 'health']> | undefined = enemiesInRange.find(pos => {
									const result = pos.col == p.x && pos.row == p.y;
									console.log(`	comparing ${p} to (${pos.col},${pos.row}) = ${result}`);
									return result;
								});
								if (target)
									target = this.entities.find(e => target == e.soldier && isArchetype(e, 'position', 'movement', 'health')) as Archetype<['position', 'movement', 'health']> | undefined;
								if (target)
									return new AttackSoldierAction(entity, target, this.gameState);
								else
									throw new Error("Invalid attack target");
							};
						}));
				}
				break;
		}
		return actions;
	}

	resolvePlayerActions()
	{
		while (this.renderer.unitActions.hasChildNodes())
		this.renderer.unitActions.removeChild(this.renderer.unitActions.lastChild as Node);

		if (this.gameState.selection == null)
			return;

		const actions: ActionOption[] = this.calculateActions(this.gameState.humanPlayer, this.gameState.selection);

		for (const action of actions)
		{
			const actionButton = element("button", { "type": "button" }, action.name);
			const target = this.gameState.selection;
			actionButton.addEventListener("click", () => {
				action.execute();			
				this.resolvePlayerActions();
			});
			this.renderer.unitActions.appendChild(actionButton);
		}
	}

	leftClickHandler(e: MouseEvent)
	{
		e.preventDefault();
		if (this.drag)
			return;
		const coords = this.renderer.screenToGridCoords(e.offsetX, e.offsetY);
		if (this.moveAction)
		{
			try
			{
				this.moveAction(coords).execute(this.entities);
			}
			catch (e)
			{
				if (e instanceof Error)
					console.log(e.message);
				else
					console.log(e);
			}
			this.moveAction = null;
			console.log(`moveAction cleared: ${this.moveAction}`);
			return;
		}
		const oldSelection = this.gameState.selection;
		this.gameState.selection = this.gameState.search(coords)
			.find(pos => pos.player.id == this.gameState.humanPlayer.id) ?? null;
		this.resolvePlayerActions();
	}

	rightClickHandler(e: MouseEvent)
	{
		e.preventDefault(); // Prevent the default context menu
		const target: Point2d = this.renderer.screenToGridCoords(e.offsetX, e.offsetY);

		if (!this.gameState.selection)
		{
			this.gameState.search(target)
				.forEach(pos => console.log(pos));
			return;
		}

		switch (this.gameState.selection.type)
		{
			case "City":
			{
				break;
			}
			case "Soldier":
			{
				const soldier: Soldier = this.gameState.selection as Soldier;
				const soldierEntity = findSoldierEntity(this.entities, soldier);
				if (!soldierEntity)
					throw new Error("Can't find entity for selection");
				const origin: Point2d = this.gameState.selection.locate();
				const distanceToTarget = origin.stepsTo(target);
				
				const targetTerrain: Terrain = this.gameState.map[target.y * this.gameState.numRows + target.x].terrain;
				if (targetTerrain == Terrain.WATER || targetTerrain == Terrain.MOUNTAINS)
					console.log(`Target (${target.y},${target.x}) is ${targetTerrain} and cannot be traversed`);
				else
				{
					const occupant: Entity | undefined = this.entities.find(e => Point2d.equivalent(e.position?.position ?? new Point2d(0, -1), e.position?.position ?? new Point2d(-1, 0)) && e.soldier);
					if (occupant && distanceToTarget < 2)
					{
						if (occupant.soldier == soldier)
						{
							if (occupant.movement)
							{
								occupant.movement.path = null;
								occupant.movement.stepStart = null;
							}
						}
						else if (occupant.player == this.gameState.humanPlayer)
							console.log(`Can't stack friendly units`);
						else if (soldier.movesLeft > 0 && distanceToTarget == 1 && isArchetype(occupant, 'position', 'movement', 'health'))
							new AttackSoldierAction(soldierEntity, occupant, this.gameState).execute(this.entities);
					}
					else
					{
						const path = navigateNear(this.gameState, soldier.locate(), target);
						if (path)
							new TargetMoveAction(soldierEntity, path).execute(this.entities);
					}
				}
				
				break;
			}
		}
		this.resolvePlayerActions();
	}

	wheelHandler(e: WheelEvent)
	{
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

	mouseDownHandler(e: MouseEvent)
	{
		this.dragStart = Date.now();
	}

	mouseUpHandler(e: MouseEvent)
	{
		this.drag = false;
		this.dragStart = Number.MAX_VALUE;
	}

	mouseMoveHandler(e: MouseEvent)
	{
		if (Date.now() - this.dragStart >= 100)
		this.drag = true;

		if (this.drag)
		{
			this.camera.x -= e.movementX;
			this.camera.y -= e.movementY;
		}
	}

	mouseLeaveHandler(e: MouseEvent)
	{
		this.drag = false;
		this.dragStart = Number.MAX_VALUE;
	}
}

type SoldierArchetype = Archetype<['position', 'movement', 'health']>;

function findSoldierEntity(entities:Entity[], soldier: Soldier): SoldierArchetype | undefined
{
	return entities.find(e => soldier == e.soldier && isArchetype(e, 'position', 'movement', 'health')) as SoldierArchetype | undefined;
}