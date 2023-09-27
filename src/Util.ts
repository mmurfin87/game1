interface Distance
{
	distance: number;
	unitX: number;
	unitY: number;
}

function distance(fromX: number, fromY: number, toX: number, toY: number): Distance
{
	const x = toX - fromX, y = toY - fromY;
	const distance = Math.sqrt(x * x + y * y);
	return { distance, unitX: x/distance, unitY: y/distance };
}