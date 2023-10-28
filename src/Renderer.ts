import { Camera } from "./Camera.js";
import { GameState } from "./GameState.js";
import { Point2d } from "./Point2d.js";
import { Positioned } from "./Positioned.js";
import { Terrain } from "./Tile.js";

function loadimage(url: string): HTMLImageElement
{
	const tmp = new Image();
	tmp.src = url;
	return tmp;
}

interface DebugObject
{
	render(ctx: CanvasRenderingContext2D): void;
}

export class SimpleDebugObject
{
	constructor(
		public coords: Point2d,
		public width: number,
		public height: number,
		public text: string | null = null
	)
	{}

	render(ctx: CanvasRenderingContext2D): void
	{
		ctx.fillStyle = "red";
		ctx.fillRect(this.coords.x, this.coords.y, this.width, this.height);
		if (this.text != null)
			drawTextCenteredOn(ctx, this.text, this.height, 'black', this.coords.x, this.coords.y);
	}
}

export class LineDebugObject implements DebugObject
{
	constructor(
		public origin: Point2d,
		public target: Point2d,
		public thickness: number
	)
	{}

	render(ctx: CanvasRenderingContext2D): void
	{
		ctx.beginPath();
		ctx.moveTo(this.origin.x, this.origin.y);
		ctx.lineTo(this.target.x, this.target.y);
		ctx.closePath();
		ctx.lineWidth = this.thickness;
		ctx.strokeStyle = 'red';
		ctx.stroke();
	}
}

export class Renderer
{
	public readonly debug: DebugObject[] = [];

	private readonly isoTilePath: Path2D;
	private readonly grasslands = loadimage("http://localhost:8080/isograss.png");
	private readonly mountains = loadimage("http://localhost:8080/isomountain.png");
	private finalRenderImage: ImageData | null = null;

	constructor(
		public readonly camera: Camera,
		public readonly canvas: HTMLCanvasElement,
		private readonly ctx: CanvasRenderingContext2D,
		private readonly actions: HTMLDivElement,
		public readonly unitActions: HTMLElement,
		public readonly nextTurn: HTMLButtonElement,
		private readonly tileSize: number
	)
	{
		const ox = 0, oy = 0;
		this.isoTilePath = new Path2D();
		this.isoTilePath.moveTo(ox, oy);
		this.isoTilePath.lineTo(ox + tileSize, oy + tileSize/2);
		this.isoTilePath.lineTo(ox, oy + tileSize);
		this.isoTilePath.lineTo(ox - tileSize, oy + tileSize/2);
		this.isoTilePath.closePath();
	}

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

		this.debug.forEach(d => d.render(this.ctx));
	}

	drawTextCenteredOn(text: string, fontSize: number, color: string, x: number, y: number)
	{
		drawTextCenteredOn(this.ctx, text, fontSize, color, x, y);
	}

	// Function to draw the red circle around the selected city
	drawSelection(position: Positioned, tileSize: number)
	{
		const offset = this.gridToScreenCoords(position.position());
		this.ctx.strokeStyle = 'red';
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.arc(
			offset.x,
			offset.y + this.tileSize/2,
			tileSize / (position.type == "City" ? 2 : 3) + 2, // Adjust the radius to your liking
			0,
			Math.PI * 2
		);
		this.ctx.stroke();
	}

	renderBoard(gameState: GameState)
	{
		const vw = this.canvas.width, hvw = vw / 2;
		const ts = this.tileSize;
		const hts = ts / 2, qts = hts / 2;
		const ownerBarOffset = Math.round(ts - 13), ownerBarHeight = ts - ownerBarOffset;

		// Clear canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.translate(-this.camera.x, -this.camera.y);
		this.ctx.scale(this.camera.scale, this.camera.scale);

		// Draw terrain
		for (let r = 0; r < gameState.numRows; r++)
		{
			for (let c = 0; c < gameState.numCols; c++)
			{
				const offset = this.gridToScreenCoords(new Point2d(c, r));
				this.ctx.save();
				this.ctx.translate(offset.x, offset.y);
				switch (gameState.map[r * gameState.numRows + c].terrain)
				{
					case Terrain.GRASSLAND:
						if (this.grasslands.complete)
							this.ctx.drawImage(this.grasslands, 0, 0, this.grasslands.width, this.grasslands.height, -ts, 0, ts*2, ts);
						else
						{
							this.ctx.fillStyle = "green";
							this.ctx.fill(this.isoTilePath);
						}
						break;
					case Terrain.FOREST:
						this.ctx.fillStyle = "darkgreen";
						this.ctx.fill(this.isoTilePath);
						break;
					case Terrain.MOUNTAINS:
						if (this.mountains.complete)
							this.ctx.drawImage(this.mountains, 0, 0, this.grasslands.width, this.grasslands.height, -ts, 0, ts*2, ts);
						else
						{
							this.ctx.fillStyle = "gray";
							this.ctx.fill(this.isoTilePath);
						}
						break;
					case Terrain.WATER:
						this.ctx.fillStyle = "blue";
						this.ctx.fill(this.isoTilePath);
						break;
					default:
						this.ctx.fillStyle = "red";
						this.ctx.fill(this.isoTilePath);
						break;
				}
				this.ctx.restore();
			}
		}
	
		// Draw cities
		gameState.cities.forEach(city => {
			const offset = this.gridToScreenCoords(city.position());
			this.ctx.save();
			this.ctx.fillStyle = 'yellow';
			this.ctx.translate(offset.x, offset.y);
			this.ctx.fill(this.isoTilePath);
			//this.ctx.fillRect(city.col * ts, city.row * ts, ts, ts);
			this.ctx.fillStyle = city.player.color;
			this.ctx.fillRect(-ts/2, 0, ts, ownerBarHeight);
			this.drawTextCenteredOn(''+city.player.id, 12, "black", 0, 4);
			this.ctx.restore();
		});

		// Draw soldiers
		gameState.soldiers.forEach(soldier => {
			const offset = this.gridToScreenCoords(soldier.position());
			this.ctx.fillStyle = 'black';
			this.ctx.fillRect(offset.x - ts/4, offset.y + hts/2, hts, hts);
			this.ctx.fillStyle = soldier.player.color;
			this.ctx.fillRect(offset.x - ts/4, offset.y + hts/2, hts, ownerBarHeight);
			this.drawTextCenteredOn(''+soldier.player.id, 12, "white", offset.x, offset.y + ts/2)
			soldier.update(gameState.currentTurn, gameState.currentTime);
		});

		// Draw Soldier paths
		gameState.soldiers.forEach(soldier => {
			if (soldier.path == null)
				return;
			let last = null;
			for (const step of soldier.path)
			{
				const p = this.gridToScreenCoords(step);
				this.ctx.beginPath();
				this.ctx.arc(p.x, p.y + hts, 5, 0, Math.PI * 2);
				this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
				this.ctx.fill();
				if (last != null)
				{
					this.ctx.beginPath();
					this.ctx.lineWidth = 1;
					this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
					this.ctx.moveTo(last.x, last.y + hts);
					this.ctx.lineTo(p.x, p.y + hts)
					this.ctx.stroke();
				}
				last = p;
			}
		});

		if (gameState.selection)
			this.drawSelection(gameState.selection, ts);

		this.ctx.resetTransform();
	}

	screenToGridCoords(x: number, y: number): Point2d
	{	
		return this.camera.screenToGridCoords(x, y);
	}

	gridToScreenCoords(coords: Point2d): Point2d
	{
		return this.camera.gridToScreenCoords(coords);
	}
}

function drawTextCenteredOn(ctx: CanvasRenderingContext2D, text: string, fontSize: number, color: string, x: number, y: number)
{
	ctx.fillStyle = color;
	ctx.font = fontSize + 'px Arial';
	const width = ctx.measureText(text).width;
	ctx.fillText(text, x-(width/2), y+fontSize/2);
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