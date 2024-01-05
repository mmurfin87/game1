import { isArchetype } from "./Entity.js";
import { Point2d } from "./Point2d.js";
import { Terrain } from "./Tile.js";
import { MoveAnimation } from "./animations/MoveAnimation.js";
function loadimage(url) {
    const tmp = new Image();
    tmp.src = url;
    return tmp;
}
let testAnimation = new MoveAnimation(0, 500, new Point2d(0, 0), new Point2d(1, 1));
export class SimpleDebugObject {
    coords;
    width;
    height;
    text;
    constructor(coords, width, height, text = null) {
        this.coords = coords;
        this.width = width;
        this.height = height;
        this.text = text;
    }
    render(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.coords.x, this.coords.y, this.width, this.height);
        if (this.text != null)
            drawTextCenteredOn(ctx, this.text, this.height, 'black', this.coords.x, this.coords.y);
    }
}
export class LineDebugObject {
    origin;
    target;
    thickness;
    constructor(origin, target, thickness) {
        this.origin = origin;
        this.target = target;
        this.thickness = thickness;
    }
    render(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.origin.x, this.origin.y);
        ctx.lineTo(this.target.x, this.target.y);
        ctx.closePath();
        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = 'red';
        ctx.stroke();
    }
}
export class Renderer {
    camera;
    canvas;
    ctx;
    actions;
    unitActions;
    nextTurn;
    tileSize;
    debug = [];
    renderables = [];
    isoTilePath;
    terrainImage = new Map();
    grasslands = loadimage("/isograss.png");
    forest = loadimage("/isoforest.png");
    mountains = loadimage("/isomountain.png");
    water = loadimage("/isowater.png");
    soldier = loadimage("/soldier.png");
    city = loadimage("/city.png");
    finalRenderImage = null;
    constructor(camera, canvas, ctx, actions, unitActions, nextTurn, tileSize) {
        this.camera = camera;
        this.canvas = canvas;
        this.ctx = ctx;
        this.actions = actions;
        this.unitActions = unitActions;
        this.nextTurn = nextTurn;
        this.tileSize = tileSize;
        const ox = 0, oy = 0;
        this.isoTilePath = new Path2D();
        this.isoTilePath.moveTo(ox, oy);
        this.isoTilePath.lineTo(ox + tileSize, oy + tileSize / 2);
        this.isoTilePath.lineTo(ox, oy + tileSize);
        this.isoTilePath.lineTo(ox - tileSize, oy + tileSize / 2);
        this.isoTilePath.closePath();
        this.terrainImage = new Map();
        this.terrainImage.set(Terrain.GRASSLAND, { color: 'green', image: this.grasslands });
        this.terrainImage.set(Terrain.FOREST, { color: 'darkgreen', image: this.forest });
        this.terrainImage.set(Terrain.MOUNTAINS, { color: 'gray', image: this.mountains });
        this.terrainImage.set(Terrain.WATER, { color: 'blue', image: this.water });
    }
    renderVictory() {
        this.ctx.putImageData(this.finalRenderImage, 0, 0);
        // Draw victory text
        this.drawTextCenteredOn("Victory!", 48, 'black', this.canvas.width / 2, this.canvas.height / 2);
        this.renderFireworks();
    }
    renderDefeat() {
        this.ctx.putImageData(this.finalRenderImage, 0, 0);
        // Draw victory text
        this.drawTextCenteredOn("Defeat", 48, 'black', this.canvas.width / 2, this.canvas.height / 2);
    }
    renderFireworks() {
        let spliceAfter = fireworks.length;
        // Update and draw each firework particle
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].draw(this.ctx);
            if (fireworks[i].update()) // update returns true if the firework is expended
             {
                fireworks[i--] = fireworks[spliceAfter-- - 1];
                //fireworks.splice(i, 1);
            }
        }
        if (spliceAfter < fireworks.length)
            fireworks.splice(spliceAfter, fireworks.length - spliceAfter);
    }
    render(entities, gameState) {
        if (gameState.gameover) {
            const victory = gameState.checkWinner() == gameState.humanPlayer;
            if (this.finalRenderImage == null) {
                this.renderBoard(entities, gameState);
                this.finalRenderImage = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                if (victory)
                    setInterval(() => {
                        createRandomFirework(this.canvas.width, this.canvas.height);
                    }, 250); // Adjust the interval as needed
            }
            if (victory)
                this.renderVictory();
            else
                this.renderDefeat();
        }
        else
            this.renderBoard(entities, gameState);
        this.debug.forEach(d => d.render(this.ctx));
    }
    drawTextCenteredOn(text, fontSize, color, x, y) {
        drawTextCenteredOn(this.ctx, text, fontSize, color, x, y);
    }
    // Function to draw the red circle around the selected city
    drawSelection(screenOrigin, radius) {
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(screenOrigin.x, screenOrigin.y + this.tileSize / 2, radius, //this.tileSize / (selected.type == "City" ? 2 : 3) + 2, // Adjust the radius to your liking
        0, Math.PI * 2);
        this.ctx.stroke();
    }
    renderBoard(entities, gameState) {
        const vw = this.canvas.width, hvw = vw / 2;
        const ts = this.tileSize;
        const hts = ts / 2, qts = hts / 2;
        const ownerBarOffset = Math.round(ts - 13), ownerBarHeight = ts - ownerBarOffset;
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.scale(this.camera.scale, this.camera.scale);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        // Draw terrain
        for (let r = 0; r < gameState.numRows; r++) {
            for (let c = 0; c < gameState.numCols; c++) {
                const offset = this.gridToScreenCoords(new Point2d(c, r));
                this.ctx.save();
                this.ctx.translate(offset.x, offset.y);
                const renderable = this.terrainImage.get(gameState.tileAtCoords(c, r).terrain);
                if (renderable?.image.complete)
                    this.ctx.drawImage(renderable.image, 0, 0, renderable.image.width, renderable.image.height, -ts, 0, ts * 2, ts);
                else {
                    this.ctx.fillStyle = renderable?.color ?? 'red';
                    this.ctx.fill(this.isoTilePath);
                }
                this.ctx.restore();
            }
        }
        /*
        // Draw cities
        gameState.cities.forEach(city => {
            const offset = this.gridToScreenCoords(city.locate());
            this.ctx.save();
            this.ctx.translate(offset.x, offset.y);
            if (this.city.complete)
                this.ctx.drawImage(this.city, 0, 0, this.city.width, this.city.height, -ts, 0, ts*2, ts);
            else
            {
                this.ctx.fillStyle = 'yellow';
                this.ctx.fill(this.isoTilePath);
            }
            this.drawColorTextBox(new Point2d(-ts/2, ts), ts, ownerBarHeight, city.player.color, 12, 'black', ''+city.healthLeft);
            if (city == gameState.selection)
                this.drawSelection(Point2d.origin(), ts/2);
            this.ctx.restore();
        });

        /*
        // Draw soldiers
        gameState.soldiers.forEach(soldier => {
            let offset = this.gridToScreenCoords(soldier.locate());
            let dest = soldier.destination();
            let dv: Point2d;
            if (dest)
            {
                dest = this.gridToScreenCoords(dest);
                let scale = soldier.moveCompletionPercent(gameState.currentTime);
                let dist = offset.distanceTo(dest);
                dv = dest
                    .subtract(offset)
                    .scale(scale);
                offset.x += dv.x;
                offset.y += dv.y;
            }
            else
                dv = Point2d.origin();

            if (this.soldier.complete)
                this.ctx.drawImage(this.soldier, 0, 0, this.soldier.width, this.soldier.height, offset.x-ts, offset.y-hts/2, ts*2, ts);
            else
            {
                this.ctx.fillStyle = 'black';
                this.ctx.fillRect(offset.x - ts/4, offset.y + hts/2, hts, hts);
            }
            this.drawColorTextBox(new Point2d(offset.x, offset.y - hts), hts, ownerBarHeight, soldier.player.color, 12, 'white', ''+soldier.healthLeft);
            if (soldier == gameState.selection)
                this.drawSelection(offset, this.tileSize / 3);
        });
        */
        entities.forEach(e => {
            if (!isArchetype(e, 'player', 'position', 'renderable'))
                return;
            const r = e.renderable;
            let offset = e.position.position;
            if (e.movement && e.movement.path && e.movement.path.length > 1 && e.movement.stepStart && !r.animation)
                r.animation = new MoveAnimation(e.movement.stepStart, e.movement.stepDuration, e.movement.path[0], e.movement.path[1]);
            if (r.animation) {
                const step = r.animation.evaluateAnimationStep(gameState.currentTime, this.camera);
                offset = step.position;
                if (step.complete)
                    r.animation = null;
            }
            offset = this.gridToScreenCoords(offset);
            const image = this.imageFor(r.image);
            if (image.complete)
                this.ctx.drawImage(image, 0, 0, image.width, image.height, offset.x - ts, offset.y + (e.soldier ? -hts / 2 : 0), ts * 2, ts);
            else {
                this.ctx.fillStyle = r.color;
                this.ctx.fillRect(offset.x - ts / 4, offset.y + hts / 2, hts, hts);
            }
            if (e.name)
                this.drawColorTextBox(new Point2d(offset.x - ts / 2, offset.y + ts), ts, ownerBarHeight, e.player.color, 12, 'black', e.name.name);
            if (e.health)
                this.drawColorTextBox(new Point2d(offset.x, offset.y - hts), hts, ownerBarHeight, e.player.color, 12, 'white', '' + (e.health.remaining));
            //if (soldier == gameState.selection)
            //	this.drawSelection(offset, this.tileSize / 3);
            //soldier.update(gameState);
        });
        // Draw Movement paths
        entities.forEach(entity => {
            if (entity.movement?.path == null)
                return;
            let last = null;
            for (const step of entity.movement.path) {
                const p = this.gridToScreenCoords(step);
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y + hts, 5, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                this.ctx.fill();
                if (last != null) {
                    this.ctx.beginPath();
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                    this.ctx.moveTo(last.x, last.y + hts);
                    this.ctx.lineTo(p.x, p.y + hts);
                    this.ctx.stroke();
                }
                last = p;
            }
        });
        if (gameState.selection && gameState.selection.position && (gameState.selection.city || gameState.selection.soldier))
            this.drawSelection(this.camera.gridToScreenCoords(gameState.selection.position.position), this.tileSize / (gameState.selection.city ? 2 : 3));
        ////////////////////
        // Test Animation //
        ////////////////////
        /*
        if (testAnimation.startTime + testAnimation.duration < gameState.currentTime)
            testAnimation = new MoveAnimation(gameState.currentTime, 500, testAnimation.origin, testAnimation.target);
        let offset = this.camera.gridToScreenCoords(testAnimation.evaluateAnimationStep(gameState.currentTime, this.camera).position);
        
        if (this.soldier.complete)
            this.ctx.drawImage(this.soldier, 0, 0, this.soldier.width, this.soldier.height, offset.x-ts, offset.y-hts/2, ts*2, ts);
        else
        {
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(offset.x - ts/4, offset.y + hts/2, hts, hts);
        }
        */
        this.ctx.resetTransform();
    }
    imageFor(key) {
        switch (key) {
            case "soldier": return this.soldier;
            case "city": return this.city;
            case "grassland": return this.grasslands;
            case "forest": return this.forest;
            case "mountains": return this.mountains;
            case "water": return this.water;
        }
    }
    screenToGridCoords(x, y) {
        return this.camera.screenToGridCoords(x, y);
    }
    gridToScreenCoords(coords) {
        return this.camera.gridToScreenCoords(coords);
    }
    drawColorTextBox(origin, width, height, boxColor, fontSize, fontColor, text) {
        this.ctx.font = fontSize + 'px Arial';
        const metrics = this.ctx.measureText(text);
        width = width < metrics.width ? metrics.width + 2 : width;
        this.ctx.fillStyle = boxColor;
        this.ctx.fillRect(origin.x, origin.y, width, height);
        this.ctx.fillStyle = fontColor;
        const actualHeight = metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent, diffHeight = height - actualHeight, offsetHeight = diffHeight / 2;
        this.ctx.fillText(text, origin.x + width / 2 - (metrics.width / 2), origin.y + actualHeight + offsetHeight);
    }
}
function drawTextCenteredOn(ctx, text, fontSize, color, x, y) {
    ctx.fillStyle = color;
    ctx.font = fontSize + 'px Arial';
    const metrics = ctx.measureText(text);
    const actualHeight = metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent;
    ctx.fillText(text, x - (metrics.width / 2), y + actualHeight); //+fontSize/2);
}
// Function to generate a random number within a range
function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}
// Firework particle class
class FireworkParticle {
    x;
    y;
    vx;
    vy;
    radius;
    color;
    constructor(x, y, vx, vy, radius, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
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
const fireworks = [];
// Function to create a firework at a specified position
function createFirework(x, y) {
    x = Math.round(x);
    y = Math.round(y);
    console.log(`Creating firework at ${x}, ${y}`);
    const particleCount = 100;
    const color = `hsl(${getRandomInRange(0, 360)}, 100%, 50%)`;
    for (let i = 0; i < particleCount && fireworks.length < 500; i++) {
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
function createRandomFirework(width, height) {
    const x = getRandomInRange(0, width);
    const y = getRandomInRange(0, height); // Start from the bottom of the canvas
    createFirework(x, y);
}
