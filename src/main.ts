import { aiThink } from "./ArtificialIntelligence.js";
import { Camera } from "./Camera.js";
import { Controller } from "./Controller.js";
import { GameState } from "./GameState.js";
import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";
import { Renderer } from "./Renderer.js";
import { UnitMovementSystem } from "./UnitMovementSystem.js";

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
	console.log('Next Turn');
	unitMovementSystem.nextTurn(gameState.entities, gameState);
	gameState.cleanupDefeatedPlayers();
	aiThink(gameState);
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