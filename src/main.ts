import { aStar } from "./AStar.js";
import { Camera } from "./Camera.js";
import { City } from "./City.js";
import { GameState } from "./GameState.js";
import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";
import { Positioned } from "./Positioned.js";
import { SimpleDebugObject, LineDebugObject, Renderer } from "./Renderer.js";
import { Soldier } from "./Soldier.js";
import { Tile, Terrain } from "./Tile.js";
import { Action } from "./actions/Action.js";
import { AttackSoldierAction } from "./actions/AttackSoldierAction.js";
import { BuildSoldierAction } from "./actions/BuildSoldierAction.js";
import { HealAction } from "./actions/HealAction.js";
import { SettleAction } from "./actions/SettleAction.js";
import { TargetMoveAction } from "./actions/TargetMoveAction.js";

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - (canvas.nextElementSibling as HTMLElement).offsetHeight;
const tileSize = 50;
const dim = Math.min(Math.floor(canvas.width / tileSize), Math.floor(canvas.height / tileSize));

const gameState: GameState = (() => {
	const numRows = dim, numCols = dim;
	const barbarianPlayer = new Player(0, 'white');
	const humanPlayer = new Player(1, 'turquoise');
	return new GameState(
		0,
		0,
		new Array(numRows * numCols).fill(null),
		numRows,
		numCols,
		[],
		[],
		barbarianPlayer,
		humanPlayer,
		[ barbarianPlayer, humanPlayer, new Player(2, 'red'), new Player(3, 'purple')],
		null
	);
})();

const camera: Camera = new Camera(0, 0, canvas.width, canvas.height, 1.0, tileSize);

const renderer: Renderer = (() => {
	return new Renderer(
		camera,
		canvas,
		canvas.getContext('2d') as CanvasRenderingContext2D,
		document.getElementById("actions") as HTMLDivElement,
		document.getElementById("unit-actions") as HTMLElement,
		document.getElementById("nextTurn") as HTMLButtonElement,
		tileSize
	);
})();

function gameLoop()
{
	gameState.currentTime = Date.now();
	renderer.render(gameState);
	requestAnimationFrame(gameLoop);
}

// Call the function to generate random cities
gameState.generateRandomCities();
camera.centerOnGrid(gameState.cities.filter(c => c.player == gameState.humanPlayer)[0].locate());

// Start the game loop
requestAnimationFrame(gameLoop);

// Handle right-click events to move soldiers
renderer.canvas.addEventListener('contextmenu', (e: MouseEvent) => {
	if (!gameState.selection)
		return;

	e.preventDefault(); // Prevent the default context menu
	console.log("Right Click");
	const clickX: number = e.offsetX;
	const clickY: number = e.offsetY;

	switch (gameState.selection.type)
	{
		case "City":
		{
			break;
		}
		case "Soldier":
		{
			const soldier: Soldier = gameState.selection as Soldier;
			const origin: Point2d = new Point2d(gameState.selection.col, gameState.selection.row);
			const target: Point2d = renderer.screenToGridCoords(clickX, clickY);//new Point2d(clickX, clickY).stepScale(gameState.tileSize);
			const distanceToTarget = origin.stepsTo(target);
			
			const targetTerrain: Terrain = gameState.map[target.y * gameState.numRows + target.x].terrain;
			if (targetTerrain == Terrain.WATER || targetTerrain == Terrain.MOUNTAINS)
				console.log(`Target (${target.y},${target.x}) is ${targetTerrain} and cannot be traversed`);
			//else if (distanceToTarget <= soldier.movesLeft)
			else if (soldier.movesLeft > 0)
			{
				//const occupant = gameState.soldiers.find(s => s.col == target.x && s.row == target.y && s.type == "Soldier");
				const occupant: Soldier | null = gameState.tileAtCoords(target.x, target.y).occupant;
				if (occupant)
				{
					if (occupant == soldier)
						soldier.stop();
					else if (occupant.player == gameState.humanPlayer)
						console.log(`Can't stack friendly units`);
					else
						new AttackSoldierAction(soldier, occupant, gameState).execute();
				}
				else
				{
					console.log(`Target (${target.y},${target.x}) distance ${distanceToTarget} in range ${soldier.movesLeft}`);
					new TargetMoveAction(soldier, target, gameState).execute();
				}
			}
			else
			{
				//soldier.move(gameState.currentTurn, gameState.currentTime, aStar(gameState, origin, target, soldier.movesLeft));
			}
			
			break;
		}
	}

	resolvePlayerActions();
});

// Handle click events to create soldiers and select soldiers
let moveAction: ((coords: Point2d) => Action) | null = null;
renderer.canvas.addEventListener('click', (e: MouseEvent) => {
	if (drag)
		return;
	const coords = renderer.screenToGridCoords(e.offsetX, e.offsetY);
	//console.log(`Clicked (${e.offsetX},${e.offsetY}) [${camera.x},${camera.y}] => ${coords}`);
	//renderer.debug.push(new DebugObject(new Point2d(e.offsetX, e.offsetY), 2, 2, null));
	//renderer.debug.push(new DebugObject(renderer.gridToScreenCoords(coords), 2, 2, null));
	//renderer.debug.push(new LineDebugObject(new Point2d(e.offsetX, e.offsetY), renderer.gridToScreenCoords(coords), 2));
	if (moveAction)
	{
		console.log(`Captured Coordinates for Action: (${e.offsetX},${e.offsetY}) => (${coords.x},${coords.y})`);
		try
		{
			moveAction(coords).execute();
		}
		catch (e)
		{
			if (e instanceof Error)
				console.log(e.message);
			else
				console.log(e);
		}
		moveAction = null;
		console.log(`moveAction cleared: ${moveAction}`);
		return;
	}
	gameState.selection = gameState.select(coords, gameState.humanPlayer);
	//if (gameState.selection)
	//	renderer.debug.push(new LineDebugObject(new Point2d(e.offsetX, e.offsetY), renderer.gridToScreenCoords(gameState.selection.position()), 2));
	resolvePlayerActions();
});

renderer.canvas.addEventListener("wheel", (e: WheelEvent) => {
	const dscale = Math.max(-0.1, Math.min(0.1, e.deltaY * -0.001));
	const oldscale = camera.scale;
	camera.scale = Math.min(1.5, Math.max(0.6, camera.scale + dscale));
	//console.log(`Scroll: ${e.deltaY} -> ${dscale} => ${camera.scale}`);
	const dwidth = camera.width * (camera.scale - oldscale), dheight = camera.height * (camera.scale - oldscale);
	const percentX = e.offsetX / camera.width;
	const percentY = e.offsetY / camera.height;
	const dx = dwidth * percentX;
	const dy = dheight * percentY;
	camera.x += dx;
	camera.y += dy;
	e.preventDefault();
});

let drag: boolean = false, dragStart: number = Number.MAX_VALUE;
renderer.canvas.addEventListener("mousedown", (e: MouseEvent) => {
	dragStart = Date.now();
});

renderer.canvas.addEventListener("mousemove", (e: MouseEvent) => {
	if (Date.now() - dragStart >= 100)
		drag = true;

	if (drag)
	{
		camera.x -= e.movementX;
		camera.y -= e.movementY;
	}
});

renderer.canvas.addEventListener("mouseup", (e: MouseEvent) => {
	drag = false;
	dragStart = Number.MAX_VALUE;
})

renderer.canvas.addEventListener("mouseleave", (e: MouseEvent) => {
	drag = false;
	dragStart = Number.MAX_VALUE;
})

renderer.nextTurn.addEventListener("click", (e: MouseEvent) => {
	gameState.soldiers.filter(soldier => soldier.player == gameState.humanPlayer).forEach(soldier => soldier.nextTurn(gameState));
	console.log('Next Turn');
	gameState.cleanupDefeatedPlayers();
	aiThink();
	gameState.cleanupDefeatedPlayers();
	if (gameState.checkWinner() != null)
	{
		gameState.gameover = true;
		console.log("Game Over");
		return;
	}
	gameState.currentTurn += 1;
	gameState.soldiers.forEach(s => s.movesLeft = s.moves);
	gameState.cities.forEach(s => s.movesLeft = s.moves);
	resolvePlayerActions();
});

function element(tag: string, attrs?: Record<string, string>, text?: string): HTMLElement
{
	const e = document.createElement(tag);
	if (attrs)
		Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k]));
	if (text)
		e.appendChild(document.createTextNode(text));
	return e;
}

class ActionOption
{
	constructor(
		public readonly name: string,
		public readonly execute: () => void
	)
	{}
}

function calculateActions(player: Player, selection: Positioned): ActionOption[]
{
	const actions: ActionOption[] = [];
	switch (selection.type)
	{
		case "City":
		{
			const nearestEnemy = findNearestEnemyTarget(selection.player, selection.locate(), []);
			if (selection.movesLeft > 0 && (nearestEnemy == null || nearestEnemy.locate().stepsTo(selection.locate()) > 0))
				actions.push(new ActionOption("Train Soldier", () => new BuildSoldierAction(gameState, player, selection).execute()));
		}
			break;
		case "Soldier":
			if (selection.movesLeft > 0)
			{
				if (selection.healthLeft < selection.health)
					actions.push(new ActionOption("Heal", () => new HealAction(selection).execute()));
				actions.push(new ActionOption("Move", () => { moveAction = (p: Point2d) => new TargetMoveAction(selection, p, gameState); }));
				const settlement: City | undefined = gameState.search(selection.row, selection.col).find(pos => pos.type == "City" && pos.player != player) as City | undefined;
				if (settlement)
					actions.push(new ActionOption("Settle", () => new SettleAction(player, selection, settlement).execute()));
				const enemiesInRange = findEnemiesInRange(player, selection.locate(), 1).filter(e => e.type == "Soldier");
				if (enemiesInRange.length > 0)
					actions.push(new ActionOption("Attack", () => { 
						moveAction = (p: Point2d) => {
							//console.log(`Attacking on ${p} -> ${p.stepScale(gameState.tileSize)}`);
							const target = enemiesInRange.find(pos => {
								const result = pos.col == p.x && pos.row == p.y;
								console.log(`	comparing ${p} to (${pos.col},${pos.row}) = ${result}`);
								return result;
							});
							if (target && target.type == "Soldier")
								return new AttackSoldierAction(selection, target, gameState);
							else
								throw new Error("Invalid attack target");
						};
					}));
			}
			break;
	}
	return actions;
}

function resolvePlayerActions()
{
	while (renderer.unitActions.hasChildNodes())
			renderer.unitActions.removeChild(renderer.unitActions.lastChild as Node);

	if (gameState.selection == null)
		return;

	const actions: ActionOption[] = calculateActions(gameState.humanPlayer, gameState.selection);

	for (const action of actions)
	{
		const actionButton = element("button", { "type": "button" }, action.name);
		const target = gameState.selection;
		actionButton.addEventListener("click", () => {
			action.execute();			
			resolvePlayerActions();
		});
		renderer.unitActions.appendChild(actionButton);
	}
}

function findNearestEnemyTarget(player: Player, origin: Point2d, exclude: Positioned[]): Positioned | null
{
	let nearest: Positioned | null = null, dist: number = 0;
	for (const pos of [...gameState.soldiers, ...gameState.cities])
	{
		if (pos.player == player || exclude.includes(pos))
			continue;
		const stepsTo = origin.stepsTo(new Point2d(pos.col, pos.row));
		if (nearest == null || stepsTo < dist)
		{
			nearest = pos;
			dist = stepsTo;
		}
	}
	return nearest;
}

function findMoveableTiles(player: Player, origin: Point2d, range: number, gameState: GameState): Point2d[]
{
	const result: Point2d[] = [];
	for (let r = Math.max(0, origin.y - range); r <= origin.y + range; r++)
	{
		for (let c = Math.max(0, origin.x - range); r <= origin.x + range; c++)
		{
			const tile: Tile = gameState.tileAtCoords(c, r);
			if (tile.terrain == Terrain.WATER || tile.terrain == Terrain.MOUNTAINS)
				continue;
			result.push(new Point2d(c, r));
		}
	}
	return result;
}

function findEnemiesInRange(player: Player, origin: Point2d, range: number): Positioned[]
{
	const result: Positioned[] = [];
	for (const pos of [...gameState.soldiers, ...gameState.cities])
		if (pos.player != player && origin.stepsTo(pos.locate()) <= range)
			result.push(pos);
	return result;
}

function aiThink()
{
	for (const player of gameState.players)
	{
		if (player == gameState.barbarianPlayer || player == gameState.humanPlayer)
			continue;
		
		let soldierCount = 0;
		const targets: Positioned[] = [];
		for (const pos of [...gameState.soldiers, ...gameState.cities])
		{
			if (pos.player != player)
				continue;
			if (pos.type == 'Soldier')
				soldierCount++;
			
			const actionSorting = ["Move", "Attack", "Settle"];	// reverse sorted in increasing precedence
			const actions: ActionOption[] = calculateActions(player, pos)
				.filter(a => a.name != "Train Soldier" || soldierCount < 3)
				.sort((a,b) => (actionSorting.indexOf(b.name) ) - (actionSorting.indexOf(a.name) ?? 1))
			;

			for (const action of actions)
			{
				console.log(`AI Executing ${action.name}`);
				action.execute();
				if ((action.name == "Move" || action.name == "Attack") && moveAction)
				{
					let origin: Point2d = new Point2d(pos.col, pos.row);
					const nearestTarget = findNearestEnemyTarget(player, origin, targets);
					if (nearestTarget == null)
					{
						console.log(`Identified nearest enemy target: null`);
						continue;
					}
					console.log(`Identified nearest enemy target: ${nearestTarget.type} (${nearestTarget?.col},${nearestTarget?.row})`);
					try
					{
						moveAction(nearestTarget.locate()).execute();
					}
					catch (error)
					{
						console.log(`Caught error trying to execute ${action.name}`, error);
					}
					moveAction = null;
					targets.push(nearestTarget);
					console.log(`moveAction cleared: ${moveAction}`);
				}
				break;
			}
		}
		gameState.soldiers.filter(soldier => soldier.player == player).forEach(soldier => soldier.nextTurn(gameState));
	}
}