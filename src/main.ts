import { City } from "./City.js";
import { GameState } from "./GameState.js";
import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";
import { Positioned } from "./Positioned.js";
import { Renderer } from "./Renderer.js";
import { Soldier } from "./Soldier.js";
import { Tile, Terrain } from "./Tile.js";
import { Action } from "./actions/Action.js";
import { BuildSoldierAction } from "./actions/BuildSoldierAction.js";
import { SettleAction } from "./actions/SettleAction.js";
import { TargetMoveAction } from "./actions/TargetMoveAction.js";

const gameState: GameState = (() => {
	const numRows = 10, numCols = 10;
	const barbarianPlayer = new Player(0);
	const humanPlayer = new Player(1);
	return new GameState(
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

const instawin = element("button", { "type": "button" }, "Insta-Win");
instawin.addEventListener("click", () => gameState.cities.forEach(city => city.player = gameState.humanPlayer));
(document.getElementById("actions") as HTMLElement).appendChild(instawin);

// Call the function to generate random cities
gameState.generateRandomCities();

// Start the game loop
requestAnimationFrame(() => renderer.render(gameState));

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
				}
			}
			else
				console.log(`Target (${target.y},${target.x}) distance ${distanceToTarget} out of range ${soldier.movesLeft}`);
			break;
		}
	}

	calculateActions();
});

// Handle click events to create soldiers and select soldiers
renderer.canvas.addEventListener('click', (e: MouseEvent) => {
	gameState.selection = gameState.select(e.offsetX, e.offsetY, gameState.humanPlayer);
	if (gameState.selection)
		calculateActions();
});

renderer.nextTurn.addEventListener("click", (e: MouseEvent) => {
	console.log('Next Turn');
	gameState.soldiers.forEach(s => s.movesLeft = s.moves);
	gameState.cities.forEach(s => s.movesLeft = s.moves);
	calculateActions();
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

function calculateActions()
{
	while (renderer.unitActions.hasChildNodes())
			renderer.unitActions.removeChild(renderer.unitActions.lastChild as Node);

	if (gameState.selection == null)
		return;

	let actions: Action[] = [];
	switch (gameState.selection.type)
	{
		case "City":
			actions = [
				new BuildSoldierAction(gameState.humanPlayer, gameState.selection, gameState.soldiers)
			];
			break;
		case "Soldier":
			actions = [
				new TargetMoveAction(gameState.selection),
				new SettleAction(gameState.humanPlayer, gameState.selection, gameState.search.bind(gameState))
			]
			break;
	}

	for (const action of actions)
	{
		const cost = action.prepare();
		if (cost < 0 || cost > gameState.selection.movesLeft)
			continue;
		const actionButton = element("button", { "type": "button" }, action.name());
		const target = gameState.selection;
		actionButton.addEventListener("click", () => {
			action.execute()
			target.movesLeft -= cost;
			console.log(`Executed ${action.name()} costing ${cost} move${cost == 1 ? '' : 's'} leaving ${target.type} with ${target.movesLeft} move${target.movesLeft == 1 ? '' : 's'} left`);
			gameState.selection = null;
			calculateActions();
		});
		renderer.unitActions.appendChild(actionButton);
	}
}