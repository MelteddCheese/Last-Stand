const canvas = document.getElementById('gameCanvas');
const inventoryCanvas = document.getElementById('inventory');
const inventoryCtx = inventoryCanvas.getContext('2d');
const gameAreaCtx = canvas.getContext('2d');

// const explosionBullet = document.querySelector(".explosionBullet");
const ctx = canvas.getContext('2d');
const gravity = 0.2;
let groundLevel = canvas.height - 30;
let platforms = [];
let traps = [];
let MinesPlaced = [];

const blockSize = 80;
let blocks = [];
let blanks = [];
const blankWidth = 50;
const blankHeight = 10;
const minesHeight = 30;
const minesWidth = 30;
let draggingBlock = null;
let draggingBlank = null;
let draggingBomb = null;
var setupBlocks = [];
var setupBlanks = [];
var setupBombs = [];
let offsetX = 0;
let offsetY = 0;

for (let i = 0; i < 4; i++) {
    blocks.push({
        x: 10,
        y: i * (blockSize + 10) + 30,
        width: blockSize,
        height: blockSize,
        color: 'red'
    });
}

for (let i = 0; i < 2; i++) {
    blanks.push({
        x: 120,
        y: (i) * (blockSize + 10) + 50,
        width: blankWidth,
        height: blankHeight,
        color: 'rgb(36,20,20)'
    })
}

let mines = [{ image: bomb, x: 200, y: 70, width: 30, height: 30 },];

function drawInventory() {
    inventoryCtx.clearRect(0, 0, inventoryCanvas.width, inventoryCanvas.height);
    blocks.forEach(block => {
        // inventoryCtx.fillStyle = block.color;
        // inventoryCtx.fillRect(block.x, block.y, block.width, block.height);
        inventoryCtx.drawImage(obs, block.x, block.y, block.width, block.height);
    });
    blanks.forEach(blank => {
        inventoryCtx.fillStyle = 'rgb(36,20,20)';
        inventoryCtx.fillRect(blank.x, blank.y, blank.width, blank.height);
        inventoryCtx.strokeStyle = 'white';
        inventoryCtx.beginPath();
        inventoryCtx.rect(blank.x, blank.y, blank.width, blank.height);
        inventoryCtx.stroke();
        console.log("done");
    })
    if (MinesPlaced.length == 0) {
        inventoryCtx.drawImage(bomb, mines[0].x, mines[0].y, 30, 30);
    }
}

function drawGameArea() {
    gameAreaCtx.clearRect(0, 0, canvas.width, canvas.height);
    gameAreaCtx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    setupBlocks.forEach(Block => {
        // gameAreaCtx.fillStyle = Block.color;
        // gameAreaCtx.fillRect(Block.x, Block.y, Block.width, Block.height);
        gameAreaCtx.drawImage(obs, Block.x, Block.y, Block.width, Block.height);
    })
    setupBlanks.forEach(Blank => {
        gameAreaCtx.fillStyle = Blank.color;
        gameAreaCtx.fillRect(Blank.x, Blank.y, Blank.width, Blank.height);
        gameAreaCtx.strokeStyle = 'white';
        gameAreaCtx.beginPath();
        gameAreaCtx.rect(Blank.x, Blank.y, Blank.width, Blank.height);
        gameAreaCtx.stroke();
    })
    setupBombs.forEach(Bomb => {
        gameAreaCtx.drawImage(bomb, Bomb.x, Bomb.y, minesWidth, minesHeight);
        console.log("drawn?");
    })
}

inventoryCanvas.addEventListener('mousedown', (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    for (let block of blocks) {
        if (mouseX > block.x && mouseX < block.x + block.width && mouseY > block.y && mouseY < block.y + block.height) {
            draggingBlock = { ...block, x: mouseX, y: mouseY };
            offsetX = mouseX - block.x;
            offsetY = mouseY - block.y;
            setupBlocks.push(draggingBlock);
            break;
        }
    }
    for (let blank of blanks) {
        if (mouseX > blank.x && mouseX < blank.x + blank.width && mouseY > blank.y && mouseY < blank.y + blank.height) {
            draggingBlank = { ...blank, x: mouseX, y: mouseY };
            offsetX = mouseX - blank.x;
            offsetY = mouseY - blank.y;
            setupBlanks.push(draggingBlank);
            break;
        }
    }
    for (let mine of mines) {
        if (mouseX > mine.x && mouseX < mine.x + mine.width && mouseY > mine.y && mouseY < mine.y + mine.height) {
            draggingBomb = { ...mine, x: mouseX, y: mouseY };
            console.log(draggingBomb.x, draggingBomb.y);
            console.log(mouseX, mouseY);
            offsetX = mouseX - mine.x;
            offsetY = mouseY - mine.y;
            setupBombs.push(draggingBomb);
            //console.log(setupBombs);
            break;
        }
    }
});

document.addEventListener('mousemove', (e) => {
    if (draggingBlock) {
        const canvasRect = canvas.getBoundingClientRect();
        draggingBlock.x = e.clientX - canvasRect.left - offsetX;
        draggingBlock.y = e.clientY - canvasRect.top - offsetY;
        drawGameArea();
    }
    if (draggingBlank) {
        const canvasRect = canvas.getBoundingClientRect();
        draggingBlank.x = e.clientX - canvasRect.left - offsetX;
        draggingBlank.y = e.clientY - canvasRect.top - offsetY;
        drawGameArea();
    }
    if (draggingBomb) {
        const canvasRect = canvas.getBoundingClientRect();
        draggingBomb.x = e.clientX - canvasRect.left - offsetX;
        draggingBomb.y = e.clientY - canvasRect.top - offsetY;
        drawGameArea();
    }
});

document.addEventListener('mouseup', (e) => {
    if (draggingBlock) {
        // Drop the block in the game area
        const canvasRect = canvas.getBoundingClientRect();
        draggingBlock.x = e.clientX - canvasRect.left - offsetX;
        draggingBlock.y = e.clientY - canvasRect.top - offsetY;

        draggingBlock.x = Math.max(0, Math.min(draggingBlock.x, canvas.width - blockSize));
        const groundHeight = groundLevel - blockSize;
        const upperHeight = groundLevel - 2 * blockSize;

        let blockAtGround = setupBlocks.some(block => block.y === groundHeight &&
            ((block.x >= draggingBlock.x && draggingBlock.x + blockSize >= block.x) ||
                (block.x <= draggingBlock.x && block.x + blockSize >= draggingBlock.x))
        );

        let wrongPosition = setupBlocks.some(block => block.y === upperHeight &&
            ((block.x >= draggingBlock.x && draggingBlock.x + blockSize >= block.x) ||
                (block.x <= draggingBlock.x && block.x + blockSize >= draggingBlock.x))
        );

        if (blockAtGround) {
            draggingBlock.y = upperHeight;
        } else {
            draggingBlock.y = groundHeight;
        }

        // Ensure there's no block in the wrong position
        if (!wrongPosition) {
            setupBlocks[setupBlocks.length - 1].x = draggingBlock.x;
            setupBlocks[setupBlocks.length - 1].y = draggingBlock.y;
            platforms.push(new Platform(draggingBlock.x, draggingBlock.y));
            blocks.splice(blocks.length - 1, 1);
            if (platforms.length == 4 && traps.length == 2 && setupBombs.length > 0) {
                nameInputContainer.style.display = 'block';
                document.querySelector(".container").style.visibility = 'visible';
                document.getElementById("controls").style.visibility = 'visible';
                inventoryCanvas.style.display = 'none';
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                groundLevel = canvas.height - 30;
            }
        } else {
            setupBlocks.splice(setupBlocks.length - 1, 1);
        }

        drawGameArea();
        drawInventory();
        draggingBlock = null;
    }

    if (draggingBlank) {
        // Drop the blank in the game area
        const canvasRect = canvas.getBoundingClientRect();
        draggingBlank.x = e.clientX - canvasRect.left - offsetX;
        draggingBlank.y = e.clientY - canvasRect.top - offsetY;

        draggingBlank.x = Math.max(0, Math.min(draggingBlank.x, canvas.width - blankWidth));
        draggingBlank.y = groundLevel - blankHeight;

        setupBlanks[setupBlanks.length - 1].x = draggingBlank.x;
        setupBlanks[setupBlanks.length - 1].y = draggingBlank.y;
        blanks.splice(blanks.length - 1, 1);
        traps.push(new trap(draggingBlank.x, draggingBlank.y));
        if (traps.length == 2 && platforms.length == 4 && setupBombs.length > 0) {
            nameInputContainer.style.display = 'block';
            document.querySelector(".container").style.visibility = 'visible';
            document.getElementById("controls").style.visibility = 'visible';
            inventoryCanvas.style.display = 'none';
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            groundLevel = canvas.height - 30;
        }
        console.log(setupBlanks);
        drawInventory();
        drawGameArea();
        draggingBlank = null;
    }
    if (draggingBomb) {
        // Drop the Bomb in the game area
        const canvasRect = canvas.getBoundingClientRect();
        draggingBomb.x = e.clientX - canvasRect.left - offsetX;
        draggingBomb.y = e.clientY - canvasRect.top - offsetY;

        // Prevent Bombs from being placed outside the game area
        draggingBomb.x = Math.max(0, Math.min(draggingBomb.x, canvas.width - minesWidth));
        draggingBomb.y = groundLevel - minesHeight;
        console.log(draggingBomb.x, draggingBomb.y);

        setupBombs[setupBombs.length - 1].x = draggingBomb.x;
        setupBombs[setupBombs.length - 1].y = draggingBomb.y;
        // setupBombs[setupBombs.length - 1] = { ...draggingBomb };

        MinesPlaced.push(new Miness(draggingBomb.x, draggingBomb.y));
        console.log(MinesPlaced);
        if (platforms.length == 4 && setupBombs.length > 0 && traps.length == 2) {
            nameInputContainer.style.display = 'Block';
            document.querySelector(".container").style.visibility = 'visible';
            document.getElementById("controls").style.visibility = 'visible';
            inventoryCanvas.style.display = 'none';
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            groundLevel = canvas.height - 30;
        }
        draggingBomb = null;
        console.log(setupBombs);
        drawInventory();
        drawGameArea();
    }
});

let zombies = [];
let zombiesR = [];
let zombieSpeed = 0.5;//moves by 2 per loop
const zombieSize = 200;
let isPaused = true;
let score = 0;
let playerHistory = [];
var userName = '';

var zombieImage = new Image()
zombieImage.src = './Walk.png';
var zombieImageR = new Image()
zombieImageR.src = './walkR.png';
var zombieAttack = new Image();
zombieAttack.src = './Attack_1.png';
var zombieAttackR = new Image();
zombieAttackR.src = './AttackR.png';
var walkc = new Image();
walkc.src = './walkC.png';
var Rwalkc = new Image();
Rwalkc.src = './RwalkC.png';
var gun1 = new Image();
gun1.src = './gun11.png';
var gun2 = new Image();
gun2.src = './gun2.png';
var gun3 = new Image();
gun3.src = './gun3.png';
var IzombieImage = new Image()
IzombieImage.src = './ImmuneZombie.png';
var playerSR = new Image();
playerSR.src = './spriteStandRight.png';
var playerSL = new Image();
playerSL.src = './spriteStandLeft.png';
var playerRR = new Image();
playerRR.src = './spriteRunRight.png';
var playerRL = new Image();
playerRL.src = './spriteRunLeft.png';
var obs = new Image();
obs.src = './block.png';
var bomb = new Image();
bomb.src = './bomb.png';
var explosionBullet = new Image();
explosionBullet.src = './explosionBullet.png';

bomb.onload = () => {
    obs.onload = () => {
        drawInventory();
    }
};

function getPlatformWithMaxXAndMinY(platforms) {
    if (platforms.length === 0) {
        return null;
    }
    platforms.sort((a, b) => b.x - a.x);

    return platforms.reduce((bestPlatform, currentPlatform) => {
        if (Math.abs(currentPlatform.x - bestPlatform.x) <= blockSize && currentPlatform.y < bestPlatform.y) {
            return currentPlatform;
        }
        return bestPlatform;
    }, platforms[0]);
}

function getPlatformWithMinXAndMinY(platforms) {
    if (platforms.length === 0) {
        return null;
    }
    platforms.sort((a, b) => a.x - b.x);

    return platforms.reduce((bestPlatform, currentPlatform) => {
        if (Math.abs(currentPlatform.x - bestPlatform.x) <= blockSize && currentPlatform.y < bestPlatform.y) {
            return currentPlatform;
        }
        return bestPlatform;
    }, platforms[0]);
}

//powerups
let killed = 0;
let ImmuneZombies = [];
class ImmuneZombie {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.size = zombieSize;
        this.stopped = false;
        this.speed = speed;
        this.image = IzombieImage;
        this.attack = 0;
        this.isMoving = true;
        this.frozen = false;
        this.freezetimer = 100;
        this.timefrozen = 0;

        this.frameIndex = 0; // Start at the first frame
        this.frameCount = 7; // Total number of frames in the sprite sheet
        this.frameWidth = 96; // Width of each frame
        this.frameHeight = 96; // Height of each frame
    }

    draw() {
        if (Number.isInteger(this.frameIndex)) {
            var frameX = this.frameIndex * this.frameWidth;
        }
        else {
            var frameX = this.frameWidth * Math.floor(this.frameIndex);
        }
        ctx.drawImage(this.image, frameX, 0,
            this.frameWidth, this.frameHeight, this.x, this.y, this.size, this.size);
    }
    update() {
        if (this.frozen) {
            this.timefrozen++;
            if (this.timefrozen >= this.freezetimer) {
                this.frozen = false;
            }
        }
        if (!this.frozen) {
            this.checkCollisionWithPlayer();
            if (this.isMoving) {
                this.x += this.speed;
            }
            this.frameIndex += 0.25;
            if (this.frameIndex >= this.frameCount) {
                this.frameIndex = 0;
            }
            if (this.x > canvas.width) {
                this.x = -this.size;
                this.y = canvas.height - this.size;
            }
            if (this.attack >= 2) {
                console.log("lmk");
            }
        }
    }
    checkCollisionWithPlayer() {
        if (
            this.x + this.size > player.x &&
            this.x < player.x + player.width && player.y + player.height / 2 >= this.y
        ) {
            player.attack++;
            this.isMoving = false;
            //console.log("reached");
        }
        else {
            this.isMoving = true;
            //console.log("okayy");
        }
    }
}

let va = 0;

let devL = false;
class Zombie {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.size = zombieSize;
        this.stopped = false;
        this.speed = speed;
        this.image = zombieImage;
        this.frozen = false;
        this.freezetimer = 100;
        this.timefrozen = 0;

        this.frameIndex = 0; // Start at the first frame
        this.frameCount = 8; // Total number of frames in the sprite sheet
        this.frameWidth = 96; // Width of each frame
        this.frameHeight = 96; // Height of each frame
    }

    draw() {
        if (Number.isInteger(this.frameIndex)) {
            var frameX = this.frameIndex * this.frameWidth;
        }
        else {
            var frameX = this.frameWidth * Math.floor(this.frameIndex);
        }
        ctx.drawImage(this.image, frameX, 0,
            this.frameWidth, this.frameHeight, this.x, this.y, this.size, this.size);
    }
    update() {
        if (this.frozen) {
            this.timefrozen++;
            if (this.timefrozen >= this.freezetimer) {
                this.frozen = false;
            }
        }
        if (!this.frozen) {
            let i = 0;
            for (let j = 0; j < zombies.length; j++) {
                let zombie = zombies[j];
                if (zombie === this) {
                    if (j == 0 && this.stopped) {
                        i++;
                    }
                    break;
                }
                if (this.x < zombie.x + zombie.size && this.x + this.size > zombie.x) {
                    i++;
                }
            }

            let count = 0;
            platforms.forEach(platform => {
                if (platform.x < player.x) {
                    count++;
                }
            });
            if (count == 0 && !devL) {
                i = 0;
            }

            if (i > 0) {
                // Zombie should stop and attack
                this.image = zombieAttack;
                this.frameCount = 5;
                this.frameIndex += 0.25;
                if (this == zombies[0]) {
                    //console.log(this.image);
                    //console.log(this.frameIndex);

                }

                let canMove = true;
                // Only the first zombie interacts with the platforms
                if (this === zombies[0]) {
                    platforms.forEach(platform => {

                        if (!(this.x + this.size <= platform.x || this.x - this.size >= platform.x + platform.width) && !(this.y > platform.y + platform.height)) {
                            if (1 || platform === getPlatformWithMinXAndMinY(platforms)) {
                                getPlatformWithMinXAndMinY(platforms).contactTimer++;
                                canMove = false;
                            }
                        }
                    });
                }

                if (this.frameIndex >= this.frameCount) {
                    this.frameIndex = 0;
                }

                // Attack player if in range
                if (this.x + this.size >= player.x - player.width / 2 && this.x <= player.x + player.width / 2 && player.y + player.height / 2 >= this.y) {
                    player.attack++;
                    canMove = false;
                }

                if (canMove && this == zombies[0]) {
                    i = 0;
                }
            }
            if (i == 0) {
                // Zombie can move
                this.image = zombieImage;
                this.frameCount = 8;

                let canMove = true;
                if (platforms.length > 0) {
                    platforms.forEach(platform => {
                        if (!(this.x + this.size <= platform.x || this.x - this.size >= platform.x + platform.width)) {
                            canMove = false;
                        }
                    });
                }
                if (this.x + this.size >= player.x - player.width / 2 && this.x <= player.x + player.width / 2 && player.y + player.height / 2 >= this.y) {
                    canMove = false;
                    devL = true;
                    player.attack++;
                }

                if (canMove) {
                    this.stopped = false;
                    this.x += this.speed;
                    this.frameIndex += 0.25;

                    if (this.frameIndex >= this.frameCount) {
                        this.frameIndex = 0;
                    }
                } else {
                    this.stopped = true;
                }
            }

            if (this.x > canvas.width) {
                zombies.splice(zombies.indexOf(this), 1);
            }
        }
    }
}

let dev = false;
class ZombieR {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.size = zombieSize;
        this.stopped = false;
        this.speed = speed;
        this.image = zombieImageR;
        this.frozen = false;
        this.freezetimer = 100;
        this.timefrozen = 0;

        this.frameIndex = 0
            ; // Start at the first frame
        this.frameCount = 8; // Total number of frames in the sprite sheet
        this.frameWidth = 96; // Width of each frame
        this.frameHeight = 96; // Height of each frame
    }

    draw() {
        let frameX;
        if (Number.isInteger(this.frameIndex)) {
            frameX = this.frameIndex * this.frameWidth;
        }
        else {
            frameX = this.frameWidth * Math.floor(this.frameIndex);
        }
        ctx.drawImage(this.image, frameX, 0,
            this.frameWidth, this.frameHeight, this.x, this.y, this.size, this.size);
        // ctx.fillStyle = 'green';
        // ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    update() {
        if (this.frozen) {
            this.timefrozen++;
            if (this.timefrozen >= this.freezetimer) {
                this.frozen = false;
            }
        }
        if (!this.frozen) {
            let i = 0;
            for (let j = 0; j < zombiesR.length; j++) {
                let zombie = zombiesR[j];
                if (zombie === this) {
                    if (j == 0 && this.stopped) {
                        i++;
                    }
                    break;
                }
                if (this.x < zombie.x + zombie.size && this.x + this.size > zombie.x) {
                    i++;
                }
            }

            let count = 0;
            platforms.forEach(platform => {
                if (platform.x > player.x) {
                    count++;
                }
            });
            if (count == 0 && !dev) {
                i = 0;
            }

            if (i > 0) {
                // Zombie should stop and attack
                this.image = zombieAttackR;
                this.frameCount = 5;
                this.frameIndex += 0.25;

                let canMove = true;
                // Only the first zombie interacts with the platforms
                if (this == zombiesR[0]) {
                    platforms.forEach(platform => {
                        if ((!(this.x >= platform.x + platform.width)) && !(this.y > platform.y + platform.height)) {
                            if (1 || platform === getPlatformWithMaxXAndMinY(platforms)) {
                                getPlatformWithMaxXAndMinY(platforms).contactTimer++;
                                canMove = false;
                            }
                        }
                    });
                }

                if (this.frameIndex >= this.frameCount) {
                    this.frameIndex = 0;
                }

                // Attack player if in range
                if (this.x < player.x + player.width / 2 && this.x + this.size > player.x - player.width / 2 && player.y + player.height / 2 >= this.y) {
                    canMove = false;
                    player.attack++;
                }
                if (canMove && this == zombiesR[0]) {
                    i = 0;
                }
            }

            if (i == 0) {
                // Zombie can move
                this.image = zombieImageR;
                this.frameCount = 8;

                let canMove = true;
                if (platforms.length !== 0) {
                    platforms.forEach(platform => {
                        if (!(this.x >= platform.x + platform.width)) {
                            canMove = false;
                        }
                    });
                }
                if (this.x + this.size >= player.x - player.width / 2 && this.x <= player.x + player.width / 2 && player.y + player.height / 2 >= this.y) {
                    canMove = false;
                    dev = true;
                    player.attack++;
                }

                if (canMove) {
                    this.stopped = false;
                    this.x += this.speed;
                    this.frameIndex += 0.25;

                    if (this.frameIndex >= this.frameCount) {
                        this.frameIndex = 0;
                    }
                } else {
                    this.stopped = true;
                    this.frameIndex += 0.25;
                    if (this.frameIndex >= this.frameCount) {
                        this.frameIndex = 0;
                    }
                }
            }

            if (this.x < 0) {
                zombiesR.splice(zombiesR.indexOf(this), 1);
            }
        }
    }
}

class ClimberZombie {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.size = zombieSize / 1.5;
        this.speed = speed;
        this.climbSpeed = speed / 2; // Adjust climb speed as needed
        this.image = walkc;
        this.width = zombieSize * 4 / 9;
        this.height = zombieSize / 3;
        this.leftX = x + (zombieSize / 4);
        this.leftY = y + zombieSize / 1.5;
        this.level = 0;
        this.frozen = false;
        this.freezetimer = 100;
        this.timefrozen = 0;

        this.frameIndex = 0; // Start at the first frame
        this.frameCount = 10; // Total number of frames in the sprite sheet
        this.frameWidth = 96; // Width of each frame
        this.frameHeight = 96; // Height of each frame

        this.isClimbingUp = false;
        this.isMoving = true;
        this.climbDown = false;
        this.platformsCrossed = [];
    }

    draw() {
        let frameX;
        if (Number.isInteger(this.frameIndex)) {
            frameX = this.frameIndex * this.frameWidth;
        } else {
            frameX = this.frameWidth * Math.floor(this.frameIndex);
        }
        ctx.drawImage(this.image, frameX, 0,
            this.frameWidth, this.frameHeight, this.x, this.y, this.size * 1.5, this.size * 1.5);
        // ctx.beginPath();
        // ctx.rect(this.x + (this.size * 1.5 / 4), this.y + this.size, this.size / 1.5, this.size / 2);
        // ctx.stroke();
    }

    update() {
        if (this.frozen) {
            this.timefrozen++;
            if (this.timefrozen >= this.freezetimer) {
                this.frozen = false;
            }
        }
        if (!this.frozen) {
            this.checkCollisionWithPlayer();
            if (this.isMoving) {
                this.move();
            }
            this.frameIndex += 0.25;
            if (this.frameIndex >= this.frameCount) {
                this.frameIndex = 0;
            }
            if (this.x > canvas.width) {
                ClimberZombies.splice(ClimberZombies.indexOf(this), 1);
            }
        }
    }

    move() {
        if (this.isClimbingUp) {
            this.climb();
        }
        else if (this.climbDown) {
            this.down()
        }
        else {
            this.walk();
        }
    }

    walk() {
        let flag = true;
        if (this.level == 0) {
            platforms.forEach(platform => {
                if (this.isNearPlatform(platform)) {
                    if (platform.y == groundLevel - blockSize) {
                        flag = false;
                        this.isMoving = true;
                        this.isClimbingUp = true;
                        this.platformsCrossed.push(platform);
                    }
                    else {
                        flag = false;
                        this.isMoving = false;
                    }
                }
            });

            if (flag) {
                this.isMoving = true;
                this.x += this.speed;
                this.leftX += this.speed;
            }
        }

        else if (groundLevel - (this.leftY + this.height) > 1) {
            //console.log(this.platformsCrossed);
            let isfloating = true;
            platforms.forEach(platform => {
                if (this.leftY + this.height <= platform.y + platform.height &&
                    this.leftY + this.height >= platform.y &&
                    this.leftX + this.width > platform.x &&
                    this.leftX < platform.x + platform.width) {
                    isfloating = false;
                }
                if (platform.y - (this.leftY + this.height) < 1 && this.leftX >= platform.x + platform.width) {
                    if (this.platformsCrossed.length > 0) {
                        if (platform == this.platformsCrossed[this.platformsCrossed.length - 1]) {
                            this.climbDown = true;
                        }
                    }
                }
            });
            if (!this.climbDown) {
                platforms.forEach(platform => {
                    if (this.isNearPlatform(platform)) {
                        if (platform.y == groundLevel - (2 * blockSize) && this.level == 1) {
                            flag = false;
                            this.isClimbingUp = true;
                            this.platformsCrossed.push(platform);
                        }
                    }
                });
                if (flag) {
                    this.x += this.speed;
                    this.leftX += this.speed;
                }
            }
            if (isfloating) {
                //this.climbDown = true;
            }
        }
    }

    climb() {
        this.y -= this.climbSpeed; // Move up
        this.leftY -= this.climbSpeed;

        // Check if zombie has reached the top of the platform
        if (this.level == 1) {
            if (this.leftY + this.height <= (groundLevel - (2 * blockSize))) {
                this.isClimbingUp = false;
                this.level = 2;
            }
        }
        else if (this.level == 0) {
            if (this.leftY + this.height <= groundLevel - blockSize) {
                this.isClimbingUp = false;
                this.level = 1;
            }
        }
    }

    down() {
        this.y += this.climbSpeed;
        this.leftY += this.climbSpeed;
        if (this.leftY + this.height >= groundLevel) {
            this.level = 0;
            this.climbDown = false;
            console.log(this.climbDown);
        }
        if (this.level == 2) {
            if (this.hasReachedDown(this.platformsCrossed[this.platformsCrossed.length - 1])) {
                this.climbDown = false;
                this.level = 1;
                platforms.forEach(platform => {
                    let k = 0;
                    if (this.platformsCrossed.length > 0) {
                        this.platformsCrossed.forEach(crossed => {
                            if (platform == crossed) {
                                k++;
                            }
                        });
                    }
                    if (k == 0) {
                        if (platform.y == groundLevel - blockSize && platform.x - (this.leftX + this.width) < this.width / 2) {
                            this.platformsCrossed.push(platform);
                        }
                    }
                    else {
                        this.climbdown = true;
                        this.level = 1;
                    }
                });
            }
        }
        else if (this.level == 1) {
            if (this.y + this.size >= groundLevel) {
                this.climbDown = false;
                this.level = 0;
            }
        }
    }

    isNearPlatform(platform) {
        return (
            this.leftX + this.width > platform.x &&
            this.leftX < platform.x + platform.width
        );
    }

    hasReachedTop(platform) {
        return this.leftY <= platform.y - this.height;
    }

    hasReachedDown(platform) {
        return this.leftY + this.size > platform.y;
    }

    checkCollisionWithPlayer() {
        if (
            this.x + this.size > player.x &&
            this.x < player.x + player.width && player.y + player.height / 2 >= this.y
        ) {
            player.attack++;
            this.isMoving = false;
        }
        else {
            this.isMoving = true;
        }
    }
}


class ClimberZombieR {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.size = zombieSize / 1.5;
        this.speed = speed;
        this.climbSpeed = -speed / 2; // Adjust climb speed as needed
        this.image = Rwalkc;
        this.width = zombieSize * 4 / 9;
        this.height = zombieSize / 3;
        this.leftX = x + (zombieSize / 4);
        this.leftY = y + zombieSize / 1.5;
        this.level = 0;
        this.frozen = false;
        this.freezetimer = 10;
        this.timefrozen = 0;

        this.frameIndex = 0; // Start at the first frame
        this.frameCount = 10; // Total number of frames in the sprite sheet
        this.frameWidth = 96; // Width of each frame
        this.frameHeight = 96; // Height of each frame

        this.isClimbingUp = false;
        this.isMoving = true;
        this.climbDown = false;
        this.platformsCrossed = [];
    }

    draw() {
        let frameX;
        if (Number.isInteger(this.frameIndex)) {
            frameX = this.frameIndex * this.frameWidth;
        } else {
            frameX = this.frameWidth * Math.floor(this.frameIndex);
        }
        ctx.drawImage(this.image, frameX, 0,
            this.frameWidth, this.frameHeight, this.x, this.y, this.size * 1.5, this.size * 1.5);
        // ctx.beginPath();
        // ctx.rect(this.x + (this.size * 1.5 / 4), this.y + this.size, this.size / 1.5, this.size / 2);
        // ctx.stroke();
    }

    update() {
        if (this.frozen) {
            this.timefrozen++;
            if (this.timefrozen >= this.freezetimer) {
                this.frozen = false;
            }
        }
        if (!this.frozen) {
            this.checkCollisionWithPlayer();
            if (this.isMoving) {
                this.move();
            }
            this.frameIndex += 0.25;
            if (this.frameIndex >= this.frameCount) {
                this.frameIndex = 0;
            }
            if (this.x < 0) {
                ClimberZombies.splice(ClimberZombies.indexOf(this), 1);
            }
        }
    }

    move() {
        if (this.isClimbingUp) {
            this.climb();
        }
        else if (this.climbDown) {
            this.down()
        }
        else {
            this.walk();
        }
    }

    walk() {
        let flag = true;
        let isfloating = true;
        if (this.level == 0) {
            platforms.forEach(platform => {
                if (this.isNearPlatform(platform)) {
                    if (platform.y == groundLevel - blockSize) {
                        flag = false;
                        this.isMoving = true;
                        this.isClimbingUp = true;
                        this.platformsCrossed.push(platform);
                    }
                    else {
                        flag = false;
                        this.isMoving = false;
                    }
                }
            });
            if (flag) {
                this.isMoving = true;
                this.x += this.speed;
                this.leftX += this.speed;
            }
        }
        else if (groundLevel - (this.leftY + this.height) > 1) {
            //console.log(this.platformsCrossed);
            platforms.forEach(platform => {
                if (this.leftY + this.height <= platform.y + platform.height &&
                    this.leftY + this.height >= platform.y &&
                    this.leftX + this.width > platform.x &&
                    this.leftX < platform.x + platform.width) {
                    isfloating = false;
                }
                if (platform.y - (this.leftY + this.height) < 1 && this.leftX + this.width <= platform.x) {
                    if (this.platformsCrossed.length > 0) {
                        if (platform == this.platformsCrossed[this.platformsCrossed.length - 1]) {
                            this.climbDown = true;
                        }
                    }
                }
            });
            if (!this.climbDown) {
                platforms.forEach(platform => {
                    if (this.isNearPlatform(platform)) {
                        if (platform.y == groundLevel - (2 * blockSize) && this.level == 1) {
                            flag = false;
                            this.isClimbingUp = true;
                            this.platformsCrossed.push(platform);
                        }
                    }
                });
                if (flag) {
                    this.x += this.speed;
                    this.leftX += this.speed;
                }
            }
            if (isfloating) {
                //this.climbDown = true;
            }
        }
    }

    climb() {
        this.y -= this.climbSpeed; // Move up
        this.leftY -= this.climbSpeed;

        if (this.level == 1) {
            if (this.leftY + this.height <= (groundLevel - (2 * blockSize))) {
                this.isClimbingUp = false;
                this.level = 2;
            }
        }
        else if (this.level == 0) {
            if (this.leftY + this.height <= groundLevel - blockSize) {
                this.isClimbingUp = false;
                this.level = 1;
            }
        }
    }

    down() {
        this.y += this.climbSpeed;
        this.leftY += this.climbSpeed;
        if (this.leftY + this.height >= groundLevel) {
            this.level = 0;
            this.climbDown = false;
            console.log(this.climbDown);
        }
        if (this.level == 2) {
            if (this.hasReachedDown(this.platformsCrossed[this.platformsCrossed.length - 1])) {
                this.climbDown = false;
                this.level = 1;
                platforms.forEach(platform => {
                    let k = 0;
                    if (this.platformsCrossed.length > 0) {
                        this.platformsCrossed.forEach(crossed => {
                            if (platform == crossed) {
                                k++;
                            }
                        });
                    }
                    if (k == 0) {
                        if (platform.y == groundLevel - blockSize && platform.x + platform.width - (this.leftX) < this.width / 2) {
                            this.platformsCrossed.push(platform);
                        }
                    }
                    else {
                        this.climbdown = true;
                        this.level = 1;
                    }
                });
            }
        }
        else if (this.level == 1) {
            if (this.y + this.size >= groundLevel) {
                this.climbDown = false;
                this.level = 0;
            }
        }
    }

    isNearPlatform(platform) {
        return (
            this.leftX + this.width > platform.x &&
            this.leftX < platform.x + platform.width
        );
    }

    hasReachedTop(platform) {
        return this.y <= platform.y - this.size;
    }

    hasReachedDown(platform) {
        console.log(this.y + this.size);
        console.log(platform.y);
        return this.y + this.size > platform.y;
    }

    checkCollisionWithPlayer() {
        if (
            // this.x + this.size > player.x &&
            this.leftX <= player.x + player.width / 2 &&
            this.leftY + this.height >= player.y && player.y + player.height / 2 >= this.leftY
        ) {
            player.attack++;
            this.isMoving = false;
        }
        else {
            this.isMoving = true;
        }
    }
}


let ClimberZombies = [];
function createZombie() {
    const y = groundLevel - zombieSize;
    const zombie1 = new Zombie(0, y, zombieSpeed);
    zombies.push(zombie1);
    //zombies = zombies.filter
    if (zombies.length > 10) {
        zombies = zombies.filter(zombie => zombie.x > 0 && zombie.x < canvas.width);
    }
}

function createZombieR() {
    const y = groundLevel - zombieSize;
    const zombie2 = new ZombieR(canvas.width - zombieSize, y, -zombieSpeed);
    zombiesR.push(zombie2);
    if (zombiesR.length > 10) {
        zombiesR = zombiesR.filter(zombieR => zombieR.x > 0 && zombieR.x < canvas.width - zombieSize);
    }
}

function createClimber() {
    const y = groundLevel - zombieSize;
    const zombie1 = new ClimberZombie(0, y, zombieSpeed);
    ClimberZombies.push(zombie1);
    const zombie2 = new ClimberZombieR(canvas.width - zombieSize, y, -zombieSpeed);
    ClimberZombies.push(zombie2);
}

function createImmuneZombie() {
    const y = groundLevel - zombieSize;
    const zombie1 = new ImmuneZombie(0, y, zombieSpeed * 2);
    ImmuneZombies.push(zombie1);
}

function updateZombies() {
    zombies.forEach(zombie => zombie.update());
    zombiesR.forEach(zombie => zombie.update());
    ClimberZombies.forEach(zombieC => { zombieC.update() });
    ImmuneZombies.forEach(zombie => zombie.update());
}

function drawZombies() {
    zombies.forEach(zombie => zombie.draw());
    zombiesR.forEach(zombie => zombie.draw());
    ClimberZombies.forEach(zombieC => { zombieC.draw() });
    ImmuneZombies.forEach(zombie => zombie.draw());
}

class Player {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.velX = 0;
        this.velY = 0;
        this.isJumping = false;
        this.isGrounded = true;
        this.maxHealth = 1000;
        this.attack = 0;
        this.weapon = 1;
        this.gunImage = gun1;
        this.recoil = 0;
        this.recoilDuration = 5;
        this.image = playerSR;

        this.frameIndex = 0;
        this.frameCount = 40;
        this.frameWidth = 177;
        this.frameHeight = 400;
    }

    moveLeft() {
        this.velX = -this.speed;
    }

    moveRight() {
        this.velX = this.speed;
    }

    jump() {
        if (this.isGrounded) {
            this.velY = -20; // Jump strength
            this.isJumping = true;
            this.isGrounded = false;
        }
    }

    update() {
        this.frameIndex++;
        if (this.frameIndex > this.frameCount) {
            this.frameIndex = 0;
        }
        if (!jetpackActive) {
            if (this.y + this.height / 2 < groundLevel) {
                if (platforms.length > 0) {
                    platforms.forEach(platform => {
                        // Simple collision detection for platforms
                        if (!(player.y + player.height / 2 <= platform.y && player.y + player.height / 2 + player.velY >= platform.y && player.x + player.width / 2 >= platform.x && player.x - player.width / 2 <= platform.x + platform.width)) {
                            this.velY += gravity;
                            //console.log("added");
                            this.isGrounded = false;
                        }
                    });
                }
                else {
                    this.velY += gravity;
                    this.isGrounded = false;
                }

            } else {
                this.isJumping = false;
                this.isGrounded = true;
                this.y = groundLevel - this.height / 2;
            }

            if (this.y - this.height / 2 <= 0) {
                this.velY = gravity;
            }
        }
        else if (jetpackActive && jetpackUsedTime < jetpackLifetime) {
            if (this.y > jetpackMaxHeight) {
                this.y -= jetpackSpeed;
                console.log(this.y);
                jetpackUsedTime += 1000 / 60;
            } else {
                jetpackUsedTime += 1000 / 60;
            }
        } else {
            if (this.y < playerGroundY) {
                this.y += fallSpeed;
                console.log("bruhh");
            } else {
                this.y = playerGroundY;
                jetpackActive = false;
                jetpackUsedTime = 0;
            }
        }

        platforms.forEach(platform => {
            if (player.y + player.height / 2 <= platform.y && player.y + player.height / 2 + player.velY >= platform.y && player.x + player.width / 2 >= platform.x && player.x - player.width / 2 <= platform.x + platform.width) {
                this.velY = 0;
            }
        });

        let platformBlock = false;

        platforms.forEach(platform => {
            // Check if moving right
            if (this.velX > 0) {
                if (
                    this.x + this.width / 2 <= platform.x &&
                    this.x + this.width / 2 + this.velX > platform.x && this.y > platform.y - platform.height
                ) {
                    platformBlock = true;
                }
            }
            // Check if moving left
            else if (this.velX < 0) {
                if (this.x - this.width / 2 >= platform.x + platform.width &&
                    this.x - this.width / 2 + this.velX < platform.x + platform.width && this.y > platform.y - platform.height) {
                    platformBlock = true;
                    console.log(platform.x);
                    console.log(this.x);
                    console.log('');
                }
            }
        });

        let zombieBlock = false;

        zombies.forEach(zombie => {
            // Check if moving right
            if (this.velX > 0) {
                if (
                    this.x + this.width / 2 <= zombie.x &&
                    this.x + this.width / 2 + this.velX >= zombie.x &&
                    this.y + this.height > zombie.y &&
                    this.y < zombie.y + zombie.size
                ) {
                    zombieBlock = true;
                }
            }
            // Check if moving left
            else if (this.velX < 0) {
                if (
                    this.x - this.width / 2 >= zombie.x + zombie.size &&
                    this.x - this.width / 2 + this.velX <= zombie.x + zombie.size &&
                    this.y + this.height > zombie.y &&
                    this.y < zombie.y + zombie.size
                ) {
                    zombieBlock = true;
                }
            }
        });

        zombiesR.forEach(zombie => {
            // Check if moving right
            if (this.velX > 0) {
                if (
                    this.x + this.width / 2 <= zombie.x &&
                    this.x + this.width / 2 + this.velX >= zombie.x &&
                    this.y + this.height > zombie.y &&
                    this.y < zombie.y + zombie.size
                ) {
                    zombieBlock = true;
                }
            }
            // Check if moving left
            else if (this.velX < 0) {
                if (
                    this.x - this.width / 2 >= zombie.x + zombie.size &&
                    this.x - this.width / 2 + this.velX <= zombie.x + zombie.size &&
                    this.y + this.height > zombie.y &&
                    this.y < zombie.y + zombie.size
                ) {
                    zombieBlock = true;
                }
            }
        });

        if (!(platformBlock) && !(zombieBlock)) {
            this.x += this.velX;
        }

        if (!jetpackActive) {
            this.y += this.velY;
        }
        // Keep the player within the canvas 
        if (this.x - this.width / 2 < 0) {
            this.x = this.width / 2;
        } else if (this.x + this.width / 2 > canvas.width) {
            this.x = canvas.width - this.width / 2;
        }
        if (this.attack >= this.maxHealth) {
            // Mark this platform for destruction
            playerHistory.push([userName, score]);
            let jsonString = JSON.stringify(playerHistory);
            localStorage.setItem('Leaderboard', jsonString);
            showGameOverScreen();
            isPaused = true;
            gameOn = false;
        }
        if (this.recoil > 0) {
            this.recoil--;
        }
    }

    drawHealthBar(ctx) {
        const barWidth = 100;
        const barHeight = 10;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.height / 2 - 20;
        const healthRatio = (this.maxHealth - this.attack) / this.maxHealth;
        const filledWidth = barWidth * healthRatio;

        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = 'green';
        ctx.fillRect(barX, barY, filledWidth, barHeight);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    draw(ctx) {
        let frameX = this.frameWidth * this.frameIndex;
        ctx.drawImage(this.image, frameX, 0,
            this.frameWidth, this.frameHeight, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        this.drawHealthBar(ctx);
        // Draw the gun
        const angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
        const gunLength = 70;
        const gunWidth = 60;
        if (this.weapon == 1) {
            this.gunImage = gun1;
        }
        else if (this.weapon == 2) {
            this.gunImage = gun2;
        }
        else if (this.weapon == 3) {
            this.gunImage = gun3;
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        const recoilOffset = this.recoil > 0 ? -10 : 0;
        ctx.drawImage(this.gunImage, recoilOffset, -gunWidth / 2, gunLength, gunWidth);
        ctx.restore();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !jetpackActive && jetpackUsedTime < jetpackLifetime) {
        jetpackActive = true;
        console.log(jetpackActive);
    }
});

function showGameOverScreen() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'flex';
}
document.addEventListener("DOMContentLoaded", function () {
    const replayButton = document.getElementById("replayButton");
    replayButton.addEventListener("click", function () {
        resetGame();
    });
    const pauseButton = document.getElementById("pauseButton");
    pauseButton.addEventListener("click", function () {
        isPaused = true;
        document.getElementById("pausedScreen").style.display = "flex";
        //document.querySelector(".container").style.visibility = 'hidden';
        //console.log(document.querySelector(".container").style.visibility);
    });
});

document.getElementById("playButtonPaused").addEventListener("click", function () {
    isPaused = false;
    document.getElementById("pausedScreen").style.display = "none"; // Hide the paused screen
    gameLoop();
});

function resetGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'none';
    zombies = [];
    zombiesR = [];
    ClimberZombies = [];
    ImmuneZombies = [];
    platforms = [];
    traps = [];
    MinesPlaced = [];
    bgIndex = 0;
    tilesIndex = 0;
    zombieSpeed = 0.5;
    player.attack = 0;
    score = 0;
    Bullet2 = 20;
    bullet3 = 10;
    killed = 0;
    document.getElementById("score").innerText = score;
    dev = false;
    devL = false;
    for (let i = 0; i < setupBlocks.length; i++) {
        platforms.push(new Platform(setupBlocks[i].x, setupBlocks[i].y));
    }
    for (let j = 0; j < setupBlanks.length; j++) {
        traps.push(new trap(setupBlanks[j].x, setupBlanks[j].y));
    }
    for (let k = 0; k < setupBombs.length; k++) {
        MinesPlaced.push(new Miness(setupBombs[k].x, setupBombs[k].y))
    }
    player = new Player(canvas.width / 2, groundLevel, 66, 150, 5);
    powerUpManager = new PowerUp(canvas.width, canvas.height, player);
    //isPaused = false;
    //gameLoop();
}

var newBlasts = [];
var Bullet2 = 20;
var bullet3 = 10;
class Bullet {
    constructor(x, y, speedX, speedY, radius) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.radius = radius;
        this.path = [];
        this.automated = false;
        this.image = explosionBullet;
        this.blast = false;
        this.frames = 0;
    }

    update() {
        if (this.blast) {
            if (this.frames <= 7) {
                this.draw(ctx);
            }
            else {
                bullets.splice(bullets.indexOf(this), 1);
            }
            this.frames++;
        }
        else {
            this.x += this.speedX;
            this.y += this.speedY;
            if (player.weapon == 1 || player.weapon == 2 || this.automated) {
                this.speedY += gravity;
            }
            this.path.push({ x: this.x, y: this.y });
            let range = 3;
            if (player.weapon == 1) {
                range = 3;
            }
            else if (player.weapon == 2) {
                range = 1;
                //console.log("yess");
            }
            else if (player.weapon == 3) {
                range = 1;
            }
            if (this.automated) {
                range = 2;
            }
            //collision of bullet and zombies
            for (let i = zombies.length - 1; i >= 0; i--) {
                let zombie = zombies[i];
                if (this.x > zombie.x && this.x < zombie.x + zombie.size &&
                    this.y > zombie.y && this.y < zombie.y + zombie.size / range) {
                    if (player.weapon == 3) {
                        zombie.frozen = true;
                        this.blast = true;
                    }
                    else {
                        score++;
                        document.getElementById("score").innerText = score;
                        newBlasts.push(new Blast(this.x, this.y));
                        zombies.splice(i, 1);
                        //bullets.splice(bullets.indexOf(this), 1);
                        this.blast = true;
                        if (i == 0) {
                            if (devL) {
                                devL = false;
                            }
                        }
                    }
                    return;
                }
            }

            for (let i = zombiesR.length - 1; i >= 0; i--) {
                let zombieR = zombiesR[i];
                if (this.x > zombieR.x && this.x < zombieR.x + zombieR.size &&
                    this.y > zombieR.y && this.y < zombieR.y + zombieR.size / range) {
                    if (player.weapon == 3) {
                        zombieR.frozen = true;
                        this.blast = true;
                    }
                    else {
                        // Remove zombie and bullet upon collision
                        score++;
                        document.getElementById("score").innerText = score;
                        newBlasts.push(new Blast(this.x, this.y));
                        zombiesR.splice(i, 1);
                        //bullets.splice(bullets.indexOf(this), 1);
                        this.blast = true;
                        if (i == 0) {
                            if (dev) {
                                dev = false;
                            }
                        }
                    }
                    return;
                }
            }
            if (!this.automated) {
                for (let i = ClimberZombies.length - 1; i >= 0; i--) {
                    let zombie = ClimberZombies[i];
                    if (this.x > zombie.x && this.x < zombie.x + zombie.size &&
                        this.y > zombie.y && this.y < zombie.y + zombie.size) {
                        if (player.weapon == 3) {
                            zombie.frozen = true;
                            this.blast = true;
                        }
                        else {
                            // Remove zombie and bullet upon collision
                            score++;
                            document.getElementById("score").innerText = score;
                            newBlasts.push(new Blast(this.x, this.y));
                            ClimberZombies.splice(i, 1);
                            //bullets.splice(bullets.indexOf(this), 1);
                            this.blast = true;
                        }
                        return;
                    }
                }

                for (let i = ImmuneZombies.length - 1; i >= 0; i--) {
                    let zombie = ImmuneZombies[i];
                    if (this.x > zombie.x && this.x < zombie.x + zombie.size &&
                        this.y > zombie.y && this.y < zombie.y + zombie.size / range) {
                        if (player.weapon == 3) {
                            zombie.frozen = true;
                            this.blast = true;
                        }
                        else {
                            // Remove zombie and bullet upon collision
                            if (zombie.attack < 2) {
                                zombie.attack++;
                            }
                            if (zombie.attack == 2) {
                                score++;
                                document.getElementById("score").innerText = score;
                                ImmuneZombies.splice(i, 1);
                                Bullet2 = 20;
                                bullet3 = 10;
                                killed++;
                                if (killed == 3) {
                                    killed = 0;
                                    player.attack = 0;
                                }
                            }
                            newBlasts.push(new Blast(this.x, this.y));
                            //bullets.splice(bullets.indexOf(this), 1);
                            this.blast = true;
                        }
                        return;
                    }
                }
            }
        }
    }

    draw(ctx) {
        if (this.blast) {
            console.log('drownn ?');
            ctx.drawImage(
                this.image,
                307.42 * this.frames,
                0,
                307.42,
                350,
                this.x,
                this.y,
                50,
                50
            );
        }
        else {
            // Draw the path as a parabola
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            if (this.path.length > 1) {
                for (let i = 0; i < this.path.length - 1; i++) {
                    ctx.moveTo(this.path[i].x, this.path[i].y);
                    ctx.lineTo(this.path[i + 1].x, this.path[i + 1].y);
                }
            }
            ctx.stroke();
            ctx.closePath();

            // Draw the bullet
            ctx.setLineDash([]);
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }
    }
}

class Platform {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80; // Adjust platform width as needed
        this.height = 80; // Adjust platform height as needed
        this.contactTimer = 0; // Time in frames the platform has been in contact with a zombie
        this.destructionTime = 500;
        this.defensive = false;
    }

    draw(ctx) {
        // ctx.fillStyle = 'red';
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(obs, this.x, this.y, this.width, this.height);
        if (this.defensive) {
            const gunLength = 70;
            const gunWidth = 10;
            ctx.save();
            ctx.translate(this.x - this.height / 2, this.y + this.width / 2);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, -gunWidth / 2, gunLength, gunWidth);
            ctx.restore();
            // if (this.y == canvas.height - blockSize) {
            //     this.destructionTime = 200;
            // }
        }
    }
    update() {
        if (this.contactTimer >= this.destructionTime) {
            // Mark this platform for destruction
            if (this.defensive) {
                defenSet = false;
            }
            ClimberZombies.forEach(zombie => {
                if (zombie.platformsCrossed[zombie.platformsCrossed.length - 1] == this) {
                    if (zombie.level == 1) {
                        zombie.leftY = groundLevel - zombie.height;
                        zombie.y = groundLevel - zombieSize;
                        zombie.level = 1;
                    }
                    else if (zombie.level == 2) {
                        zombie.leftY = groundLevel - (blockSize + zombie.height);
                        zombie.y = groundLevel - 2 * zombieSize;
                        zombie.level = 0;
                    }
                }
            })
            return true;
        }
        return false;
    }
}

class trap {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 10;
        this.trapped = 0;
    }
    draw(ctx) {
        ctx.fillStyle = 'rgb(36,20,20)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }

    update() {
        for (let i = zombies.length - 1; i >= 0; i--) {
            let zombie = zombies[i];
            if (zombie.x + zombie.size >= this.x && zombie.x <= this.x + this.width) {
                // Remove zombie and bullet upon collision
                // score++;
                // document.getElementById("score").innerText = score;
                this.trapped++;
                zombies.splice(i, 1);
                return;
            }
        }

        for (let i = zombiesR.length - 1; i >= 0; i--) {
            let zombieR = zombiesR[i];
            if (this.x > zombieR.x && this.x < zombieR.x + zombieR.size) {
                this.trapped++;
                zombiesR.splice(i, 1);
                return;
            }
        }
        if (this.trapped == 4) {
            traps.splice(traps.indexOf(this), 1);
        }
    }
}

class Miness {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.image = bomb;
        this.activated = false;
    }
    draw(ctx) {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
    update() {
        if (this.activated) {
            if (this.x > player.x) {
                zombiesR = [];
                ClimberZombies = ClimberZombies.filter(zombie => { zombie.x < player.x });
            }
            else {
                zombies = [];
                ClimberZombies = ClimberZombies.filter(zombie => { zombie.x > player.x });
                ImmuneZombies = [];
            }
            MinesPlaced = [];
        }
    }
}

class PowerUp {
    constructor(canvasWidth, canvasHeight, player) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.player = player;
        this.powerUps = [];
    }

    generateRandomPowerUp() {
        const x = Math.random() * (this.canvasWidth - 30) + 15;
        const y = 0;
        const types = ['health', 'ammo', 'speed'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.powerUps.push({ x, y, size: 30, type, speed: 2 });
    }

    update() {
        powerUpManager.checkPlayerCollision();
        this.powerUps.forEach((powerUp, index) => {
            powerUp.y += powerUp.speed;
            if (powerUp.y - powerUp.size / 2 > groundLevel) {
                this.powerUps.splice(index, 1);
            }
        });
    }

    draw(ctx) {
        this.powerUps.forEach(powerUp => {
            ctx.fillStyle = this.getColor(powerUp.type);
            ctx.beginPath();
            ctx.arc(powerUp.x, powerUp.y, powerUp.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        });
    }

    getColor(type) {
        switch (type) {
            case 'health':
                return 'green';
            case 'ammo':
                return 'blue';
            case 'speed':
                return 'red';
            default:
                return 'white';
        }
    }

    checkPlayerCollision() {
        this.powerUps.forEach((powerUp, index) => {
            const distX = powerUp.x - this.player.x;
            const distY = powerUp.y - this.player.y;
            const distance = Math.sqrt(distX * distX + distY * distY);

            if (distance < powerUp.size / 2 + this.player.width / 2) {
                this.implementPowerup(powerUp.type);
                this.powerUps.splice(index, 1);
            }
        });
    }

    implementPowerup(type) {
        switch (type) {
            case 'health':
                player.attack = 0;
                break;
            case 'ammo':
                Bullet2 = 20;
                bullet3 = 10;
                break;
            case 'speed':
                zombieSpeed -= 0.5;
                break;
            default:
                break;
        }
    }
}


let player = new Player(canvas.width / 2, groundLevel, 66, 150, 5);
let powerUpManager = new PowerUp(canvas.width, canvas.height, player);
let bullets = [];
let mouse = { x: 0, y: 0 };
const playerGroundY = groundLevel - player.height / 2;
const jetpackLifetime = 10000;
let jetpackUsedTime = 0;
let jetpackActive = false;
const jetpackMaxHeight = 300;
const jetpackSpeed = 4;
const fallSpeed = 2;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
    shoot();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.image = playerRL;
        player.frameWidth = 340;
        player.width = 127.875;
        player.frameCount = 20;
        if (player.x < canvas.width / 3) {
            if (bgIndex >= -200) {
                bgIndex -= player.speed * 0.5;
                tilesIndex -= player.speed * 0.75;
                platforms.forEach(platform => {
                    platform.x += player.speed;
                })
                traps.forEach(trap => {
                    trap.x += player.speed;
                });
                MinesPlaced.forEach(mine => {
                    mine.x += player.speed;
                })
            }
            else {
                player.moveLeft();
            }
        }
        else {
            player.moveLeft();
        }
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        player.image = playerRR;
        player.frameWidth = 340;
        player.width = 127.875;
        player.frameCount = 20;
        if (player.x > 2 * canvas.width / 3) {
            if (bgIndex <= 200) {
                bgIndex += player.speed * 0.5;  // Adjust speed for parallax
                tilesIndex += player.speed * 0.75;  // Adjust speed for parallax
                platforms.forEach(platform => {
                    platform.x -= player.speed;
                });
                traps.forEach(trap => {
                    trap.x -= player.speed;
                });
                MinesPlaced.forEach(mine => {
                    mine.x -= player.speed;
                })
            }
            else {
                player.moveRight();
            }
        }

        else {
            player.moveRight();
        }
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
        player.jump();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd') {
        player.velX = 0;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.image = playerSR;
        player.frameWidth = 177;
        player.width = 66;
        player.frameCount = 40;
    }
    else if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.image = playerSL;
        player.frameWidth = 177;
        player.width = 66;
        player.frameCount = 40;
    }
});

function shoot(auto = false) {
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    const speed = 10;
    const speedX = Math.cos(angle) * speed;
    const speedY = Math.sin(angle) * speed;
    if (angle > -Math.PI / 2 && angle < Math.PI / 2) {
        player.image = playerSR;
    } else {
        player.image = playerSL;
    }
    let radius = 3;
    if (!auto) {
        if (player.weapon == 1) {
            radius = 3;
        }
        else if (player.weapon == 2) {
            radius = 5;
            Bullet2--;
        }
        else if (player.weapon == 3) {
            radius = 7;
            bullet3--;
        }
        if ((player.weapon == 2 && Bullet2 > 0) || player.weapon == 1 || (player.weapon == 3 && bullet3 > 0)) {
            if (player.weapon == 3) {
                const bullet = new Bullet(player.x, player.y - player.height / 5, speedX, speedY, radius);
                bullets.push(bullet);
            }
            else {
                const bullet = new Bullet(player.x, player.y, speedX, speedY, radius);
                bullets.push(bullet);
            }
            //bullets.push(bullet);
            player.recoil = player.recoilDuration;
        }
    }
    else {
        radius = 5;
        const bullet = new Bullet(getPlatformWithMinXAndMinY(platforms).x - blockSize / 2, getPlatformWithMinXAndMinY(platforms).y + blockSize / 2, -8, 0, radius);
        bullet.automated = true;
        bullets.push(bullet);
    }

}

class Blast {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.width = 100;
        this.height = 100;

        this.radius = this.width / 2;
        this.image = explosionBullet;
        this.frames = 0;
    }
    draw(ctx) {
        if (this.image) {
            console.log("drawing");
            ctx.drawImage(
                this.image,
                307.42 * this.frames,
                0,
                307.42,
                350,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
        else {
            console.log("image not forun");
        }
    }

    update(ctx) {
        this.frames++;
        //console.log(this.frames);
        if (this.frames <= 7) { this.draw(ctx) };
    }
}

function update() {
    player.update();
    bullets.forEach(bullet => bullet.update());
    // Remove bullets that are out of bounds
    bullets = bullets.filter(bullet => (bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height));

    // Update zombies
    zombies.forEach(zombie => { zombie.update() });
    zombiesR.forEach(zombieR => { zombieR.update() });
    ClimberZombies.forEach(zombieC => { zombieC.update() });
    ImmuneZombies.forEach(zombie => { zombie.update() });

    // Filter out zombies that are out of bounds
    zombies = zombies.filter(zombie => zombie.x > 0 && zombie.x < canvas.width);
    zombiesR = zombiesR.filter(zombieR => zombieR.x > 0 && zombieR.x < canvas.width - zombieSize);

    platforms = platforms.filter(platform => !platform.update());
    traps.forEach(trap => { trap.update() });
    MinesPlaced.forEach(Mine => {
        Mine.update();
    });
    powerUpManager.update();
    //powerUpManager.checkPlayerCollision();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, bgIndex, 0, backgroundImage.width, canvas.height, -200, 0, backgroundImage.width, canvas.height + 30);
    for (let i = -4; i < 1000; i++) {
        ctx.drawImage(tiles, i * tiles.width - tilesIndex, groundLevel, tiles.width, tiles.height);
    }
    bgCheck = true;

    platforms.forEach(platform => platform.draw(ctx));
    traps.forEach(trap => trap.draw(ctx));
    //console.log(MinesPlaced);
    MinesPlaced.forEach(Mine => {
        Mine.draw(ctx);
    });
    player.draw(ctx);
    updateZombies();
    drawZombies();
    bullets.forEach(bullet => bullet.draw(ctx));
    powerUpManager.draw(ctx);
}

const backgroundImage = new Image();
backgroundImage.src = './bg.png';
const tiles = new Image();
tiles.src = './tiles.png';
var bgIndex = 0;
var tilesIndex = 0;
var timeTaken = 0;

function gameLoop() {
    if (!isPaused) {
        timeTaken += 0.0625;
        zombieSpeed += 0.0002;
        if (bgIndex > 873) {
            bgIndex
        }
        //render();
        update();
        render();
        if (Number.isInteger(timeTaken) && timeTaken % 10 == 0) {
            if (defenSet) {
                shoot(true);
            }
        }
        platforms.forEach(platform => {
            // collision detection for platforms
            if (player.y + player.height / 2 <= platform.y && player.y + player.height / 2 + player.velY >= platform.y && player.x + player.width / 2 >= platform.x && player.x - player.width / 2 <= platform.x + platform.width) {
                player.velY = 0;
                player.isGrounded = true;
                player.y = platform.y - player.height / 2;
            }
        });
        if (Number.isInteger(timeTaken)) {
            //console.log('entered');
            if (timeTaken % 100 == 0) {
                powerUpManager.generateRandomPowerUp();
            }
            if (timeTaken % 30 == 0) {
                createClimber();
            }
            if (timeTaken % 60 == 0) {
                createImmuneZombie();
            }
            let i = 0;
            zombies.forEach(zombie => {
                if (zombie.stopped) {
                    i++;
                }
            })
            if (timeTaken % 10 == 0 && i == 0) {
                createZombie();
            }
            let j = 0;
            zombiesR.forEach(zombie => {
                if (zombie.stopped) {
                    j++;
                }
            })
            if (timeTaken % 10 == 0 && j == 0) {
                createZombieR();
            }
        }
    }
    requestAnimationFrame(gameLoop);
}

const nameInputContainer = document.getElementById('nameInputContainer');
const startGameButton = document.getElementById('startGameButton');
const nameInput = document.getElementById('nameInput');
var gameOn = false;
var defenSet = false;

// Image loading
const images = [
    './Walk.png',
    './walkR.png',
    './Attack_1.png',
    './AttackR.png',
    './gun11.png',
    './gun2.png',
    './gun3.png',
    './ImmuneZombie.png',
    './spriteStandRight.png',
    './spriteStandLeft.png',
    './spriteRunRight.png',
    './spriteRunLeft.png',
    './bomb.png',
    './tiles.png',
    './block.png',
    './bomb.png',
    './explosionBullet.png',
    './walkC.png',
    './RwalkC.png',
];

let loadedImages = 0;
const totalImages = images.length;

function startGame() {
    const playerName = nameInput.value.trim();
    if (playerName) {
        userName = playerName;
        console.log('Game started with player:', playerName);
        isPaused = false;
        gameOn = true;
        images.forEach(src => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                loadedImages++;
                if (loadedImages === totalImages) {
                    console.log('All images loaded, starting game loop.');
                    gameLoop();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
            };
        });

        //gameLoop();
        nameInputContainer.style.display = 'none';
        getPlatformWithMinXAndMinY(platforms).defensive = true;
        defenSet = true;
        // ctx.save();
        //canvas.width = 2000;
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;
        // groundLevel = canvas.height - 30;
        // ctx.restore();
    }
    else {
        alert('Please enter your name to start the game.');
    }
}

startGameButton.addEventListener('click', startGame);

replayButton.addEventListener('click', () => {
    // Show the name input container when replaying
    nameInputContainer.style.display = 'block';
});

window.onload = () => {
    //nameInputContainer.style.display = 'block';
    document.querySelector(".container").style.visibility = 'hidden';
    document.getElementById("controls").style.visibility = 'hidden';
    // inventoryCanvas.style.display = 'flex';
    canvas.height = window.innerHeight;
    inventoryCanvas.height = window.innerHeight;
    groundLevel = canvas.height - 30;
    inventoryCanvas.style.display = 'flex';
    drawInventory();
    bomb.onload = () => {
        obs.onload = () => {
            drawInventory();
        }
    };
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
};

document.getElementById('leaderboardButton').addEventListener('click', () => {
    console.log("entered");
    let scores = localStorage.getItem('Leaderboard');
    let data = JSON.parse(scores);
    data.sort((a, b) => b[1] - a[1]);
    const LeaderboardScreen = document.getElementById('LeaderboardScreen');
    LeaderboardScreen.style.display = 'flex';
    let content = '';
    for (score in data) {
        content += (`${data[score][0]}  :  ${data[score][1]}` + '\n');
    }
    document.getElementById("historyDisplay").innerText = content;
    isPaused = true;
})

document.getElementById("closeButton").addEventListener("click", function () {
    const LeaderboardScreen = document.getElementById('LeaderboardScreen');
    LeaderboardScreen.style.display = 'none';
    if (gameOn) {
        isPaused = false;
    }
    gameLoop();
})


let weapon1 = document.getElementById('weapon1');
let weapon2 = document.getElementById('weapon2');
let weapon3 = document.getElementById('weapon3');
let weapon4 = document.getElementById('bomb');

document.getElementById('weapon1').addEventListener('click', () => {
    player.weapon = 1;
    const weapons = document.querySelectorAll('.weapon');
    weapons.forEach(weapon => {
        weapon.classList.remove('used');
    });
    weapon1.classList.add('name');
});

document.getElementById('weapon2').addEventListener('click', () => {
    player.weapon = 2;
    const weapons = document.querySelectorAll('.weapon');
    weapons.forEach(weapon => {
        weapon.classList.remove('used');
    });
    weapon2.classList.add('name');
});

document.getElementById('weapon3').addEventListener('click', () => {
    player.weapon = 3;
    const weapons = document.querySelectorAll('.weapon');
    weapons.forEach(weapon => {
        weapon.classList.remove('used');
    });
    weapon2.classList.add('name');
});

document.getElementById('bomb').addEventListener('click', () => {
    MinesPlaced[0].activated = true;
    const weapons = document.querySelectorAll('.weapon');
    weapons.forEach(weapon => {
        weapon.classList.remove('used');
    });
    weapon4.classList.add('name');
});
