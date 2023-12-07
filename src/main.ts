import { aStar, navigateNear } from "./AStar.js";
import { Camera } from "./Camera.js";
import { City } from "./City.js";
import { Controller } from "./Controller.js";
import { Archetype, Entity, isArchetype } from "./Entity.js";
import { EventDispatch, SimpleEventDispatch } from "./EventDispatch.js";
import { GameState } from "./GameState.js";
import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";
import { Positioned } from "./Positioned.js";
import { SimpleDebugObject, LineDebugObject, Renderer } from "./Renderer.js";
import { Soldier } from "./Soldier.js";
import { UnitMovementSystem } from "./UnitMovementSystem.js";
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

const entities: Entity[] = [];

const controller: Controller = new Controller(entities, gameState, camera, renderer);

const unitMovementSystem = new UnitMovementSystem();

function gameLoop()
{
	gameState.currentTime = Date.now();
	unitMovementSystem.update(entities, gameState);
	renderer.render(entities, gameState);
	requestAnimationFrame(gameLoop);
}

// Call the function to generate random cities
gameState.generateRandomCities();
camera.centerOnGrid(gameState.cities.filter(c => c.player == gameState.humanPlayer)[0].locate());

// Start the game loop
requestAnimationFrame(gameLoop);

renderer.nextTurn.addEventListener("click", (e: MouseEvent) => {
	//gameState.soldiers.filter(soldier => soldier.player == gameState.humanPlayer).forEach(soldier => soldier.nextTurn(gameState));
	console.log('Next Turn');
	unitMovementSystem.nextTurn(entities, gameState);
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
	controller.resolvePlayerActions();
});

function aiThink()
{
	for (const player of gameState.players)
	{
		if (player == gameState.barbarianPlayer || player == gameState.humanPlayer)
			continue;
		
		let soldierCount = 0;
		const targets: Positioned[] = [];

		// First, move all my soldiers to attack targets
		for (const soldier of entities)
		{
			if (soldier.player != player || !isArchetype(soldier, 'position', 'movement', 'health'))
				continue;
			soldierCount++;

			if (soldier.movement.movesLeft < 1)
				continue;

			const inCity: City | undefined = gameState.searchCoords(soldier.position.position.y, soldier.position.position.x)
				.filter(p => p.player != player)
				.filter(City.isType)
				.find(p => p.row == soldier.position.position.y && p.col == soldier.position.position.x);
			if (inCity)
			{
				new SettleAction(player, soldier, inCity).execute();
				continue;
			}

			const enemiesInRange = gameState.findEnemiesInRange(player, soldier.position.position, 1);
			// Find the best nearby targets to attack
			let targetCity: City | null = null, targetSoldier: Soldier | null = null, targetEntity: Archetype<['position', 'movement', 'health']> | null = null;
			for (const target of enemiesInRange)
			{
				if (targets.includes(target))
					continue;
				switch (target.type)
				{
					case "City":
						if (!gameState.searchCoords(target.row, target.col).find(Soldier.isType))
						{
							targetCity = target;
						}
						break;
					case "Soldier":
						if (targetSoldier == null || ((targetEntity?.health?.remaining ?? 1) < (targetEntity?.health?.amount ?? 1)))
						{
							targetSoldier = target;
							targetEntity = (entities.find(e => e.soldier == target && isArchetype(e, 'position', 'movement', 'health')) ?? null) as Archetype<['position', 'movement', 'health']> | null;
						}
						break;
				}
			}
			if (targetCity != null)
			{
				const path = navigateNear(gameState, soldier.position.position, targetCity.locate());
				if (path)
					new TargetMoveAction(soldier, path).execute(entities);
			}
			else if (targetSoldier != null && targetEntity)
				new AttackSoldierAction(soldier, targetEntity, gameState).execute(entities);
			else if ((targetEntity?.health?.remaining ?? 1) < (targetEntity?.health?.amount ?? 1))
				new HealAction(soldier).execute(entities);
			else
			{
				const target = gameState.findNearestEnemyTarget(player, soldier.position.position, targets);
				console.log(`Identified nearest enemy target:`, target);
				if (target)
				{
					const path = navigateNear(gameState, soldier.position.position, target.locate());
					if (path)
						new TargetMoveAction(soldier, path).execute(entities);
				}
			}
		}

		for (const city of gameState.cities)
		{
			if (city.player != player)
				continue;

			if (city.movesLeft < 1)
				continue;

			if (soldierCount < 3 && !gameState.searchCoords(city.row, city.col).find(Soldier.isType))
				new BuildSoldierAction(gameState, player, city).execute(entities);
		}
	}
}