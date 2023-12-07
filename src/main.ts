import { aStar, navigateNear } from "./AStar.js";
import { Camera } from "./Camera.js";
import { City } from "./City.js";
import { Controller } from "./Controller.js";
import { Archetype, Entity, isArchetype } from "./Entity.js";
import { EventDispatch, SimpleEventDispatch } from "./EventDispatch.js";
import { EnemyArchetype, GameState } from "./GameState.js";
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

const controller: Controller = new Controller(gameState.entities, gameState, camera, renderer);

const unitMovementSystem = new UnitMovementSystem();

function gameLoop()
{
	gameState.currentTime = Date.now();
	unitMovementSystem.update(gameState.entities, gameState);
	renderer.render(gameState.entities, gameState);
	requestAnimationFrame(gameLoop);
}

// Call the function to generate random cities
gameState.generateRandomCities();
camera.centerOnGrid(gameState.entities.filter(e => e.city && e.player == gameState.humanPlayer)[0].position?.position ?? Point2d.origin());

// Start the game loop
requestAnimationFrame(gameLoop);

renderer.nextTurn.addEventListener("click", (e: MouseEvent) => {
	//gameState.soldiers.filter(soldier => soldier.player == gameState.humanPlayer).forEach(soldier => soldier.nextTurn(gameState));
	console.log('Next Turn');
	unitMovementSystem.nextTurn(gameState.entities, gameState);
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
	controller.resolvePlayerActions();
});

function aiThink()
{
	for (const player of gameState.players)
	{
		if (player == gameState.barbarianPlayer || player == gameState.humanPlayer)
			continue;
		
		let soldierCount = 0;
		const targets: EnemyArchetype[] = [];

		// First, move all my soldiers to attack targets
		for (const soldier of gameState.entities)
		{
			if (soldier.player != player || !isArchetype(soldier, 'position', 'movement', 'health', 'soldier'))
				continue;
			soldierCount++;

			if (soldier.movement.movesLeft < 1)
				continue;

			const inCity: Archetype<['position', 'city', 'player']> | undefined = gameState.search(soldier.position.position, 'city', 'player')
				.filter(p => p.player != player)
				.find(p => Point2d.equivalent(soldier.position.position, p.position.position));
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
				if (target.city)
				{
					if (gameState.search(target.position.position, 'soldier').length == 0)
					{
						targetCity = target.city;
						targetEntity = target;
					}
				}
				else if (target.soldier)
				{
					if (targetSoldier == null || ((targetEntity?.health?.remaining ?? 1) < (targetEntity?.health?.amount ?? 1)))
					{
						targetSoldier = target.soldier;
						targetEntity = target;
					}
				}
			}
			if (targetCity != null && targetEntity)
			{
				const path = navigateNear(gameState, soldier.position.position, targetEntity.position.position);
				if (path)
					new TargetMoveAction(soldier, path).execute(gameState.entities);
			}
			else if (targetSoldier != null && targetEntity)
				new AttackSoldierAction(soldier, targetEntity, gameState).execute(gameState.entities);
			else if ((targetEntity?.health?.remaining ?? 1) < (targetEntity?.health?.amount ?? 1))
				new HealAction(soldier).execute(gameState.entities);
			else
			{
				const target = gameState.findNearestEnemyTarget(player, soldier.position.position, targets);
				if (target)
				{
					const path = navigateNear(gameState, soldier.position.position, target.position.position);
					if (path)
						new TargetMoveAction(soldier, path).execute(gameState.entities);
				}
			}
		}

		for (const city of gameState.entities.filter((e: Entity): e is Archetype<['player', 'position', 'movement', 'health', 'city']> => isArchetype(e, 'player', 'position', 'movement', 'health', 'city')))
		{
			if (city.player != player)
				continue;

			if (city.movement.movesLeft < 1)
				continue;

			if (soldierCount < 3 && gameState.search(city.position.position, 'soldier').length == 0)
				new BuildSoldierAction(gameState, player, city).execute(gameState.entities);
		}
	}
}