import { Point2d } from "./Point2d.js";
import { Terrain } from "./Tile.js";
class Node {
    pos;
    scoreTo;
    scoreFrom;
    cameFrom;
    constructor(pos, scoreTo, scoreFrom, cameFrom) {
        this.pos = pos;
        this.scoreTo = scoreTo;
        this.scoreFrom = scoreFrom;
        this.cameFrom = cameFrom;
    }
    toString() {
        return `${this.pos}:${this.scoreTo}:${this.scoreFrom}`;
    }
}
export function navigateNear(gameState, start, goal) {
    const path = aStar(gameState, start, goal);
    if (path == null)
        return path;
    let i = path.length - 1;
    for (; i >= 0 && gameState.search(path[i], 'soldier').length > 0; i--)
        ;
    return path.slice(0, i + 1);
}
/**
 *
 * @param gameState
 * @param start
 * @param goal
 * @param stepsRequested The maximum number of steps to return. Must be positive.
 * @returns the path, in order of nodes from start to goal, excluding start, including goal; null if no path possible
 */
export function aStar(gameState, start, goal, stepsRequested) {
    if (stepsRequested ?? 1 < 1)
        throw new Error("stepsRequested must be positive");
    // The set of nodes already evaluated
    const visited = []; // visited
    // The set of currently discovered nodes still to be evaluated
    const openSet = [new Node(start, 0, 0, null)];
    while (openSet.length > 0) {
        // the node in openSet having the lowest fScore value
        const current = openSet.shift();
        if (!current)
            continue;
        if (Point2d.equivalent(current.pos, goal))
            return reconstruct_path(visited, current, stepsRequested);
        visited.push(current);
        for (const neighbor of neighbors(gameState, current)) {
            if (visited.some(n => Point2d.equivalent(n.pos, neighbor)))
                continue; // Ignore the neighbor which is already evaluated
            if (!Point2d.equivalent(goal, neighbor) && gameState.search(neighbor).length > 0)
                continue; // Ignore currently occupied neighbors unless it's the goal
            // The distance from start to a neighbor
            const tentative_gScore = current.scoreTo + distance_heuristic(current.pos, neighbor);
            let node = openSet.find(n => Point2d.equivalent(n.pos, neighbor));
            if (node == undefined) // Discover a new node
             {
                node = new Node(neighbor, 0, 0, null);
                openSet.push(node);
            }
            else if (tentative_gScore >= node.scoreTo)
                continue; // This is not a better path
            // This path is the best until now. Record it!
            node.cameFrom = current;
            node.scoreTo = tentative_gScore;
            node.scoreFrom = tentative_gScore + distance_heuristic(neighbor, goal);
            openSet.sort((a, b) => a.scoreFrom - b.scoreFrom);
        }
    }
    console.log(`No Path from ${start} to ${goal}`);
    return []; // No path was found
}
const sqrt2 = 1; //Math.sqrt(2);
function distance_heuristic(origin, target) {
    const dx = Math.abs(target.x - origin.x), dy = Math.abs(target.y - origin.y);
    return Math.max(dx, dy) + sqrt2 * Math.min(dx, dy);
}
function neighbors(gameState, node) {
    const result = [];
    for (let x = Math.max(0, node.pos.x - 1); x <= Math.min(gameState.numCols - 1, node.pos.x + 1); x++) {
        for (let y = Math.max(0, node.pos.y - 1); y <= Math.min(gameState.numRows - 1, node.pos.y + 1); y++) {
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
function reconstruct_path(visited, current, stepsRequested) {
    const total_path = [current.pos];
    //console.log(`Reconstructing path: ${total_path}`);
    while (current.cameFrom != null) {
        current = current.cameFrom;
        total_path.push(current.pos);
        //console.log(`Reconstructing path: ${total_path}`);
    }
    if (stepsRequested)
        return total_path.reverse().slice(0, stepsRequested);
    else
        return total_path.reverse();
}
