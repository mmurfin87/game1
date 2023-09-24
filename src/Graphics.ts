// Game loop
function gameLoop(currentTime: number) {
	
	if (!lastTime)
		lastTime = currentTime;
	const deltaTime = currentTime - lastTime;

	// Clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw terrain
	for (let r = 0; r < numRows; r++)
	{
		for (let c = 0; c < numCols; c++)
		{
			switch (map[r * numRows + c].terrain)
			{
				case Terrain.GRASSLAND:	ctx.fillStyle = "green";	break;
				case Terrain.FOREST:	ctx.fillStyle = "darkgreen";break;
				case Terrain.MOUNTAINS:	ctx.fillStyle = "gray";		break;
				case Terrain.WATER:		ctx.fillStyle = "blue";		break;
				default:				ctx.fillStyle = "red";		break;
			}
			ctx.fillRect(c*tileSize, r*tileSize, tileSize, tileSize);
		}
	}

	// Draw cities
	cities.forEach(city => {
		ctx.fillStyle = 'yellow';
		ctx.fillRect(city.col * tileSize, city.row * tileSize, tileSize, tileSize);
		drawTextCenteredOn(''+city.player.id, 12, "black", city.col*tileSize+tileSize/2, city.row*tileSize+tileSize/2);
	});

	// Draw soldiers
	soldiers.forEach(soldier => {
		ctx.fillStyle = 'black';
		ctx.fillRect(soldier.col * tileSize, soldier.row * tileSize, tileSize, tileSize);
		drawTextCenteredOn(''+soldier.player.id, 12, "white", soldier.col*tileSize+tileSize/2, soldier.row*tileSize+tileSize/2)
		soldier.update(currentTime);
	});

	if (selection)
		drawSelection(selection);

	lastTime = currentTime;
	requestAnimationFrame(gameLoop);
}

function drawTextCenteredOn(text: string, fontSize: number, color: string, x: number, y: number)
{
	ctx.fillStyle = color;
	ctx.font = fontSize + 'px Arial';
	const width = ctx.measureText(text).width;
	ctx.fillText(text, x-(width/2), y-fontSize/2);
}

// Function to draw the red circle around the selected city
function drawSelection(position: Positioned)
{
	ctx.strokeStyle = 'red';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(
		position.col * tileSize + tileSize / 2,
		position.row * tileSize + tileSize / 2,
		tileSize / 2 + 2, // Adjust the radius to your liking
		0,
		Math.PI * 2
	);
	ctx.stroke();
}