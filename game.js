import { COL, ROW, TILE_SIZE, TILE_SPACING, TWEEN_DURATION, LOCAL_STORAGE_NAME } from '../constant'

class MainScene extends Phaser.Scene {

    tileArray = [];
    canMove = false;
    score = 0; 
    bestScore = localStorage.getItem(LOCAL_STORAGE_NAME) == null ? 0 : localStorage.getItem(LOCAL_STORAGE_NAME); // 最高分数

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    preload() {
        this.load.image('tile_default', 'assets/sprites/tile_default.png');
        this.load.image('restart', 'assets/sprites/restart.png');
        this.load.image('score', 'assets/sprites/score.png');
        this.load.image('score_best', 'assets/sprites/score_best.png');

        this.load.spritesheet('tiles', 'assets/sprites/tiles.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });

        this.load.audio("move", ["assets/sounds/move.ogg", "assets/sounds/move.mp3"]);
        this.load.audio("grow", ["assets/sounds/grow.ogg", "assets/sounds/grow.mp3"]);
    }

    create() {
        this.layout();

        this.addTile();
        this.addTile();

        this.addEvent();

        this.addSound();

    }

    addSound() {
        this.moveSound = this.sound.add("move");
        this.growSound = this.sound.add("grow");
    }

    addEvent() {
 
        this.input.on("pointerup", this.handleTouch);

 
        this.input.keyboard.on("keydown", this.handleKey);
    }

    handleTouch = (e) => {

        if (this.canMove) {

 
            let swipeTime = e.upTime - e.downTime;

   
            let swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);

     
            let swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);

            let swipeNormal = new Phaser.Geom.Point(swipe.x / swipeMagnitude, swipe.y / swipeMagnitude);

            if (swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.y) > .8 || Math.abs(swipeNormal.x) > .8)) {
                let children = this.tileGroup.getChildren();
                if (swipeNormal.x > .8) {
                    for (var i = 0; i < children.length; i++) {

                        children[i].depth = game.config.width - children[i].x;
                    }
                    console.log
                    this.move(0, 1);
                }

                if (swipeNormal.x < -.8) {
                    for (var i = 0; i < children.length; i++) {

       
                        children[i].depth = children[i].x;
                    }
                    console.log
                    this.move(0, -1);
                }

                if (swipeNormal.y > .8) {
                    for (var i = 0; i < children.length; i++) {

      
                        children[i].depth = game.config.height - children[i].y;
                    }
                    console.log
                    this.move(1, 0);

                }

                if (swipeNormal.y < -.8) {
                    for (var i = 0; i < children.length; i++) {

        
                        children[i].depth = children[i].y;
                    }
                    console.log
                    this.move(-1, 0);
                }
            }
        }
    }


    handleKey = (e) => {

        if (this.canMove) {
            let children = this.tileGroup.getChildren();
            switch (e.code) {
                case "KeyA":
                case "ArrowLeft":
                    for (var i = 0; i < children.length; i++) {

  
                        children[i].depth = children[i].x;
                    }
                    console.log

           
                    this.move(0, -1);
                    break;
                case "KeyD":
                case "ArrowRight":
                    for (var i = 0; i < children.length; i++) {

                        children[i].depth = game.config.width - children[i].x;
                    }
                    console.log

        
                    this.move(0, 1);
                    break;
                case "KeyW":
                case "ArrowUp":
                    for (var i = 0; i < children.length; i++) {

                 
                        children[i].depth = children[i].y;
                    }
                    console.log

                 
                    this.move(-1, 0);
                    break;
                case "KeyS":
                case "ArrowDown":
                    for (var i = 0; i < children.length; i++) {

                 
                        children[i].depth = game.config.height - children[i].y;
                    }
                    console.log

                  
                    this.move(1, 0);
                    break;
            }
        }
    }


    
    move(rowStep, colStep) {
        this.canMove = false;
        this.movingTiles = 0;
        let somethingMoved = false;
        let moveScore = 0;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {

              
                let row = rowStep === 1 ? (3 - i) : i;
                let col = colStep === 1 ? (3 - j) : j;

                let tileValue = this.tileArray[row][col].tileValue;
                if (tileValue !== 0) {

      
                    let rowSteps = rowStep;

       
                    let colSteps = colStep;

                    
                    while (this.isInsideBoard(row + rowSteps, col + colSteps) && this.tileArray[row + rowSteps][col + colSteps].tileValue === 0) {
                        colSteps += colStep;
                        rowSteps += rowStep;
                    }

    
                    if (this.isInsideBoard(row + rowSteps, col + colSteps) &&
                        (this.tileArray[row + rowSteps][col + colSteps].tileValue === tileValue) &&
                        this.tileArray[row + rowSteps][col + colSteps].canUpgrade &&
                        this.tileArray[row][col].canUpgrade &&
                        tileValue < 12) {

                       
                        this.tileArray[row + rowSteps][col + colSteps].tileValue++;

                        moveScore += Math.pow(2, this.tileArray[row + rowSteps][col + colSteps].tileValue);

                        
                        this.tileArray[row + rowSteps][col + colSteps].canUpgrade = false;

                       
                        this.tileArray[row][col].tileValue = 0;

                      
                        this.moveTile(this.tileArray[row][col], row + rowSteps, col + colSteps, Math.abs(rowSteps + colSteps), true);
                        somethingMoved = true;
                    } else {

                        
                        rowSteps = rowSteps - rowStep;
                        colSteps = colSteps - colStep;

                        
                        if (colSteps !== 0 || rowSteps !== 0) {

                          
                            this.tileArray[row + rowSteps][col + colSteps].tileValue = tileValue;

                            
                            this.tileArray[row][col].tileValue = 0;

                           
                            this.moveTile(this.tileArray[row][col], row + rowSteps, col + colSteps, Math.abs(rowSteps + colSteps), false);
                            somethingMoved = true;
                        }
                    }
                }
            }
        }

        if (!somethingMoved) {
            this.canMove = true;
        } else {
            this.moveSound.play();
            this.score += moveScore;
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem(LOCAL_STORAGE_NAME, this.bestScore);
            }
        }
    }

   
    moveTile(tile, row, col, distance, changeNumber) {

        this.movingTiles++;
        this.tweens.add({
            targets: [tile.tileSprite],
            x: this.setPosition(col, COL),
            y: this.setPosition(row, ROW),
            duration: TWEEN_DURATION * distance,
            onComplete: () => {
                this.movingTiles--;
                if (changeNumber) {
                    this.transformTile(tile, row, col);
                }
                if (this.movingTiles === 0) {
                    this.scoreText.setText(this.score);
                    this.bestScoreText.setText(this.bestScore);
                    this.resetTiles();
                    this.addTile();
                }

            }
        })
    }

    transformTile(tile, row, col) {
        this.growSound.play();
        this.movingTiles++;
        tile.tileSprite.setFrame(this.tileArray[row][col].tileValue - 1);
        this.tweens.add({
            targets: [tile.tileSprite],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: TWEEN_DURATION,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.movingTiles--;
                if (this.movingTiles === 0) {
                    this.scoreText.setText(this.score);
                    this.bestScoreText.setText(this.bestScore);
                    this.resetTiles();
                    this.addTile();
                }
            }
        })
    }

    
    resetTiles() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.tileArray[i][j].canUpgrade = true;
                this.tileArray[i][j].tileSprite.x = this.setPosition(j, COL);
                this.tileArray[i][j].tileSprite.y = this.setPosition(i, ROW);
                if (this.tileArray[i][j].tileValue > 0) {
                    this.tileArray[i][j].tileSprite.alpha = 1;
                    this.tileArray[i][j].tileSprite.visible = true;

                    
                    this.tileArray[i][j].tileSprite.setFrame(this.tileArray[i][j].tileValue - 1);
                } else {
                    this.tileArray[i][j].tileSprite.alpha = 0;
                    this.tileArray[i][j].tileSprite.visible = false;
                }
            }
        }
    }



   
    layout() {

  
        this.layout_header();

        this.layout_body();
    }

    layout_header() {

   
        this.add.sprite(this.setPosition(0, COL) + 30, this.setPosition(0, ROW) - 100, 'score');


        this.add.sprite(this.setPosition(1, COL) + 40, this.setPosition(0, ROW) - 100, 'score_best');

        let restartButton = this.add.sprite(this.setPosition(3, COL) - 10, this.setPosition(0, ROW) - 87, "restart");
        restartButton.setInteractive();
        restartButton.on("pointerdown", () => {
            this.scene.start("MainScene");
        })

      
        this.scoreText = this.add.text(this.setPosition(0, COL) + 30, this.setPosition(0, ROW) - 90, '0', { fontFamily: 'Arial', fontSize: 22, fill: '#ffffff' }).setOrigin(.5);

    
        this.bestScoreText = this.add.text(this.setPosition(1, COL) + 40, this.setPosition(0, ROW) - 90, this.bestScore, { fontFamily: 'Arial', fontSize: 22, fill: '#ffffff' }).setOrigin(.5);
    }

    layout_body() {
        this.tileGroup = this.add.group();

        for (let i = 0; i < 4; i++) {
            this.tileArray[i] = [];
            for (let j = 0; j < 4; j++) {
                this.add.sprite(
                    this.setPosition(j, COL),
                    this.setPosition(i, ROW),
                    'tile_default');

                let tile = this.add.sprite(
                    this.setPosition(j, COL),
                    this.setPosition(i, ROW),
                    'tiles'
                );

                tile.alpha = 0;
                tile.visible = false;

                this.tileArray[i][j] = {
                    tileValue: 0,
                    tileSprite: tile,
                    canUpgrade: true
                }

                this.tileGroup.add(tile);
            }
        }
    }

    setPosition(pos, direction) {
        let top = direction === ROW ? 100 : 0;
        return pos * (TILE_SIZE + TILE_SPACING) + TILE_SIZE * .5 + TILE_SPACING + top;
    }

    addTile() {
        let emptyTiles = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.tileArray[i][j].tileValue === 0) {
                    emptyTiles.push({
                        row: i,
                        col: j
                    })
                }
            }
        }

        if (emptyTiles.length > 0) {
            let chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);
            this.tileArray[chosenTile.row][chosenTile.col].tileValue = 1;
            this.tileArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;
            this.tileArray[chosenTile.row][chosenTile.col].tileSprite.setFrame(0);

            this.tweens.add({
                targets: [this.tileArray[chosenTile.row][chosenTile.col].tileSprite],
                alpha: 1,
                duration: TWEEN_DURATION,
                onComplete: () => {
                    this.canMove = true;
                }
            });
        }
    }

    isInsideBoard(row, col) {
        return (row >= 0) && (col >= 0) && (row < 4) && (col < 4);
    }


}
