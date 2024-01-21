import { City } from "./City.js";
import { Entity, isArchetype } from "./Entity.js";
import { Point2d } from "./Point2d.js";
import { Tile, Terrain } from "./Tile.js";
import { Actionable } from "./components/Actionable.js";
import { Movement } from "./components/Movement.js";
import { Named } from "./components/Named.js";
import { Position } from "./components/Position.js";
import { Renderable } from "./components/Renderable.js";
export class GameState {
    currentTime;
    currentTurn;
    map;
    numRows;
    numCols;
    entities;
    barbarianPlayer;
    humanPlayer;
    players;
    selection;
    gameover = false;
    constructor(currentTime, currentTurn, map, numRows, numCols, entities, barbarianPlayer, humanPlayer, players, selection) {
        this.currentTime = currentTime;
        this.currentTurn = currentTurn;
        this.map = map;
        this.numRows = numRows;
        this.numCols = numCols;
        this.entities = entities;
        this.barbarianPlayer = barbarianPlayer;
        this.humanPlayer = humanPlayer;
        this.players = players;
        this.selection = selection;
    }
    inBounds(coords) {
        return !(coords.x < 0 || coords.x >= this.numCols || coords.y < 0 || coords.y >= this.numRows);
    }
    checkWinner() {
        const winner = this.entities.find(e => e.city && e.player != this.barbarianPlayer)?.player ?? null;
        if (this.entities.some(e => e.city && e.player != winner && e.player != this.barbarianPlayer))
            return null;
        return winner;
    }
    cleanupDefeatedPlayers() {
        const playersAlive = this.entities.reduce((r, c) => {
            if (c.city && c.player && !r.includes(c.player))
                r.push(c.player);
            return r;
        }, []);
        for (let i = 0; i < this.entities.length; i++) {
            const e = this.entities[i];
            if (e.player && !playersAlive.includes(e.player))
                this.entities.splice(i, 1);
        }
    }
    // Function to generate random cities
    generateRandomCities() {
        const cities = []; //this.entities.filter((e: Entity): e is Archetype<['position', 'player', 'movement', 'city']> => isArchetype(e, 'position', 'player', 'movement', 'city'))
        while (cities.length < this.players.length) {
            for (let row = 0; row < this.numRows; row++) {
                for (let col = 0; col < this.numCols; col++) {
                    const rand = Math.random();
                    let terrain = Terrain.GRASSLAND;
                    if (rand < 0.55)
                        terrain = Terrain.GRASSLAND;
                    else if (rand < 0.85)
                        terrain = Terrain.FOREST;
                    else if (rand < 0.95)
                        terrain = Terrain.MOUNTAINS;
                    else
                        terrain = Terrain.WATER;
                    this.map[row * this.numRows + col] = new Tile(terrain);
                    if (Math.random() < 0.1) {
                        if (cities.some(city => Math.abs(city.position.position.x - col) < 3 && Math.abs(city.position.position.y - row) < 3))
                            continue;
                        this.map[row * this.numRows + col].terrain = Terrain.GRASSLAND; // make sure city is on a traversible ground
                        cities.push(new Entity(Entity.newId(), this.barbarianPlayer, new Position(new Point2d(col, row)), new Actionable(1, 1), undefined, new Movement(null, null, 0, true), new Renderable('city', 'yellow', null), undefined, new Named(City.name()), undefined, new City()));
                    }
                }
            }
        }
        for (const player of this.players) {
            if (player == this.barbarianPlayer)
                continue;
            let index = Math.floor(Math.random() * cities.length), i = (index + 1) % cities.length;
            for (; i != index; i = (i + 1) % cities.length) {
                if (cities[i].player == this.barbarianPlayer)
                    break;
                if (i == index)
                    throw new Error("Not enough cities");
            }
            cities[i].player = player;
        }
        cities.forEach(c => this.entities.push(c));
    }
    search(coords, ...keys) {
        const result = [];
        for (const e of this.entities)
            if (isArchetype(e, ...keys) && e.position && Point2d.equivalent(coords, e.position.position))
                result.push(e);
        return result;
    }
    tileAtPoint(coords) {
        return this.tileAtCoords(coords.x, coords.y);
    }
    tileAtCoords(x, y) {
        return this.map[y * this.numRows + x];
    }
    findNearestEnemyTarget(player, origin, exclude) {
        let nearest = null, dist = 0;
        for (const e of this.entities) {
            if (!isEnemyArchetype(e) /*|| !(e.city || e.soldier)*/ || e.player == player || exclude.includes(e))
                continue;
            const stepsTo = origin.stepsTo(e.position.position);
            if (nearest == null || stepsTo < dist) {
                nearest = e;
                dist = stepsTo;
            }
        }
        return nearest;
    }
    findEnemiesInRange(player, origin, range, ...withComponents) {
        const result = [];
        for (const e of this.entities)
            if (isEnemyArchetype(e) && isArchetype(e, ...withComponents) /*&& (e.city || e.soldier)*/ && e.player != player && origin.stepsTo(e.position.position) <= range)
                result.push(e);
        return result;
    }
}
export const EnemyArchetypeComponents = ['player', 'position'];
function isEnemyArchetype(e) {
    return isArchetype(e, 'player', 'position');
}
