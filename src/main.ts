const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d') || (() =>{throw new Error("No context")})();
const nextTurn: HTMLButtonElement = document.getElementById("nextTurn") as HTMLButtonElement;

const tileSize: number = 40;
const numRows: number = 12;
const numCols: number = 12;

const map: Tile[] = new Array(numRows * numCols).fill(null);
const cities: City[] = [];
const soldiers: Soldier[] = [];
const barbarianPlayer = new Player(0);
const humanPlayer = new Player(1);
const players: Player[] = [ barbarianPlayer, humanPlayer, new Player(2) ];
let lastTime: number;
let selection: Positioned | null = null;

// Other code related to the game loop and event handling

// Function to generate random cities
function generateRandomCities() {

	for (let row = 0; row < numRows; row++)
	{
		for (let col = 0; col < numCols; col++)
		{
			const rand = Math.random();
			let terrain: Terrain = Terrain.GRASSLAND;
			if (rand < 0.55)
				terrain = Terrain.GRASSLAND;
			else if (rand < 0.8)
				terrain = Terrain.FOREST;
			else if (rand < 0.9)
				terrain = Terrain.MOUNTAINS;
			else
				terrain = Terrain.WATER;
			map[row * numRows + col] = new Tile(terrain);

			if (Math.random() < 0.1) {
				cities.push(new City(row, col, barbarianPlayer));
			}
		}
	}

	cities[0].player = humanPlayer;
	cities[cities.length-1].player = players[players.length-1];
}

// Call the function to generate random cities
generateRandomCities();

// Start the game loop
requestAnimationFrame(gameLoop);

// Handle right-click events to move soldiers
canvas.addEventListener('contextmenu', (e: MouseEvent) => {
	if (!selection)
		return;

	e.preventDefault(); // Prevent the default context menu

	const clickX: number = e.offsetX;
	const clickY: number = e.offsetY;

	switch (selection.type)
	{
		case "City":
		{
			let targetCity: City | null = target(e.offsetX, e.offsetY, humanPlayer, "City") as City;

			if (targetCity && targetCity !== selection) {
				// Create a soldier at the selected city
				const newSoldier = new Soldier(selection.row, selection.col, humanPlayer, 500);

				// Set the soldier's target to the target city
				newSoldier.moveTo(targetCity.row, targetCity.col);

				// Add the soldier to the soldiers array
				soldiers.push(newSoldier);

				// Clear the selection
				selection = null;
			}
			break;
		}
		case "Soldier":
		{
			(selection as Soldier).moveTo(Math.floor(clickY/tileSize), Math.floor(clickX/tileSize));
			break;
		}
	}
});

// Handle click events to create soldiers and select soldiers
canvas.addEventListener('click', (e: MouseEvent) => {
	
	selection = select(e.offsetX, e.offsetY, humanPlayer);
});

function select(x: number, y: number, player:Player, restrictType?: Positioned['type']): Positioned | null
{
	const r = Math.floor(y / tileSize), c = Math.floor(x / tileSize);

	// Check for soldier selection first
	for (const posArray of [soldiers, cities])
	{
		for (const pos of posArray)
		{
			if (r == pos.row && c == pos.col && pos.player.id == player.id && (!restrictType || pos.type === restrictType))
			{
				console.log(`Selected ${pos.type} (${pos.row},${pos.col}`);
				return pos;
			}
			
		}
	}

	return null;
}

function target<T extends Positioned>(x: number, y: number, player: Player, restrictType?: T['type']): T | null
{
	const r = Math.floor(y / tileSize), c = Math.floor(x / tileSize);

	// Check for soldier selection first
	for (const posArray of [soldiers, cities])
	{
		for (const pos of posArray)
		{
			if (r == pos.row && c == pos.col && (!restrictType || pos.type === restrictType))
			{
				// Can't stack soldiers
				if (pos.type == "Soldier" && pos.player.id == player.id)
					break;
				console.log(`Selected ${pos.type} (${pos.row},${pos.col}`);
				return pos as T;
			}
		}
	}

	return null;
}