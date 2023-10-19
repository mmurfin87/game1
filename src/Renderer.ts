import { GameState } from "./GameState.js";
import { Positioned } from "./Positioned.js";
import { Terrain } from "./Tile.js";


export class Renderer
{
	private readonly grasslands = (() => {
		const tmp = new Image();
		tmp.src = "http://localhost:8080/grass(1).png";
		return tmp;
	})();
	private finalRenderImage: ImageData | null = null;

	constructor(
		public readonly canvas: HTMLCanvasElement,
		private readonly ctx: CanvasRenderingContext2D,
		private readonly actions: HTMLDivElement,
		public readonly unitActions: HTMLElement,
		public readonly nextTurn: HTMLButtonElement
	)
	{}

	private renderVictory(): void
	{
		this.ctx.putImageData(this.finalRenderImage as ImageData, 0, 0);

		// Draw victory text
		this.drawTextCenteredOn("Victory!", 48, 'black', this.canvas.width / 2, this.canvas.height / 2);

		this.renderFireworks();
	}

	private renderDefeat(): void
	{
		this.ctx.putImageData(this.finalRenderImage as ImageData, 0, 0);

		// Draw victory text
		this.drawTextCenteredOn("Defeat", 48, 'black', this.canvas.width / 2, this.canvas.height / 2);
	}

	private renderFireworks(): void
	{
		let spliceAfter = fireworks.length;
		// Update and draw each firework particle
		for (let i = fireworks.length - 1; i >= 0; i--)
		{
			fireworks[i].draw(this.ctx);
			if (fireworks[i].update())	// update returns true if the firework is expended
			{
				fireworks[i--] = fireworks[spliceAfter-- - 1];
				//fireworks.splice(i, 1);
			}
		}
		if (spliceAfter < fireworks.length)
			fireworks.splice(spliceAfter, fireworks.length - spliceAfter);
	}

	render(gameState: GameState): void
	{
		if (gameState.gameover)
		{
			const victory = gameState.checkWinner() == gameState.humanPlayer;
			if (this.finalRenderImage == null)
			{
				this.renderBoard(gameState);
				this.finalRenderImage = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
				if (victory)
					setInterval(() => 
					{
						createRandomFirework(this.canvas.width, this.canvas.height);
					}, 250); // Adjust the interval as needed
				  
			}
			if (victory)
				this.renderVictory();
			else
				this.renderDefeat();
		}
		else
			this.renderBoard(gameState);
	}

	drawTextCenteredOn(text: string, fontSize: number, color: string, x: number, y: number)
	{
		this.ctx.fillStyle = color;
		this.ctx.font = fontSize + 'px Arial';
		const width = this.ctx.measureText(text).width;
		this.ctx.fillText(text, x-(width/2), y+fontSize/2);
	}

	// Function to draw the red circle around the selected city
	drawSelection(position: Positioned, tileSize: number)
	{
		this.ctx.strokeStyle = 'red';
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.arc(
			position.col * tileSize + tileSize / 2,
			position.row * tileSize + tileSize / 2,
			tileSize / (position.type == "City" ? 2 : 3) + 2, // Adjust the radius to your liking
			0,
			Math.PI * 2
		);
		this.ctx.stroke();
	}

	renderBoard(gameState: GameState)
	{
		const ts = gameState.tileSize;
		const hts = ts / 2;
		const ownerBarOffset = Math.round(ts - 13), ownerBarHeight = ts - ownerBarOffset;

		// Clear canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw terrain
		for (let r = 0; r < gameState.numRows; r++)
		{
			for (let c = 0; c < gameState.numCols; c++)
			{
				switch (gameState.map[r * gameState.numRows + c].terrain)
				{
					case Terrain.GRASSLAND:	this.ctx.fillStyle = "green";	break;
					case Terrain.FOREST:	this.ctx.fillStyle = "darkgreen";break;
					case Terrain.MOUNTAINS:	this.ctx.fillStyle = "gray";		break;
					case Terrain.WATER:		this.ctx.fillStyle = "blue";		break;
					default:				this.ctx.fillStyle = "red";		break;
				}
				this.ctx.fillRect(c*ts, r*ts, ts, ts);
				//if (gameState.tileAtCoords(c, r).terrain == Terrain.GRASSLAND && this.grasslands.complete)
				//	this.ctx.drawImage(this.grasslands, 0, 0, this.grasslands.width, this.grasslands.height, c*ts, r*ts, ts, ts);
			}
		}
	
		// Draw cities
		gameState.cities.forEach(city => {
			this.ctx.fillStyle = 'yellow';
			this.ctx.fillRect(city.col * ts, city.row * ts, ts, ts);
			this.ctx.fillStyle = city.player.color;
			this.ctx.fillRect(city.col * ts, city.row * ts, ts, ownerBarHeight);
			this.drawTextCenteredOn(''+city.player.id, 12, "black", city.col*ts+ts/2, city.row*ts+5);
		});

		// Draw soldiers
		gameState.soldiers.forEach(soldier => {
			this.ctx.fillStyle = 'black';
			this.ctx.fillRect(soldier.col * ts + hts/2, soldier.row * ts + hts/2, hts, hts);
			this.ctx.fillStyle = soldier.player.color;
			this.ctx.fillRect(soldier.col * ts + hts/2, soldier.row * ts + hts/2, hts, ownerBarHeight);
			this.drawTextCenteredOn(''+soldier.player.id, 12, "white", soldier.col*ts+ts/2, soldier.row*ts+ts/2)
			soldier.update(gameState.currentTurn, gameState.currentTime);
		});

		// Draw Soldier paths
		gameState.soldiers.forEach(soldier => {
			if (soldier.path == null)
				return;
			let last = null;
			for (const p of soldier.path)
			{
				this.ctx.beginPath();
				this.ctx.arc(p.x * ts + hts, p.y * ts + hts, 5, 0, Math.PI * 2);
				this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
				this.ctx.fill();
				if (last != null)
				{
					this.ctx.beginPath();
					this.ctx.lineWidth = 1;
					this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
					this.ctx.moveTo(last.x * ts + hts, last.y * ts + hts);
					this.ctx.lineTo(p.x * ts + hts, p.y * ts + hts)
					this.ctx.stroke();
				}
				last = p;
			}
		});

		if (gameState.selection)
			this.drawSelection(gameState.selection, ts);
	}
}




// Function to generate a random number within a range
function getRandomInRange(min: number, max: number): number
{
	return Math.random() * (max - min) + min;
}

// Firework particle class
class FireworkParticle
{
	constructor(
		private x: number, 
		private y: number,
		private vx: number,
		private vy: number,
		private radius: number, 
		private color: string)
	{}

	draw(ctx: CanvasRenderingContext2D): void
	{
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = this.color;
		ctx.fill();
	}

	update(): boolean
	{
		// Apply velocity
		this.x += this.vx;
		this.y += this.vy;

		// simulate gravity
		this.vy += 0.1;

		// simulate wind resistance
		this.vx *= 0.99;
		this.vy *= 0.99;

		// Reduce radius to create the effect of fading out
		this.radius -= 0.075;

		return this.radius <= 0;
	}
}

// Array to store firework particles
const fireworks: FireworkParticle[] = [];

// Function to create a firework at a specified position
function createFirework(x: number, y: number)
{
	x = Math.round(x);
	y = Math.round(y);
	console.log(`Creating firework at ${x}, ${y}`);
	const particleCount = 100;
	const color = `hsl(${getRandomInRange(0, 360)}, 100%, 50%)`;

	for (let i = 0; i < particleCount && fireworks.length < 500; i++)
	{
		const angle = (Math.PI * 2) * (i / particleCount);
		const radius = getRandomInRange(2, 6);
		const speed = getRandomInRange(1, 5);
		const vx = Math.cos(angle) * speed;
		const vy = Math.sin(angle) * speed;
		const particle = new FireworkParticle(x, y, vx, vy, radius, color);

		fireworks.push(particle);
	}
}

// Function to create a firework at a random position
function createRandomFirework(width: number, height: number)
{
	const x = getRandomInRange(0, width);
	const y = getRandomInRange(0, height); // Start from the bottom of the canvas
	createFirework(x, y);
}