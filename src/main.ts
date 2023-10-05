import { City } from "./City.js";
import { GameState } from "./GameState.js";
import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";
import { Positioned } from "./Positioned.js";
import { Renderer } from "./Renderer.js";
import { Soldier } from "./Soldier.js";
import { Tile, Terrain } from "./Tile.js";
import { Action, ActionContinuation, ActionExecutionParameter, ActionExecutionState } from "./actions/Action.js";
import { BuildSoldierAction } from "./actions/BuildSoldierAction.js";
import { SettleAction } from "./actions/SettleAction.js";
import { TargetMoveAction } from "./actions/TargetMoveAction.js";

const gameState: GameState = (() => {
	const numRows = 10, numCols = 10;
	const barbarianPlayer = new Player(0);
	const humanPlayer = new Player(1);
	return new GameState(
		0,
		0,
		new Array(numRows * numCols).fill(null),
		500/numRows,
		numRows,
		numCols,
		[],
		[],
		barbarianPlayer,
		humanPlayer,
		[ barbarianPlayer, humanPlayer, new Player(2) ],
		null
	);
})();

const renderer: Renderer = (() => {
	const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	return new Renderer(
		canvas,
		canvas.getContext('2d') as CanvasRenderingContext2D,
		document.getElementById("actions") as HTMLDivElement,
		document.getElementById("unit-actions") as HTMLElement,
		document.getElementById("nextTurn") as HTMLButtonElement
	);
})();

let lastTurn = -1;
function gameLoop()
{
	if (lastTurn < gameState.currentTurn)
	{	
		lastTurn = gameState.currentTurn;
		aiThink();
	}

	renderer.render(gameState);
	requestAnimationFrame(gameLoop);
}

const instawin = element("button", { "type": "button" }, "Insta-Win");
instawin.addEventListener("click", () => gameState.cities.forEach(city => city.player = gameState.humanPlayer));
(document.getElementById("actions") as HTMLElement).insertBefore(instawin, document.getElementById("unit-actions") as HTMLElement);//appendChild(instawin);

// Call the function to generate random cities
gameState.generateRandomCities();

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
			const target: Point2d = new Point2d(clickX, clickY).stepScale(gameState.tileSize);
			const distanceToTarget = origin.stepsTo(target);
			if (distanceToTarget <= soldier.movesLeft)
			{
				const targetTerrain: Terrain = gameState.map[target.y * gameState.numRows + target.x].terrain;
				if (targetTerrain == Terrain.WATER || targetTerrain == Terrain.MOUNTAINS)
					console.log(`Target (${target.y},${target.x}) is ${targetTerrain} and cannot be traversed`);
				else
				{
					console.log(`Target (${target.y},${target.x}) distance ${distanceToTarget} in range ${soldier.movesLeft}`);
					soldier.moveTo(target);
					soldier.movesLeft -= distanceToTarget;
				}
			}
			else
				console.log(`Target (${target.y},${target.x}) distance ${distanceToTarget} out of range ${soldier.movesLeft}`);
			break;
		}
	}

	resolvePlayerActions();
});

// Handle click events to create soldiers and select soldiers
type MouseEventHandler = (arg: ActionExecutionParameter[ActionExecutionState.NEED_GRID_COORDS]) => void;
let captureCoordsForAction: MouseEventHandler | null = null;
renderer.canvas.addEventListener('click', (e: MouseEvent) => {
	if (captureCoordsForAction != null)
	{
		const coords = new Point2d(e.offsetX, e.offsetY).stepScale(gameState.tileSize);
		console.log(`Captured Coordinates for Action: (${e.offsetX},${e.offsetY}) => (${coords.x},${coords.y})`);
		captureCoordsForAction(coords);
		captureCoordsForAction = null;
		return;
	}
	gameState.selection = gameState.select(e.offsetX, e.offsetY, gameState.humanPlayer);
	if (gameState.selection)
		resolvePlayerActions();
});

renderer.nextTurn.addEventListener("click", (e: MouseEvent) => {
	console.log('Next Turn');
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

function calculateActions(player: Player, selection: Positioned): Action[]
{
	let actions: Action[] = [];
	switch (selection.type)
	{
		case "City":
			actions = [
				new BuildSoldierAction(player, selection, gameState.soldiers)
			];
			break;
		case "Soldier":
			actions = [
				new TargetMoveAction(selection),
				new SettleAction(player, selection, gameState.search.bind(gameState))
			]
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

	const actions: Action[] = calculateActions(gameState.humanPlayer, gameState.selection);

	for (const action of actions)
	{
		const cost = action.prepare();
		if (cost < 0 || cost > gameState.selection.movesLeft)
			continue;
		const actionButton = element("button", { "type": "button" }, action.name());
		const target = gameState.selection;
		actionButton.addEventListener("click", () => {
			const result: ActionContinuation = action.execute();
			switch (result.executionState)
			{
				case ActionExecutionState.COMPLETE:
					target.movesLeft -= cost;
					console.log(`Executed ${action.name()} costing ${cost} move${cost == 1 ? '' : 's'} leaving ${target.type} with ${target.movesLeft} move${target.movesLeft == 1 ? '' : 's'} left`);
					gameState.selection = null;
					break;
				case ActionExecutionState.NEED_GRID_COORDS:
					captureCoordsForAction = (arg) => { 
						(result.parameterHandler as (arg: Point2d) => void)(arg); 
						target.movesLeft -= cost;
						console.log(`Executed ${action.name()} costing ${cost} move${cost == 1 ? '' : 's'} leaving ${target.type} with ${target.movesLeft} move${target.movesLeft == 1 ? '' : 's'} left`);
						gameState.selection = null;
						resolvePlayerActions();
					};
					break;
			}
			
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
			
			const actions: Action[] = calculateActions(player, pos);
			
			// Rank the actions
			actions
				.filter(a => a.name() != "Train Soldier" || soldierCount < 3)
				.sort((a,b) => a.name() == "Move" ? 1 : 0)
			;

			for (const action of actions)
			{
				const cost = action.prepare();
				if (cost < 0 || cost > pos.movesLeft)
					continue;
				
				const result: ActionContinuation = action.execute();
				switch (result.executionState)
				{
					case ActionExecutionState.COMPLETE:
						pos.movesLeft -= cost;
						console.log(`Executed ${action.name()} costing ${cost} move${cost == 1 ? '' : 's'} leaving ${pos.type} with ${pos.movesLeft} move${pos.movesLeft == 1 ? '' : 's'} left`);
						break;
					case ActionExecutionState.NEED_GRID_COORDS:
						let origin: Point2d = new Point2d(pos.col, pos.row);
						const nearestTarget = findNearestEnemyTarget(player, origin, targets);
						if (nearestTarget == null)
						{
							console.log(`Identified nearest enemy target: null`);
							continue;
						}
						console.log(`Identified nearest enemy target: ${nearestTarget.type} (${nearestTarget?.col},${nearestTarget?.row})`);
						let vx = nearestTarget.col - origin.x, vy = nearestTarget.row - origin.y;
						vx = vx > 0 ? 1 : vx < 0 ? -1 : 0;
						vy = vy > 0 ? 1 : vy < 0 ? -1 : 0;
						result.parameterHandler(new Point2d(origin.x + vx, origin.y + vy));
						targets.push(nearestTarget);
						pos.movesLeft -= cost;
						console.log(`Executed ${action.name()} costing ${cost} move${cost == 1 ? '' : 's'} leaving ${pos.type} with ${pos.movesLeft} move${pos.movesLeft == 1 ? '' : 's'} left`);
						break;
				}
			}
		}
	}
}