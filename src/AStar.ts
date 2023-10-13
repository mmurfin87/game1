import { GameState } from "./GameState.js";
import { Point2d } from "./Point2d.js";
import { Terrain } from "./Tile.js";

class Node
{
	constructor(
		public pos: Point2d,
		public scoreTo: number,
		public scoreFrom: number,
		public cameFrom: Node | null
	)
	{}

	toString(): string
	{
		return `${this.pos}:${this.scoreTo}:${this.scoreFrom}`;
	}
}

export function aStar(gameState: GameState, start: Point2d, goal: Point2d): Point2d[]
{
	// The set of nodes already evaluated
	const visited: Node[] = [];	// visited

	// The set of currently discovered nodes still to be evaluated
	const openSet: Node[] = [ new Node(start, 0, 0, null) ];

	while (openSet.length > 0)
	{
		// the node in openSet having the lowest fScore value
		const current =  openSet.shift();
		if (!current)
			continue;

		console.log(`Examining ${current}`);

		if (Point2d.equivalent(current.pos, goal))
			return reconstruct_path(visited, current);

		visited.push(current);

		for (const neighbor of neighbors(gameState, current))
		{
			if (visited.some(n => Point2d.equivalent(n.pos, neighbor)))
				continue;  // Ignore the neighbor which is already evaluated

			// The distance from start to a neighbor
			const tentative_gScore = current.scoreTo + current.pos.stepsTo(neighbor);

			let node = openSet.find(n => Point2d.equivalent(n.pos, neighbor));
			if (node == undefined)  // Discover a new node
			{
				node = new Node(neighbor, 0, 0, null);
				console.log(`Pushing ${neighbor}:${tentative_gScore} to ${openSet} | ${visited}`);
				openSet.push(node);
			}
			else if (tentative_gScore >= node.scoreTo)
				continue;  // This is not a better path

			// This path is the best until now. Record it!
			node.cameFrom = current;
			node.scoreTo = tentative_gScore;
			node.scoreFrom = tentative_gScore + neighbor.stepsTo(goal);
			openSet.sort((a,b) => a.scoreFrom - b.scoreFrom);
		}
	}
	console.log(`No Path from ${start} to ${goal}`);
	return []  // No path was found
}

function neighbors(gameState: GameState, node: Node): Point2d[]
{
	const result: Point2d[] = [];
	for (let x = Math.max(0, node.pos.x - 1); x <= Math.min(gameState.numCols - 1, node.pos.x + 1); x++)
	{
		for (let y = Math.max(0, node.pos.y - 1); y <= Math.min(gameState.numRows - 1, node.pos.y + 1); y++)
		{
			if (x == node.pos.x && y == node.pos.y)
				continue;
			const terrain = gameState.tileAtCoords(x, y).terrain;
			if (terrain == Terrain.MOUNTAINS || terrain == Terrain.WATER)
				continue;
			result.push(new Point2d(x, y));
		}
	}
	return result;
}

function reconstruct_path(visited: Node[], current: Node)
{
	const total_path: Point2d[] = [ current.pos ];
	console.log(`Reconstructing path: ${total_path}`);
	while (current.cameFrom != null)
	{
		current = current.cameFrom;
		total_path.push(current.pos);
		console.log(`Reconstructing path: ${total_path}`);
	}
	return total_path.reverse();
}